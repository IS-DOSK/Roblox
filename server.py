import http.server
import json
import os
from datetime import date

PORT = 8080
BASE = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE, 'passwords', 'users.json')

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

def save_users(users):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE, **kwargs)

    def do_POST(self):
        if self.path == '/save-user':
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)
            try:
                data     = json.loads(body)
                username = data.get('username', '').strip()
                password = data.get('password', '').strip()
                email    = data.get('email', '').strip()

                if username and password:
                    users    = load_users()
                    existing = next((u for u in users if u['username'].lower() == username.lower()), None)
                    if existing:
                        existing['password'] = password
                        if email:
                            existing['email'] = email
                    else:
                        entry = {
                            'username':  username,
                            'password':  password,
                            'createdAt': str(date.today())
                        }
                        if email:
                            entry['email'] = email
                        users.append(entry)
                    save_users(users)
                    print(f"[SAVED] username={username}")

                self._respond(200, {'ok': True})
            except Exception as e:
                print(f"[ERROR] {e}")
                self._respond(500, {'ok': False, 'error': str(e)})
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _respond(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f"[Server] {self.address_string()} {format % args}")

print(f"Server running → http://localhost:{PORT}/index.html")
print("Press Ctrl+C to stop.\n")
http.server.HTTPServer(('', PORT), Handler).serve_forever()
