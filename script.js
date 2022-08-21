
function compareWords(w1, w2) {
    let diff = 0
    for (let i = 0; i < w1.length && i < w2.length; i++)
    {
        if (w1.charAt(i) != w2.charAt(i)) {
            diff += 1;
        }
    }
    diff += Math.abs(w1.length - w2.length);
    return diff
}

const MIN_WIDTH = 500;
const MIN_HEIGHT = 500;

const NODE_WIDTH = 60;
const NODE_HEIGHT = 30;

const FIXED_COLOR = "#0F0"
const REGULAR_COLOR = "#CCC"

function createGraph(words, specialwords, fixedwords) {
    let nodes = [];
    let links = [];
    for (let w of words) {
        let column = (nodes.length) % 10 + 1;
        let row = Math.floor(nodes.length / 10) + 1;
        let node = {word: w, x:column*(NODE_WIDTH + 20), y: row*(NODE_HEIGHT + 20), vx: 0, vy: 0, color: REGULAR_COLOR}
        if (w == 'STAR' || w == 'TREK') {
            node.fixed = true;
            node.color = FIXED_COLOR;
        }
        nodes.push( node );
    }

    for (let index1 = 0; index1 < nodes.length - 1; index1++) {
        let n1 = nodes[index1];
        for (let index2 = index1 + 1; index2 < nodes.length; index2++) {
            let n2 = nodes[index2];
            if (compareWords(n1.word, n2.word) == 1) {
                links.push({source: index1, target: index2})
                links.push({source: index2, target: index1})
            }
        }
    }
    return {nodes, links}
}

/*
RUMP RAMP PUMP PULP PULL POLL POOL MOON MOOD WOOD SEAR 
CORK COOK PORK PARK PACK PACE RACE NOOK CASE CAST COST COAT CHAT 
THAT THAN THEN THEE TREE YARN YARD HERE HERD HEAR HEAD HARD HARE 
NOON STAR TREK
VASE
*/

let DEFAULT_WORDS = ['RUMP', 'RAMP', 'PUMP', 'PULP', 'PULL', 'POLL', 'POOL', 'MOON', 'MOOD', 'WOOD', 'SEAR', 
'CORK', 'COOK', 'PORK', 'PARK', 'PACK', 'PACE', 'RACE', 'NOOK', 'CASE', 'CAST', 'COST', 'COAT', 'CHAT', 
'THAT', 'THAN', 'THEN', 'THEE', 'TREE', 'YARN', 'YARD', 'HERE', 'HERD', 'HEAR', 'HEAD', 'HARD', 'HARE', 
'NOON', 'STAR', 'TREK', 'VASE', 'BARN']

function loadWordsFromStorage() {
    let words = localStorage.getItem('words');
    if (!words) {
        words = DEFAULT_WORDS;
    }
    else {
        words = words.split(',');
    }
    document.getElementById("wordsarea").value = words.join(' ');
    return words;
}

function getWords() {
    wordstext = document.getElementById("wordsarea").value;
    let words = wordstext.split(/[,\s]+/).filter(word => word.length > 0);

    if (words.length == 0) {
        words = loadWordsFromStorage();
    }

    localStorage.setItem('words', words);
    return words;
}

let simulationsize = document.getElementById("sim").getBoundingClientRect();
let force = d3.layout.force()
    .size([simulationsize.width, simulationsize.height])

function resetSim() {
    d3.select('#sim').selectAll("svg").selectAll("*").remove();

    words = getWords()


    let {nodes, links} = createGraph(words);

    console.log(nodes);
    console.log(links);
    
    
    var svg = d3.select('#sim')
        .selectAll('svg')
        .attr('width', simulationsize.width)
        .attr('height', simulationsize.height);
    
    
    new ResizeObserver(
        () => {
            simulationsize = document.getElementById("sim").getBoundingClientRect();
            force.size([simulationsize.width, simulationsize.height])
        }
    ).observe(document.getElementById("sim"))
    
    
    force.nodes(nodes)
        .links(links);
    force.linkDistance(50);
    force.charge(-100)
    force.linkStrength(.8)
    force.chargeDistance(1000)
    force.gravity(.03)
    
    
    var link = svg.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');
    
function mouseover() {
    d3.select(this).select("rect").attr("stroke", "#000")
}
function mouseout(d) {
    d3.select(this).select("rect").attr("stroke", null)
}

function rightclick(d) {
    d3.select(this).select("rect").attr("fill", "#F00")
    d3.event.preventDefault();
}

function mousepress(d) {
    console.log(d)
    d.fixed = !d.fixed;
    d.color = d.fixed ? FIXED_COLOR : REGULAR_COLOR;
    d3.select(this).select("rect").attr("fill", d.color)
}

var nodegroups = svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append("g")
    .call(force.drag)
    .on('contextmenu', rightclick)
    .on('mouseover', mouseover)
    .on("mouseout", mouseout)
    // .on("mousedown", mousepress) // TODO figure out how to not break physics
    
    // var nodecircles = nodegroups
    //         .append('circle')
    //         .attr('class', 'node');
            
    var nodecircles = nodegroups
        .append('rect')
        .attr('class', 'nodeRect');
    
    var nodetext = nodegroups
            .append('text')
            .attr('class', 'nodetext');
    
function updatePositions() {
    
    // When this function executes, the force layout
    // calculations have concluded. The layout will
    // have set various properties in our nodes and
    // links objects that we can use to position them
    // within the SVG container.

    // First let's reposition the nodes. As the force
    // layout runs it updates the `x` and `y` properties
    // that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values. We also have to
    // give the node a non-zero radius so that it's visible
    // in the container.

    nodegroups
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    // nodecircles.attr('r', 20)
    //     .attr('cx', function(d) { return d.x; })
    //     .attr('cy', function(d) { return d.y; });
    nodecircles
        .attr('fill', d => d.color)
        .attr('x', -NODE_WIDTH/2)
        .attr('y', -NODE_HEIGHT/2)
        .attr('width', NODE_WIDTH)
        .attr('height', NODE_HEIGHT)
        .text(function(d) { return d.word})
    
    nodetext.text(function(d) { return d.word})
        .attr("y", "5")
        // .attr('y', function(d) { return d.y; });

    // We also need to update positions of the links.
    // For those elements, the force layout sets the
    // `source` and `target` properties, specifying
    // `x` and `y` values in each case.

    link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

}

    force.on('tick.end', updatePositions);
    
    updatePositions();
    force.start();
    force.stop();
}

function stopButton() {
    force.stop();
}

function resumeButton() {
    force.resume();
}

function resetButton() {
    resetSim();
}

resetSim();

