class Alphabetizer:
    #constructor
    def __init__(self, shiftedSentence = ""):
        self.shiftedSentence = shiftedSentence

    #alphabitize the results of cirular shift
    def alphabetize(self):
        return sorted(self.shiftedSentence, key = str.lower)

class CircularShift:

    # constructor
    def __init__(self, sentence = ""):

        # public data members
        self.line = sentence
    
    # public function accessible by Input
    def setSentence(self, sentence = ""):
        self.line = sentence

    # Public Function to shift the words and returns a list of all possible shifts accessible by Alphabetizer
    def shift(self):
        res = []
        words = self.line.split()

        for i in range(len(words)):
            res.append(" ".join(words[i:len(words)]) + " " + " ".join(words[0: i]))
    
        return res
    
