from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import KWIC

#Firebase Setup
cred = credentials.Certificate("boogle-demo-firebase-adminsdk-fbsvc-27fad66187.json")
    
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://boogle-demo-default-rtdb.firebaseio.com/'
})  

app = Flask(__name__)
CORS(app)

noise_filter = KWIC.NoiseFilter()

# Preload entries
def preload_entries():
    start_entries = [
        ("https://google.com", "Web Search Engine"),
        ("https://wikipedia.org", "Free online encyclopedia"),
        ("https://github.com", "Code hosting platform"),
        ("https://stackoverflow.com", "Programming questions answers"),
        ("https://youtube.com", "Video sharing website"),
        ("https://twitter.com", "Social media network"),
        ("https://amazon.com", "Online shopping store"),
        ("https://netflix.com", "Streaming entertainment service"),
        ("https://spotify.com", "Music streaming platform"),
        ("https://reddit.com", "Social news aggregation"),
        ("https://linkedin.com", "Professional networking site"),
        ("https://instagram.com", "Photo sharing application"),
        ("https://medium.com", "Online publishing platform"),
        ("https://quora.com", "Question answer community"),
        ("https://dropbox.com", "Cloud storage service"),
        ("https://trello.com", "Project management tool"),
        ("https://slack.com", "Team communication software"),
        ("https://zoom.us", "Video conferencing application"),
        ("https://airbnb.com", "Vacation rental marketplace"),
        ("https://uber.com", "Ride sharing service"),
        ("https://twitch.tv", "Live streaming platform")
    ]

    ref = db.reference("entries")
    ref.delete()

    for url, descriptor in start_entries:
        cleaned_descriptor = noise_filter.remove_noise(descriptor)
        shifts = KWIC.CircularShift(cleaned_descriptor).shift()
        shifts = KWIC.Alphabetizer(shifts).alphabetize()
        ref.push({
            "url": url,
            "descriptorOriginal": descriptor,
            "descriptorClean": cleaned_descriptor,
            "shifts": shifts
        })

preload_entries()

@app.route('/api/addEntry', methods=['POST'])
def add_entry():
    data = request.get_json()
    url = data.get("url", "").strip()
    descriptor = data.get("descriptor", "").strip()

    if not url or not descriptor:
        return jsonify({"message": "Missing URL or descriptor"}), 400

    cleaned_descriptor = noise_filter.remove_noise(descriptor)
    shifts = KWIC.CircularShift(cleaned_descriptor).shift()
    shifts = KWIC.Alphabetizer(shifts).alphabetize()

    ref = db.reference("entries")
    ref.push({
        "url": url,
        "descriptorOriginal": descriptor,
        "descriptorClean": cleaned_descriptor,
        "shifts": shifts
    })

    return jsonify({"message": "Entry added successfully!"}), 200

@app.route('/api/search', methods=['POST'])
def search_entries():
    data = request.get_json()
    query = data.get("query", "")
    page = int(data.get("page", 1))

    if query == "":
        return jsonify({"results": [], "totalPages": 1}), 200

    ref = db.reference("entries")
    all_entries = ref.get() or {}

    all_matched_shifts = []

    for entry_id, entry in all_entries.items():
        url = entry.get("url", "")
        shifts = entry.get("shifts", [])

        for s in shifts:
            parts = s.split()
            if len(parts) == 0 or parts[0] in noise_filter.noise_words:
                continue
            if query in s:
                all_matched_shifts.append({"shift": s, "url": url})

    all_matched_shifts.sort(key=lambda x: x["shift"].lower())

    # Pagination
    page_size = 10
    total_count = len(all_matched_shifts)
    totalPages = max(1, (total_count + page_size - 1) // page_size)
    page = max(1, min(page, totalPages))
    start = (page - 1) * page_size
    end = start + page_size
    paged = all_matched_shifts[start:end]

    return jsonify({"results": paged, "totalPages": totalPages, "totalResults": total_count}), 200

@app.route('/api/kwicIndex', methods=['GET'])
def kwic_index():
    ref = db.reference("entries")
    all_entries = ref.get() or {}
    all_shifts = []

    for entry_id, entry in all_entries.items():
        url = entry["url"]
        shifts = entry["shifts"]
        for s in shifts:
            first_word = s.split()[0]
            if first_word in noise_filter.noise_words:
                continue
            all_shifts.append((s, url))

    all_shifts.sort(key=lambda x: x[0].lower())
    output = [{"shift": s, "url": url} for (s, url) in all_shifts]
    return jsonify(output), 200

if __name__ == '__main__':
    app.run(debug=True)
