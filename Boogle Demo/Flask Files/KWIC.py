class Alphabetizer:
    #constructor
    def __init__(self, filteredShiftedLines = ""):
        self.filteredShiftedLines = filteredShiftedLines

<<<<<<< HEAD
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

=======
    # alphabitize the results of cirular shift
    def alphabetizeShifts(self):
        return sorted(self.filteredShiftedLines, key = str.lower)

class CircularShift:

    # constructor
    def __init__(self, lineStorageLines):

        # public data members
        self.lineStorageLines = lineStorageLines
    
    # public function accessible by Input
    def setLines(self, lineStorageLines):
        self.lineStorageLines = lineStorageLines

    # Public Function to shift the words and returns a list of all possible shifts accessible by Alphabetizer
    def computeCircularShifts(self):
        shifts = []
        for line in self.lineStorageLines:
            lineShifts = []
            words = line.split()

            for i in range(len(words)):
                lineShifts.append(" ".join(words[i:len(words)]) + " " + " ".join(words[0: i]))
            shifts.extend(lineShifts)
    
        return shifts
>>>>>>> 33a1c79f1a6149b829f0dc9659da338988e9d3a9
    
class NoiseEliminator:

    # constructor
    def __init__(self, circularShiftedLines = ""):

        # public data members
        self.circularShiftedLines = circularShiftedLines

    # Public Function to filter the circular shifted lines to remove filler words
    def eliminateNoise(self):
        res = []
        words_to_ignore = ["a", "and", "as", "in", "is", "of", "on", "the", "to"]
        
        for i in range(len(self.circularShiftedLines)):
            firstWord = self.circularShiftedLines[i].split()[0]
            if firstWord.lower() not in words_to_ignore:
                res.append(self.circularShiftedLines[i])
    
        return res