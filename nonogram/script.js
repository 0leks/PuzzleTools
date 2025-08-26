
const NumRowsInput = document.getElementById("numrows");
const NumColsInput = document.getElementById("numcols");
const LabelDelimeterInput = document.getElementById("labeldelimeter");
const TopLabelsInput = document.getElementById("toplabels");
const SideLabelsInput = document.getElementById("sidelabels");
const svg = document.getElementById("result_display");

const InputParametersTextArea = document.getElementById("parameters");

const CELL_SIZE = 20;
const CELL_GAP = 2;
const LABEL_GROUP_DELIMETER = ' ';
const LABEL_ROW_DELIMETER = ',';

function ParseLabels(labels, delimeter)
{
    labels = labels.trim();

    if (labels.length == 0)
    {
        console.log("Empty labels");
        return;
    }

    rows = labels.split(delimeter);

    let allRows = [];
    for (const row of rows)
    {
        groups = row.trim().split(LABEL_GROUP_DELIMETER);
        let finalRow = [];
        for (const group of groups)
        {
            let value = parseInt(group.trim());
            finalRow.push(value);
        }
        if (finalRow.length > 0)
        {
            allRows.push(finalRow);
        }
    }

    return allRows;
}

function CheckSolve(toplabels, sidelabels, candidateGrid)
{
    console.log("candidateGrid: " + candidateGrid.toString(2));

    // check side label satisfaction
    for (let row = 0; row < sidelabels.length; row++)
    {
        const sidelabel = sidelabels[row];
        console.log("checking for " + sidelabel);
        let rowMask = 0b11111;
        console.log("rowMask: " + rowMask.toString(2));
        let rowValues = candidateGrid & rowMask;
        console.log("rowValues: " + rowValues.toString(2));
    }
}

function getPoss(groupIndex, slotsNeeded, groupsPlaced, startLocation, gridsize, groupSizes)
{
    let possibleLayouts = [];
    for (let groupLocation = startLocation; groupLocation <= gridsize - slotsNeeded[groupIndex]; groupLocation++)
    {
        const groupsPlacedNew = Array.from(groupsPlaced);
        groupsPlacedNew.push(groupLocation);

        if (groupIndex == groupSizes.length - 1)
        {
            // this is the last group
            possibleLayouts.push(groupsPlacedNew);
        }
        else
        {
            let otherPoss = getPoss(groupIndex + 1, slotsNeeded, groupsPlacedNew, groupLocation + groupSizes[groupIndex] + 1, gridsize, groupSizes);
            for (const poss of otherPoss)
            {
                possibleLayouts.push(poss);
            }
        }
    }
    return possibleLayouts;
}

function ComputePossibilities(labels, gridsize)
{
    const maxValue = 2 ** gridsize;

    let slotsNeeded = Array(labels.length);
    let totalSlotsUsed = 0;
    for (let groupIndex = labels.length - 1; groupIndex >= 0; groupIndex--)
    {
        totalSlotsUsed = totalSlotsUsed + labels[groupIndex];
        slotsNeeded[groupIndex] = totalSlotsUsed;
        totalSlotsUsed = totalSlotsUsed + 1;
    }

    let possibleLayouts = getPoss(0, slotsNeeded, [], 0, gridsize, labels);

    console.log(possibleLayouts);

    let converted = new Set();
    for (const possibleLayout of possibleLayouts)
    {
        let averages = Array(gridsize);
        for (let g = 0; g < gridsize; g++)
        {
            averages[g] = 0;
        }
        for (let groupIndex = 0; groupIndex < labels.length; groupIndex++)
        {
            let groupSize = labels[groupIndex];
            let groupLocation = possibleLayout[groupIndex];
            for (let g = 0; g < groupSize; g++)
            {
                averages[g + groupLocation] = 1;
            }
        }
        converted.add(averages);
    }

    return converted;
}

function* generateGrid(index)
{
    for(;;)
    {
        yield index;
        index++;
    }
}

function makeGrid(numRows, numCols)
{
    let grid = [];
    for (let row = 0; row < numRows; row++)
    {
        let row = Array(numCols).fill(0);
        grid.push(row);
    }
    return grid;
}

function getPrefilledCells(prefilled, sidePossibilities, topPossibilities)
{
    
}

