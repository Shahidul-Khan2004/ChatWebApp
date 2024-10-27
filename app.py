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
FIREBASE_API_KEY = "AIzaSyAY6OYwufQqktf01Y4tkDQ3Tq5VzAkmeV8"
FIREBASE_PROJECT_ID = "chatwebapp-25f1f"
FIREBASE_AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"

# Flask routes
@app.route('/')
def home():
    if 'user' in session:
        return redirect('/chat')
    return render_template('login.html')


@app.route('/register', methods=['POST'])
def register():
    email = request.form['email']
    password = request.form['password']

    # Firebase API for user sign-up
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    register_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
    response = requests.post(register_url, json=payload)
    data = response.json()

    if 'idToken' in data:
        # Automatically log in after registration
        session['user'] = data['email']
        return redirect('/chat')
    return 'Registration Failed', 401

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
    
    # Fetch messages from Firestore
    messages_ref = db.collection('messages').stream()
    messages = [{'user': msg.get('user'), 'message': msg.get('message')} for msg in messages_ref]
    
    return render_template('chat.html', user=session['user'], messages=messages)


@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    user = session['user']

    # Store message in Firestore
    db.collection('messages').add({
        'user': user,
        'message': message
    })
    return redirect('/chat')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
