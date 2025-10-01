from flask import Flask, jsonify, request
from flask_cors import CORS # For handling Cross-Origin Resource Sharing
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import KWIC

# Path to your downloaded service account key JSON file
cred = credentials.Certificate("boogle-demo-firebase-adminsdk-fbsvc-27fad66187.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://boogle-demo-default-rtdb.firebaseio.com/'  # Found in your Firebase Realtime Database console
})

# Add sentences to the DB
ref = db.reference('sentences')
ref.delete()
sentences_to_add = [
    "Jaws of Life",
    "The Life of the Party",
    "Long In The Tooth",
    "Don't Count Your Chickens Before They Hatch",
    "Every Cloud Has a Silver Lining",
    "Fit as a Fiddle",
    "Right Out of the Gate",
    "Back To the Drawing Board",
    "Break a Leg"
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
def submit_home_data():
    data = request.get_json()
    sentencesMsg = "\n".join(ref.get().values())
    all_circular_shifts = []
    for sentence in ref.get().values():
        all_circular_shifts += KWIC.CircularShift(sentence).shift()
    sorted_shifts = KWIC.Alphabetizer(all_circular_shifts).alphabetize()

    circShiftedMsg = "Next Row\n"
    words_to_ignore = ["a", "and", "as", "in", "is", "of", "on", "the", "to"]
    for line in all_circular_shifts:
        if line.split()[0].lower() not in words_to_ignore:
            circShiftedMsg = circShiftedMsg + "" + line + "\n"

    sortedMsg = "Next Row\n"
    for line in sorted_shifts:
        if line.split()[0].lower() not in words_to_ignore:
            sortedMsg = sortedMsg + "" + line + "\n"

    input_matches = []
    if (data['myInput'].strip() != ""):
        for line in sorted_shifts:
            if set(data['myInput'].strip().lower().split()).issubset(set(line.strip().lower().split())):
                for sentence in list(ref.get().values()):
                    if sorted(line.lower().split()) == sorted(sentence.lower().split()) and sentence not in input_matches:
                        input_matches.append(sentence)
                        break
    matchesMsg = "\n".join(input_matches)
    matchesMsg += "Next Row\n"

    return jsonify({"message": f"{matchesMsg}{sentencesMsg}{circShiftedMsg}{sortedMsg}"}), 200

@app.route('/api/submit2', methods=['POST'])
def submit_about_data():
    submitMsg = ""
    sentence_exists = False
    data = request.get_json()
    sentence = f"{data['myInput']}"
    if sentence.strip() == "":
        submitMsg = "Cannot add empty string to the database!\n"
    else:
        if ref.get():
            for db_sentence in ref.get().values():
                if sentence == db_sentence:
                    sentence_exists = True
                    break
        if not sentence_exists:
            ref.push().set(sentence)
            submitMsg = "The sentence \"" + data['myInput'] + "\" was successfully added to the database!\n"
        else:
            submitMsg = "The sentence \"" + data['myInput'] + "\" already exists in the database!\n"
    dbSentencesMsg = "\n".join(ref.get().values())
    return jsonify({"message": f"{submitMsg}DB Data:\n{dbSentencesMsg}"}), 200

if __name__ == '__main__':
    app.run(debug=True)