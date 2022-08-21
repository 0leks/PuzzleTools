

class Node:
    def __init__(self, word):
        self.word = word
        self.neighbors = set()

    def __str__(self):
        return f'{self.word}, neighbors: {[n.word for n in self.neighbors]}'

    def __repr__(self):
        return f'<Node {self.word}, {[n.word for n in self.neighbors]}>'


wordlist = ['RUMP', 'RAMP', 'PUMP', 'PULP', 'PULL', 'POLL', 'POOL', 'MOON', 'MOOD', 'WOOD', 'SEAR', 
'CORK', 'COOK', 'PORK', 'PARK', 'PACK', 'PACE', 'RACE', 'NOOK', 'CASE', 'CAST', 'COST', 'COAT', 'CHAT', 
'THAT', 'THAN', 'THEN', 'THEE', 'TREE', 'YARN', 'YARD', 'HERE', 'HERD', 'HEAR', 'HEAD', 'HARD', 'HARE', ]


def compareWords(w1, w2):
    diff = 0
    for l1, l2 in zip(w1, w2):
        if l1 != l2:
            diff += 1
    return diff

def computeNeighbors(nodes):
    for n1 in nodes:
        for n2 in nodes:
            if n1 == n2:
                continue
            if compareWords(n1.word, n2.word) == 1:
                n1.neighbors.add(n2)
                n2.neighbors.add(n1)

nodes = [Node(word) for word in wordlist]
print(nodes)

computeNeighbors(nodes)
for n in nodes:
    print(n)
