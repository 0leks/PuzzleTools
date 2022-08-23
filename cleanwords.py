
def compareWords(w1, w2):
    diff = 0
    for l1, l2 in zip(w1, w2):
        if l1 != l2:
            diff += 1
    return diff

def loadWords(filename):
    with open(filename) as f:
        wordSet = set()
        for line in f:
            words = line.strip().split(' ')
            for word in words:
                wordSet.add(word)
    return wordSet


words = loadWords('4letterwords.txt')

print(f'{len(words)} unique 4 letter words')
