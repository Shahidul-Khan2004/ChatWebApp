from flask import Flask, render_template, request, redirect, session
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests

app = Flask(__name__)
app.secret_key = 'Key'

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Firebase API keys
FIREBASE_API_KEY = 'API_KEY'
FIREBASE_DATABASE_URL = 'DatabaseURL'
FIREBASE_AUTH_URL = 'AUTH_URL'

# Flask routes
@app.route('/')
def home():
    if 'user' in session:
        return redirect('/chat')
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        # Firebase registration
        registration_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(registration_url, json=payload)
        data = response.json()

        if 'idToken' in data:
            # Registration successful, log in the user automatically
            session['user'] = data['email']
            session['idToken'] = data['idToken']
            return redirect('/chat')
        return 'Registration Failed', 401

    return render_template('register.html')


@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    # Firebase authentication
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    response = requests.post(FIREBASE_AUTH_URL, json=payload)
    data = response.json()

    if 'idToken' in data:
        session['user'] = data['email']
        return redirect('/chat')
    return 'Login Failed', 401

@app.route('/chat')
def chat():
    if 'user' not in session:
        return redirect('/')
    
    # Fetch messages from Firebase Realtime Database
    response = requests.get(f"{FIREBASE_DATABASE_URL}/messages.json")
    messages = response.json() or {}
    messages_list = [{'user': msg['user'], 'message': msg['message']} for msg in messages.values()]

    
    return render_template('chat.html', user=session['user'], messages=messages_list)


@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    user = session['user']
    id_token = session['idToken']

    # Store message in Firebase Realtime Database
    payload = {
        'user': user,
        'message': message
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {id_token}'
    }
    requests.post(f"{FIREBASE_DATABASE_URL}/messages.json", json=payload, headers=headers)
    
    return redirect('/chat')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('idToken', None)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
