from flask import Flask, jsonify, request
from flask_cors import CORS # For handling Cross-Origin Resource Sharing
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# Path to your downloaded service account key JSON file
cred = credentials.Certificate("boogle-demo-firebase-adminsdk-fbsvc-65fa1a5094.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://boogle-demo-default-rtdb.firebaseio.com/'  # Found in your Firebase Realtime Database console
})

# Add sentences to the DB
ref = db.reference('sentences')
sentences_to_add = [
    "This is the second sentence.",
    "And this is the third sentence."
]
for sentence in sentences_to_add:
    sentence_exists = False
    if ref.get():
        for db_sentence in ref.get().values():
            if sentence == db_sentence:
                sentence_exists = True
                break
    if not sentence_exists:
        ref.push().set(sentence)

app = Flask(__name__)
CORS(app) # Enable CORS for your React app's origin

@app.route('/api/data', methods=['GET'])
def get_data():
    # Your Python logic to retrieve or process data
    data = {"message": "Hello from Python backend!"}
    return jsonify(data)

@app.route('/api/submit', methods=['POST'])
def submit_data():
    ''' received_data = request.json # Get JSON data from the request body
    # Process received_data
    response_data = {"status": "success", "received": received_data}
    return jsonify(response_data) '''
    data = request.get_json()
    myMessage = "Data Received: " + data['myInput'] + ". Data in Database:"
    for sentence in ref.get().values():
        myMessage = myMessage + " " + sentence
    myMessage += " Matches:"
    for sentence in ref.get().values():
        if data['myInput'] == sentence:
            myMessage = myMessage + " " + sentence
    return jsonify({"message": f"{myMessage}"}), 200

if __name__ == '__main__':
    app.run(debug=True)