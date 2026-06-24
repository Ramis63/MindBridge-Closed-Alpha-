import http.server
import socketserver
import os
import json
import sqlite3
import hashlib
import uuid

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DIRECTORY, 'mindbridge.db')

def hash_password(password, salt=None):
    if not salt:
        salt = uuid.uuid4().hex
    # Secure SHA256 salting hash
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{hashed}:{salt}"

def verify_password(password, stored_hash_salt):
    try:
        hashed, salt = stored_hash_salt.split(':')
        return hash_password(password, salt).split(':')[0] == hashed
    except ValueError:
        return False

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # Create logs table with compound key on (user_email, date)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            user_email TEXT NOT NULL,
            date TEXT NOT NULL,
            mood INTEGER NOT NULL,
            energy INTEGER NOT NULL,
            sleep_hours REAL NOT NULL,
            sleep_quality TEXT NOT NULL,
            stress INTEGER NOT NULL,
            notes TEXT,
            tags TEXT,
            PRIMARY KEY (user_email, date)
        )
    ''')
    
    # Create settings table mapping settings to user_email
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            user_email TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("SQLite database initialized successfully at:", DB_FILE)

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

class DevelopmentHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/logs':
            self.handle_get_logs()
        elif self.path == '/api/settings':
            self.handle_get_settings()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/create-profile':
            self.handle_auth_signup()
        elif self.path == '/api/session':
            self.handle_auth_login()
        elif self.path == '/api/logs':
            self.handle_post_log()
        elif self.path == '/api/settings':
            self.handle_post_settings()
        else:
            self.send_error(404, "API endpoint not found")

    def send_json_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-User-Email')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def handle_auth_signup(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            email = body['email'].strip().lower()
            password = body['password']
            fname = body['firstName'].strip()
            lname = body['lastName'].strip()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                self.send_json_response(409, {'error': 'Email is already registered'})
                return
                
            pw_hash = hash_password(password)
            cursor.execute('''
                INSERT INTO users (email, first_name, last_name, password_hash)
                VALUES (?, ?, ?, ?)
            ''', (email, fname, lname, pw_hash))
            
            conn.commit()
            conn.close()
            
            self.send_json_response(200, {
                'user': {'email': email, 'firstName': fname, 'lastName': lname}
            })
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

    def handle_auth_login(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            email = body['email'].strip().lower()
            password = body['password']
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user_row = cursor.fetchone()
            conn.close()
            
            if not user_row or not verify_password(password, user_row['password_hash']):
                self.send_json_response(401, {'error': 'Invalid email or password'})
                return
                
            self.send_json_response(200, {
                'user': {
                    'email': user_row['email'],
                    'firstName': user_row['first_name'],
                    'lastName': user_row['last_name']
                }
            })
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

    def handle_get_logs(self):
        try:
            user_email = self.headers.get('X-User-Email')
            if not user_email:
                self.send_json_response(400, {'error': 'Missing identification header (X-User-Email)'})
                return
                
            user_email = user_email.strip().lower()
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM logs WHERE user_email = ? ORDER BY date DESC", (user_email,))
            rows = cursor.fetchall()
            
            logs = []
            for row in rows:
                logs.append({
                    'date': row['date'],
                    'mood': row['mood'],
                    'energy': row['energy'],
                    'sleepHours': row['sleep_hours'],
                    'sleepQuality': row['sleep_quality'],
                    'stress': row['stress'],
                    'notes': row['notes'],
                    'tags': json.loads(row['tags']) if row['tags'] else []
                })
            conn.close()
            self.send_json_response(200, logs)
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

    def handle_get_settings(self):
        try:
            user_email = self.headers.get('X-User-Email')
            if not user_email:
                self.send_json_response(400, {'error': 'Missing identification header (X-User-Email)'})
                return
                
            user_email = user_email.strip().lower()
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE user_email = ?", (user_email,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                settings = json.loads(row['value'])
            else:
                settings = {'theme': 'light', 'anonymousSharing': False}
            self.send_json_response(200, settings)
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

    def handle_post_log(self):
        try:
            user_email = self.headers.get('X-User-Email')
            if not user_email:
                self.send_json_response(400, {'error': 'Missing identification header (X-User-Email)'})
                return
                
            user_email = user_email.strip().lower()
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            entry = json.loads(post_data.decode('utf-8'))
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO logs (user_email, date, mood, energy, sleep_hours, sleep_quality, stress, notes, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_email,
                entry['date'],
                entry['mood'],
                entry['energy'],
                entry['sleepHours'],
                entry['sleepQuality'],
                entry['stress'],
                entry.get('notes', ''),
                json.dumps(entry.get('tags', []))
            ))
            conn.commit()
            conn.close()
            self.send_json_response(200, {'success': True, 'message': 'Log saved successfully'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

    def handle_post_settings(self):
        try:
            user_email = self.headers.get('X-User-Email')
            if not user_email:
                self.send_json_response(400, {'error': 'Missing identification header (X-User-Email)'})
                return
                
            user_email = user_email.strip().lower()
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            settings = json.loads(post_data.decode('utf-8'))
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO settings (user_email, value)
                VALUES (?, ?)
            ''', (user_email, json.dumps(settings)))
            conn.commit()
            conn.close()
            self.send_json_response(200, {'success': True, 'message': 'Settings saved successfully'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})

if __name__ == '__main__':
    init_db()
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DevelopmentHTTPRequestHandler) as httpd:
        print(f"Serving MindBridge with SQLite & Auth at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server.")
            httpd.server_close()
