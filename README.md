# 🧠 MindBridge

A student mental wellness tracker built with React and Python.

## Features

- 🔐 Secure login & signup with hashed passwords
- 🎯 Onboarding wizard to capture student preferences
- 📊 Daily wellness check-ins (mood, sleep, stress, energy)
- 📈 Visual analytics with SVG charts
- 📚 Resource hub with campus support links
- 🌙 Dark / Light mode toggle

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React (via CDN), Vanilla CSS        |
| Backend   | Python `http.server` (stdlib only)  |
| Database  | SQLite3 (via Python `sqlite3`)      |

## Getting Started

### Prerequisites
- Python 3.8+

### Run Locally

```bash
# Clone the repo
git clone https://github.com/Ramis63/MindBridge-Closed-Alpha-/tree/main
cd mindbridge

# Start the server (no pip install needed!)
python run.py
```

Then open your browser at: **http://localhost:8000**

## Project Structure

```
mindbridge/
├── index.html          # Main HTML entry point
├── run.py              # Python backend server + SQLite API
└── src/
    ├── App.js              # Main React coordinator
    ├── AuthForm.js         # Login & Sign Up forms
    ├── OnboardingWizard.js # New user preferences setup
    ├── CheckInForm.js      # Daily wellness check-in modal
    ├── Header.js           # Navigation bar & theme toggle
    ├── AnalyticsCharts.js  # SVG mood/sleep/stress charts
    ├── ResourceHub.js      # Wellness tips & campus support
    └── db.js               # API fetch client & session storage
```


