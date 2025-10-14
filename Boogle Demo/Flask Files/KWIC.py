class Alphabetizer:
    #constructor
    def __init__(self, filteredShiftedLines = ""):
        self.filteredShiftedLines = filteredShiftedLines

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