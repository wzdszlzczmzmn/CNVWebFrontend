import { hg38ChromosomeStartPositions } from "../../../const/ChromosomeInfo"

export const parseAllChromosomeGroupCNVMatrixToNodePairs = (groupedCNV, columns) => {
    let { nodePairs, prevValue, prevEnd } = init(groupedCNV, columns)

    for (let i = 0; i < columns.length; i++) {
        const currentValue = groupedCNV[columns[i]]

        const match = columns[i].match(/chr([XY\d]+):(\d+)-(\d+)/)
        const chr = `chr${match[1]}`
        const start = parseInt(match[2]) + hg38ChromosomeStartPositions[chr]
        const end = parseInt(match[3]) + hg38ChromosomeStartPositions[chr]

        if (prevValue !== currentValue) {
            nodePairs.push([start, currentValue])

            prevValue = currentValue
        }
        prevEnd = end

        if (i === columns.length - 1) {
            nodePairs.push([end, currentValue])
        }
    }

    return nodePairs
}

export const parseSingleChromosomeGroupCNVMatrixToNodePairs = (groupedCNV, columns) => {
    let { nodePairs, prevValue, prevEnd } = init(groupedCNV, columns)

    for (let i = 1; i < columns.length; i++) {
        const currentValue = groupedCNV[columns[i]]

        const match = columns[i].match(/chr[\w]+:(\d+)-(\d+)/)
        const start = parseInt(match[1])
        const end = parseInt(match[2])

        if (prevValue !== currentValue) {
            nodePairs.push([start, currentValue])

            prevValue = currentValue
        }
        prevEnd = end

        if (i === columns.length - 1) {
            nodePairs.push([end, currentValue])
        }
    }

    return nodePairs
}

const init = (groupedCNV, columns) => {
    const match = columns[0].match(/chr[\w]+:(\d+)-(\d+)/)
    const first = groupedCNV[columns[0]]

    const prevValue = first
    const prevEnd = parseInt(match[2])
    const nodePairs = [[parseInt(match[1]), first]]

    return {
        nodePairs,
        prevValue,
        prevEnd
    }
}
