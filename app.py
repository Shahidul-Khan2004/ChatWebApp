from flask import Flask, render_template, request, redirect, session
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests
import json
from datetime import datetime

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
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        # Firebase registration
        registration_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
        payload = {
            "displayName": name,
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(registration_url, json=payload)
        data = response.json()

        if 'idToken' in data:
            # Registration successful, log in the user automatically
            session['user'] = data['email']
            session['name'] = data['displayName']
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
    url = f"{FIREBASE_DATABASE_URL}/messages.json"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Convert the Firebase data into a list of dictionaries
        messages = [
            {
                'user': msg_data['user'],
                'message': msg_data['message'],
                'timestamp': msg_data['timestamp']
            }
            for msg_data in data.items()
        ]
        # Sort messages by timestamp
        messages.sort(key=lambda x: x['timestamp'])
    else:
        messages = []

    return render_template('chat.html', user=session['user'], messages=messages)


@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    user = session['name']
    id_token = session['idToken']

    # Store message in Firebase Realtime Database
    payload = {
        'user': user,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {id_token}'
    }
    response = requests.post(f"{FIREBASE_DATABASE_URL}/messages.json", json=payload, headers=headers)
    
    if response.status_code == 200:
        return redirect('/chat')
    else:
        return 'Failed to send message', 500

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('idToken', None)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
