class Alphabetizer:
    #constructor
    def __init__(self, shiftedSentence = ""):
        self.shiftedSentence = shiftedSentence

    #alphabitize the results of cirular shift
    def alphabetize(self):
        return sorted(self.shiftedSentence, key=lambda s: s.lower())

class CircularShift:
    #constructor
    def __init__(self, sentence=""):
        self.line = sentence
    #public function accessible by Input
    def setSentence(self, sentence=""):
        self.line = sentence
     #Public Function to shift the words and returns a list of all possible shifts accessible by Alphabetizer
    def shift(self):
        res = []
        words = self.line.split()

        for i in range(len(words)):
            shifted = words[i:] + words[:i]
            res.append(" ".join(shifted))

        return res

class NoiseFilter:
    def __init__(self, noise_words=None):
        if noise_words is None:
            noise_words = {"a", "the", "of", "and", "as", "in", "is", "on", "to"}
        self.noise_words = set(noise_words)

    def remove_noise(self, text):
        words = text.split()
        filtered = [w for w in words if w not in self.noise_words]
        return " ".join(filtered)

    
