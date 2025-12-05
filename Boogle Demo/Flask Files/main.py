from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import KWIC
import re
import ExpressionParser
#Firebase Setup
cred = credentials.Certificate("boogle-demo-firebase-adminsdk-fbsvc-27fad66187.json")
    
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://boogle-demo-default-rtdb.firebaseio.com/'
})  

app = Flask(__name__)
CORS(app)

noise_filter = KWIC.NoiseFilter()
url_pattern = re.compile(
    r'^https?://[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?\.(edu|com|org|net)$'
)

start_entries = [
    ("http://google.com", "Web Search Engine"),
    ("http://wikipedia.org", "Free online encyclopedia"),
    ("http://github.com", "Code hosting platform"),
    ("http://stackoverflow.com", "Programming questions answers"),
    ("http://youtube.com", "Video sharing website"),
    ("http://twitter.com", "Social media network"),
    ("http://amazon.com", "Online shopping store"),
    ("http://netflix.com", "Streaming entertainment service"),
    ("http://spotify.com", "Music streaming platform"),
    ("http://reddit.com", "Social news aggregation"),
    ("http://linkedin.com", "Professional networking site"),
    ("http://instagram.com", "Photo sharing application"),
    ("http://medium.com", "Online publishing platform"),
    ("http://quora.com", "Question answer community"),
    ("http://dropbox.com", "Cloud storage service"),
    ("http://trello.com", "Project management tool"),
    ("http://slack.com", "Team communication software"),
    ("http://zoom.us", "Video conferencing application"),
    ("http://airbnb.com", "Vacation rental marketplace"),
    ("http://uber.com", "Ride sharing service"),
    ("http://twitch.tv", "Live streaming platform")
]

# Preload entries
def preload_entries():

    ref = db.reference("entries")
    ref.delete()
    i = 1
    
   
    for url, descriptor in start_entries:
        ''' try:
            response1 = requests.get(url, allow_redirects=True, stream=True, timeout=8)
            response2 = requests.head(url, allow_redirects=True, timeout=8)
            if response1.status_code < 404 and response2.status_code < 404: '''
        cleaned_descriptor = noise_filter.remove_noise(descriptor)
        shifts = KWIC.CircularShift(cleaned_descriptor).shift()
        shifts = KWIC.Alphabetizer(shifts).alphabetize()
        ref.push({
            "url": url,
            "descriptorOriginal": descriptor,
            "descriptorClean": cleaned_descriptor,
            "shifts": shifts
        })
        i += 1
    ''' else:
                start_entries.remove((url, descriptor))
        except (requests.exceptions.RequestException, Exception):
            start_entries.remove((url, descriptor)) '''

preload_entries()

@app.route('/api/addEntry', methods=['POST'])
def add_entry():
    data = request.get_json()
    url = data.get("url", "").strip()
    descriptor = data.get("descriptor", "").strip()

    if not url or not descriptor:
        return jsonify({"message": "Missing URL or descriptor"}), 400
    if not url_pattern.match(url):
        return jsonify({"message": "Invalid URL format"}), 400
    cleaned_descriptor = noise_filter.remove_noise(descriptor)
    shifts = KWIC.CircularShift(cleaned_descriptor).shift()
    shifts = KWIC.Alphabetizer(shifts).alphabetize()

    ref = db.reference("entries")
    all_entries = ref.get() or {}
    for entry_id, entry in all_entries.items():
        url_entry = entry.get("url", "")
        shifts_entry = entry.get("descriptorOriginal", [])
        if url == url_entry:
            return jsonify({"message": "URL already exists in index!"}), 400
        if descriptor == shifts_entry:
            return jsonify({"message": "Descriptor already exists in index. Please change the descriptor."}), 400
    start_entries.append((url, descriptor))
    ref.push({
        "url": url,
        "descriptorOriginal": descriptor,
        "descriptorClean": cleaned_descriptor,
        "shifts": shifts
    })

    return jsonify({"message": "Entry added successfully!"}), 200

@app.route('/api/loadSearch', methods=['POST'])
def load_search_table():
    descriptor_list = [item[1] for item in start_entries]
    url_list = [item[0] for item in start_entries]
    all_entries = [{"shift": descriptor_list[i], "url": url_list[i]} for i in range(len(descriptor_list))]
    all_entries.sort(key=lambda x: x["shift"].lower())
    return jsonify(all_entries), 200

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

    symbols = [",", ".", "`", "!", "@", "#", "$", "^", "*", "(", ")", "-", "+", "{", "}", "[", "]", ":", ";", "'", "\"", "/", "<", ">", "?", "|"]
    filtered_query = query
    for symbol in symbols:
        filtered_query = filtered_query.replace(symbol, "")

    if "OR" not in filtered_query and "AND" not in filtered_query and "NOT" not in filtered_query:
        for entry_id, entry in all_entries.items():
            url = entry.get("url", "")
            shifts = entry.get("shifts", [])

            for s in shifts:
                parts = s.split()
                if len(parts) == 0 or parts[0] in noise_filter.noise_words:
                    continue
                if set(filtered_query.strip().split()) & set(parts):
                    valid_shift = False
                    for index, item in enumerate(start_entries):
                        if parts == item[1].split():
                            valid_shift = True
                            break
                    if valid_shift:
                        all_matched_shifts.append({"shift": s, "url": url})
    else:
        descriptor_list = [item[1] for item in start_entries]
        url_list = [item[0] for item in start_entries]
        result_indexes = ExpressionParser.ExpressionParser(filtered_query, descriptor_list).filter_descriptors()
        for index in result_indexes:
            all_matched_shifts.append({"shift": descriptor_list[index], "url": url_list[index]})

    all_matched_shifts.sort(key=lambda x: x["shift"].lower())

    # Pagination
    page_size = 8
    total_count = len(all_matched_shifts)
    totalPages = max(1, (total_count + page_size - 1) // page_size)
    ''' page = max(1, min(page, totalPages))
    start = (page - 1) * page_size
    end = start + page_size
    paged = all_matched_shifts[start:end] '''

    return jsonify({"results": all_matched_shifts, "totalPages": totalPages, "totalResults": total_count}), 200

@app.route('/api/remove', methods=['POST'])
def remove_entry():
    data = request.get_json()
    descriptor = data.get("descriptor", "").strip()
    url = data.get("url", "").strip()
    current_entries = []
    all_entries = start_entries
    all_entries.remove((url, descriptor))
    for index, item in enumerate(all_entries):
        current_entries.append({"shift": item[1], "url": item[0]})
    current_entries.sort(key=lambda x: x["shift"].lower())

    entriesRef = db.reference("entries")
    entries_items = entriesRef.get() or {}
    for entry_id, entry in entries_items.items():
        url_entry = entry["url"]
        if (url_entry == url):
            entriesRef.child(entry_id).delete()
            break

    return jsonify(current_entries), 200

@app.route('/api/getOptions', methods=['GET'])
def get_options():
    ref = db.reference("entries")
    all_entries = ref.get() or {}
    descriptor_list = []

    for entry_id, entry in all_entries.items():
        descriptor = entry["descriptorOriginal"]
        descriptor_list.append(descriptor)

    return jsonify({"options": descriptor_list}), 200

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
