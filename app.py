from flask import Flask, render_template, request, redirect, session
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'Key'
root_dir = os.path.dirname(os.path.abspath(__file__))
service_account_path = os.path.join(root_dir, 'serviceAccountKey.json')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Firebase API keys
FIREBASE_API_KEY = os.getenv('API_KEY')
FIREBASE_DATABASE_URL = os.getenv('DatabaseURL')
FIREBASE_PROJECT_ID = os.getenv('PROJECT_ID')
FIREBASE_AUTH_DOMAIN = os.getenv('AUTH_DOMAIN')
FIREBASE_STORAGE_BUCKET = os.getenv('STORAGE_BUCKET')
FIREBASE_MESSAGING_SENDER_ID = os.getenv('MESSAGING_SENDER_ID')
FIREBASE_APP_ID = os.getenv('APP_ID')
FIREBASE_MEASUREMENT_ID = os.getenv('MEASUREMENT_ID')

# Flask routes
@app.route('/')
def home():
    print("Session contents:", session)
    
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
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(registration_url, json=payload)
        data = response.json()

        if 'idToken' in data:
            # If registration is successful, update the user's display name
            id_token = data['idToken']
            refresh_token = data['refreshToken']
            update_url = f"https://identitytoolkit.googleapis.com/v1/accounts:update?key={FIREBASE_API_KEY}"
            update_payload = {
                "idToken": id_token,
                "displayName": name,
                "returnSecureToken": True
            }
            update_response = requests.post(update_url, json=update_payload)
            update_data = update_response.json()

            if 'displayName' in update_data:
                # Store the user in session after successful registration and profile update
                session['user'] = email
                session['name'] = update_data['displayName']
                session['idToken'] = id_token
                session['refreshToken'] = refresh_token 
                return redirect('/chat')
            else:
                return 'Failed to update display name', 400
            
        return redirect('/chat')
        
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
    response = requests.post(f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}", json=payload)
    data = response.json()

    if 'idToken' in data:
        session['user'] = data['email']
        session['name'] = data.get('displayName', 'user')
        session['idToken'] = data['idToken']
        session['refreshToken'] = data['refreshToken']
        return redirect('/chat')

    return 'Login Failed', 401

@app.route('/chat')
def chat():
    if 'user' not in session:
        return redirect('/')

    # Fetch messages from Firebase Realtime Database
    id_token = session['idToken']
    
    url = f"{FIREBASE_DATABASE_URL}messages.json?auth={id_token}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data:
            # Convert the Firebase data into a list of dictionaries
            messages = [
                {
                    'user': msg_data.get('user', 'Anonymous'),
                    'name': msg_data.get('name', 'Anonymous'),
                    'message': msg_data.get('message', ''),
                    'timestamp': msg_data.get('timestamp', '')
                }
                for msg_id, msg_data in data.items() if msg_data
            ]
        else:
            messages = []  # Initialize as an empty list if there's no data
    else:
        print(f"Failed to fetch messages. Status code: {response.status_code}")
        messages = []

    return render_template('chat.html', user=session.get('name', 'user'), messages=messages) 


@app.route('/send_message', methods=['POST'])
def send_message():
    # print("Session contents:", session)

    if 'idToken' not in session:
        return 'User is not authenticated', 401
    
    message = request.form.get['message']
    user = session['user']
    name = session['name']
    id_token = session['idToken']

    # Store message in Firebase Realtime Database
    payload = {
        'user': user,
        'name': name,
        'message': message,
        'timestamp': datetime.now().strftime('%d-%m-%Y at %I:%M:%S %p')
    }

    response = requests.post(f"{FIREBASE_DATABASE_URL}messages.json?auth={id_token}", json=payload)

    try:
        decoded_token = auth.verify_id_token(id_token)
        # print(f"Token verified: {decoded_token}")
    except Exception as e:
        print(f"Token verification failed: {str(e)}")


    # print("Response status code:", response.status_code, flush=True)
    # print("Response content:", response.content, flush=True)
    # response = requests.get(f"{FIREBASE_DATABASE_URL}messages.json?auth={id_token}")
    # print(f"GET Response Status Code: {response.status_code}", flush=True)
    # print(f"GET Response Content: {response.content}", flush=True)
    
    if response.status_code == 200:
        return redirect('/chat')
    else:
        return 'Failed to send message', 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

def refresh_id_token():
    refresh_token = session.get('refreshToken')
    refresh_url = f"https://securetoken.googleapis.com/v1/token?key={FIREBASE_API_KEY}"
    refresh_payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
    refresh_response = requests.post(refresh_url, data=refresh_payload)
    new_tokens = refresh_response.json()

    if 'id_token' in new_tokens:
        session['idToken'] = new_tokens['id_token']  
        session['refreshToken'] = new_tokens.get('refresh_token', refresh_token)  

    return new_tokens


if __name__ == '__main__':
    app.run(debug=True)
