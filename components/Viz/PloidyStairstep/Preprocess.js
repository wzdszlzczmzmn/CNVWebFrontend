import * as d3 from "d3"
import {
    parseAllChromosomeGroupCNVMatrixToNodePairs,
    parseSingleChromosomeGroupCNVMatrixToNodePairs
} from "../Shared/PloidyStairstepParseToNode"

export const preprocessGroupedCNVMatrix = (groupedCNVMatrixCSV, chr) => {
    const groupedCNVMatrix = d3.csvParse(groupedCNVMatrixCSV, d3.autoType)

    if (chr !== 'All') {
        const columns = groupedCNVMatrix.columns.slice(1).filter(column => column.startsWith(chr + ':'))

        return Object.fromEntries(groupedCNVMatrix.map(
            groupedCNV => [groupedCNV['group'], parseSingleChromosomeGroupCNVMatrixToNodePairs(groupedCNV, columns)]
        ))
    } else {
        const columns = groupedCNVMatrix.columns.slice(1)

        return Object.fromEntries(groupedCNVMatrix.map(
            groupedCNV => [groupedCNV['group'], parseAllChromosomeGroupCNVMatrixToNodePairs(groupedCNV, columns)]
        ))
    }
}