function CrossReferencePossibleLayouts(numRows, numCols, sidePossibilities, topPossibilities)
{
    let grid = makeGrid(numRows, numCols);

    console.log("######### GRID #########");
    console.log(JSON.stringify(grid));
    let changes = true;
    for (let failsafe = 0; failsafe < 20 && changes; failsafe++)
    {
        changes = false;
        for (let col = 0; col < topPossibilities.length; col++)
        {
            let colPossibilities = topPossibilities[col];
            for (let row = 0; row < numRows; row++)
            {
                let colPossibilitiesIterator = colPossibilities.values();
                let firstPoss = colPossibilitiesIterator.next().value;
                let value = firstPoss[row];
                let isValueSameInAllPossibilities = true;
                for (const poss of colPossibilitiesIterator)
                {
                    if (poss[row] != value)
                    {
                        isValueSameInAllPossibilities = false;
                        break;
                    }
                }
                if (isValueSameInAllPossibilities)
                {
                    let newGridValue = 2 - value;
                    if (grid[row][col] != newGridValue)
                    {
                        grid[row][col] = newGridValue;
                        changes = true;
                        // remove invalid possibilities
                        console.log("(" + col + "," + row + ") = " + value);
                        console.log("pruning now invalid side possibilities");
                        if (row >= sidePossibilities.length)
                        {
                            console.log("Cant prune because it is not specified");
                        }
                        else
                        {
                            let invalid = [];
                            for (const poss of sidePossibilities[row])
                            {
                                if (poss[col] != value)
                                {
                                    console.log("invalid layout for row " + row);
                                    console.log(poss);
                                    invalid.push(poss);
                                }
                            }
                            for (let inval of invalid)
                            {
                                sidePossibilities[row].delete(inval);
                            }
                        }
                    }
                }
            }
        }

        console.log("######### GRID #########");
        let index = 0;
        for (let row of grid)
        {
            console.log(index + ":" + JSON.stringify(row));
            index++;
        }

        for (let row = 0; row < sidePossibilities.length; row++)
        {
            let rowPossibilities = sidePossibilities[row];
            
            for (let col = 0; col < numCols; col++)
            {
                let rowPossibilitiesIterator = rowPossibilities.values();
                let firstPoss = rowPossibilitiesIterator.next().value;
                let value = firstPoss[col];
                let isValueSameInAllPossibilities = true;
                for (const poss of rowPossibilitiesIterator)
                {
                    if (poss[col] != value)
                    {
                        isValueSameInAllPossibilities = false;
                        break;
                    }
                }
                if (isValueSameInAllPossibilities)
                {
                    let newGridValue = 2 - value;
                    if (grid[row][col] != newGridValue)
                    {
                        grid[row][col] = newGridValue;
                        changes = true;
                        console.log("(" + col + "," + row + ") = " + value);
                        // remove invalid possibilities
                        console.log("pruning now invalid top possibilities");
                        if (col >= topPossibilities.length)
                        {
                            console.log("Cant prune because it is not specified");
                        }
                        else
                        {
                            let invalid = [];
                            for (const poss of topPossibilities[col])
                            {
                                if (poss[row] != value)
                                {
                                    console.log("invalid layout for col " + col);
                                    console.log(poss);
                                    invalid.push(poss);
                                }
                            }
                            for (let inval of invalid)
                            {
                                topPossibilities[col].delete(inval);
                            }
                        }
                    }
                }
            } 
        }
    }




    console.log("######### GRID #########");
    console.log(grid);
    return grid;


    let validCombinations = [];

    let sideIndexs = Array(sidePossibilities.length).fill(0);
    let topIndexs = Array(topPossibilities.length).fill(0);

    let checking = true;
    let failsafe = 0;
    while (checking && failsafe < 30000)
    {
        failsafe++;
        console.log("############## ITERATION " + failsafe + " ##############");
        console.log("topIndexs: " + topIndexs);
        console.log("sideIndexs: " + sideIndexs);
        // check passing
        let passing = true;
        for (let row = 0; row < sidePossibilities.length && passing; row++)
        {
            let rowLayout = sidePossibilities[row][sideIndexs[row]];
            // console.log("row[" + row + "]: " + rowLayout);
            for (let col = 0; col < topPossibilities.length && passing; col++)
            {
                let colLayout = topPossibilities[col][topIndexs[col]];
                // console.log("col[" + col + "]: " + colLayout);
                if (rowLayout[col] != colLayout[row])
                {
                    passing = false;
                    break;
                }
            }
        }
        if (passing)
        {
            console.log("Found a valid arrangement!");
            let gridrows = [];
            for (let row = 0; row < sidePossibilities.length; row++)
            {
                let rowLayout = sidePossibilities[row][sideIndexs[row]];
                gridrows.push(rowLayout);
            }
            let gridcols = [];
            for (let col = 0; col < topPossibilities.length; col++)
            {
                let colLayout = topPossibilities[col][topIndexs[col]];
                gridcols.push(colLayout);
            }
            let combo = {
                'side': sideIndexs,
                'top': topIndexs,
                'gridrows': gridrows,
                'gridcols:': gridcols
            };
            validCombinations.push(combo);
        }

        // increment
        let done = false;
        let incrementSlot = 0;
        while (!done)
        {
            if (incrementSlot < topIndexs.length) {
                topIndexs[incrementSlot]++;
                if (topIndexs[incrementSlot] >= topPossibilities[incrementSlot].length)
                {
                    topIndexs[incrementSlot] = 0;
                    incrementSlot++;
                }
                else
                {
                    done = true;
                    break;
                }
            }
            else if (incrementSlot - topIndexs.length < sideIndexs.length)
            {
                sideIndexs[incrementSlot - topIndexs.length]++;
                if (sideIndexs[incrementSlot - topIndexs.length] >= sidePossibilities[incrementSlot - topIndexs.length].length)
                {
                    sideIndexs[incrementSlot - topIndexs.length] = 0;
                    incrementSlot++;
                }
                else
                {
                    done = true;
                    break;
                }
            }
            else
            {
                // no solution
                console.log("no solution");
                checking = false;
                done = true;
                break;
            }
        }
    }
    console.log(validCombinations);
    return validCombinations;
}

