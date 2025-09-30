from config import db

class sentence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(999), unique = False, nullable = False)
    permutation = db.Column(db.String(9999), unique = False, nullable = False)

    def to_json(self):
        return{
            "id": self.id,
            "url": self.url,
            "permutation": self.permutation,
        }