import sqlite3
import os

DB_FILE = 'mindbridge.db'

def inspect_database():
    if not os.path.exists(DB_FILE):
        print(f"Database file '{DB_FILE}' not found. Run the server first to initialize it.")
        return

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("=" * 60)
    print("                MINDBRIDGE DATABASE INSPECTOR")
    print("=" * 60)

    # 1. Inspect Users Table
    print("\n[USERS TABLE]")
    try:
        users = cursor.execute("SELECT email, first_name, last_name, password_hash FROM users").fetchall()
        if not users:
            print("  (No users registered yet)")
        for idx, u in enumerate(users, 1):
            print(f"  {idx}. Email: {u['email']}")
            print(f"     Name:  {u['first_name']} {u['last_name']}")
            print(f"     Hash:  {u['password_hash'][:40]}... (truncated)")
    except sqlite3.OperationalError as e:
        print(f"  Error reading users table: {e}")

    # 2. Inspect Logs Table
    print("\n[LOGS TABLE]")
    try:
        logs = cursor.execute("SELECT user_email, date, mood, energy, sleep_hours, sleep_quality, stress, tags FROM logs ORDER BY date DESC").fetchall()
        if not logs:
            print("  (No mood log entries recorded yet)")
        for idx, l in enumerate(logs, 1):
            print(f"  {idx}. Date:   {l['date']} | User: {l['user_email']}")
            print(f"     Mood:   {l['mood']}/5 | Energy: {l['energy']}/5 | Stress: {l['stress']}/5")
            print(f"     Sleep:  {l['sleep_hours']} hrs ({l['sleep_quality']})")
            print(f"     Tags:   {l['tags']}")
    except sqlite3.OperationalError as e:
        print(f"  Error reading logs table: {e}")

    # 3. Inspect Settings Table
    print("\n[SETTINGS TABLE]")
    try:
        settings = cursor.execute("SELECT user_email, value FROM settings").fetchall()
        if not settings:
            print("  (No settings rows saved yet)")
        for idx, s in enumerate(settings, 1):
            print(f"  {idx}. User:  {s['user_email']}")
            print(f"     Value: {s['value']}")
    except sqlite3.OperationalError as e:
        print(f"  Error reading settings table: {e}")

    print("\n" + "=" * 60)
    conn.close()

if __name__ == '__main__':
    inspect_database()