function SizeChanged()
{
    let parameters = JSON.parse(InputParametersTextArea.value)
    console.log(parameters);
    let numRows = parameters.rows;
    let numCols = parameters.cols;
    
    // let numRows = parseInt(NumRowsInput.value);
    // let numCols = parseInt(NumColsInput.value);

    let toplabels = ParseLabels(parameters.topLabels, parameters.outerDelimeter, parameters.innerDelimeter);
    let sidelabels = ParseLabels(parameters.sideLabels, parameters.outerDelimeter, parameters.innerDelimeter);

    let sidePossibilities = [];
    for (let row = 0; row < sidelabels.length; row++)
    {
        sidePossibilities.push(ComputePossibilities(sidelabels[row], numCols));
    }

    let topPossibilities = [];
    for (let col = 0; col < toplabels.length; col++)
    {
        topPossibilities.push(ComputePossibilities(toplabels[col], numRows));
    }

    console.log("sidePossibilities: ");
    console.log(sidePossibilities);
    console.log("topPossibilities: ");
    console.log(topPossibilities);

    let validCombinations = [];

    let grid = CrossReferencePossibleLayouts(numRows, numCols, sidePossibilities, topPossibilities);
    console.log(grid);

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    
    let maxTopLabels = 0;
    for (let c = 0; c < toplabels.length; c++)
    {
        if (toplabels[c].length > maxTopLabels)
        {
            maxTopLabels = toplabels[c].length;
        }
    }
    
    let maxSideLabels = 0;
    for (let r = 0; r < sidelabels.length; r++)
    {
        if (sidelabels[r].length > maxSideLabels)
        {
            maxSideLabels = sidelabels[r].length;
        }
    }

    let X_OFFSET = maxSideLabels * (CELL_SIZE + CELL_GAP) + CELL_GAP;
    let Y_OFFSET = maxTopLabels * (CELL_SIZE + CELL_GAP) + CELL_GAP;
    let totalHeight = grid.length * (CELL_SIZE + CELL_GAP) + Y_OFFSET;
    if (totalHeight == 0) {
        totalHeight = 500;
    }
    svg.setAttribute("height", totalHeight);
    for (let c = 0; c < toplabels.length; c++)
    {
        let labels = toplabels[c];
        let y = Y_OFFSET - CELL_GAP;
        for (let i = labels.length - 1; i >= 0; i--)
        {
            var newSquare = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            newSquare.setAttribute("x", X_OFFSET + (c * (CELL_SIZE + CELL_GAP) + CELL_SIZE/3));
            newSquare.setAttribute("y", y);
            newSquare.innerHTML = "" + labels[i];
            svg.appendChild(newSquare);

            y = y - (CELL_SIZE + CELL_GAP);
        }
    }
    for (let r = 0; r < sidelabels.length; r++)
    {
        let labels = sidelabels[r];
        let x = X_OFFSET - CELL_GAP - CELL_SIZE*2/3;
        for (let i = labels.length - 1; i >= 0; i--)
        {
            var newSquare = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            newSquare.setAttribute("x", x);
            newSquare.setAttribute("y", Y_OFFSET + (r * (CELL_SIZE + CELL_GAP) + CELL_SIZE*3/4));
            newSquare.innerHTML = "" + labels[i];
            svg.appendChild(newSquare);

            x = x - (CELL_SIZE + CELL_GAP);
        }
    }

    for (let c = 0; c < numCols; c++)
    {
        for (let r = 0; r < numRows; r++)
        {
            let grayValue = 120;
            if (r < grid.length && c < grid[r].length)
            {
                if (grid[r][c] == 1)
                {
                    grayValue = 0;
                }
                else if (grid[r][c] == 2)
                {
                    grayValue = 255;
                }
                else
                {
                    grayValue = 120;
                }
            }
            if (validCombinations.length > 0)
            {
                grayValue = (1-validCombinations[0]['gridrows'][r][c]) * 255;
            }
            let color = "rgb(" + grayValue + "," + grayValue + "," + grayValue + ")";

            var newSquare = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            newSquare.setAttribute("x","" + (X_OFFSET + c * (CELL_SIZE + CELL_GAP)));
            newSquare.setAttribute("y","" + (Y_OFFSET + r * (CELL_SIZE + CELL_GAP)));
            newSquare.setAttribute("width", CELL_SIZE);
            newSquare.setAttribute("height", CELL_SIZE);
            newSquare.setAttribute("fill", color);
            svg.appendChild(newSquare);
        }
    }
}

SizeChanged();
