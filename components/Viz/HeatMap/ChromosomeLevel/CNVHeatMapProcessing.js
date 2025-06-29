import * as Papa from "papaparse"
import _ from "lodash";
import * as d3 from "d3";
import parseNewick from "../../../../tools/newick";

const convertCNVArrayToObject = (CNVMatrix, chromosomeRange) => {
    const index = CNVMatrix[0].slice(1, CNVMatrix[0].length)
    const binContent =
        CNVMatrix.slice(1, CNVMatrix.length).map(row => row.map((item, index) => index === 0 ? item : parseFloat(item)))

    const CNVMatrixObject = {}

    for (let index = 0; index < binContent.length; index++) {
        const binContentRow = binContent[index]
        CNVMatrixObject[binContentRow[0]] = binContentRow.slice(1, binContentRow.length)
    }

    const binIndex = {}

    for (let chr in chromosomeRange) {
        binIndex[chr] = index.slice(parseInt(chromosomeRange[chr][0]), parseInt(chromosomeRange[chr][1]))
    }

    return {binIndex, CNVMatrixObject}
}

const isNumericString = (value) => {
    return /^-?\d+(\.\d+)?$/.test(value)
}

const convertCNVMetaToObjectAndGetDataRange = (CNVMeta) => {
    const indexColumn = CNVMeta[0]
    const content = CNVMeta.slice(1, CNVMeta.length)
        .map(row => row.map(((item, i) => isNumericString(item) && indexColumn[i] !== 'hcluster' ? parseFloat(item) : item)))

    const contentZip = _.zip(...content)

    const metaRanges = {}

    for (let index = 1; index < indexColumn.length; index++) {
        if (typeof contentZip[index][0] === 'string') {
            metaRanges[indexColumn[index]] = [...new Set(contentZip[index])]
        } else {
            const max = _.ceil(_.max(contentZip[index]), 0)
            const min = _.floor(_.min(contentZip[index]), 0)
            metaRanges[indexColumn[index]] = [min === -0 ? 0 : min, max === -0 ? 0 : max]
        }
    }

    const CNVMetaObject = {}

    for (let i = 0; i < content.length; i++) {
        const contentRow = content[i]
        CNVMetaObject[contentRow[0]] = contentRow.slice(1, contentRow.length)
    }

    const metaHeaders = indexColumn.slice(1, indexColumn.length)

    return {metaRanges, CNVMetaObject, metaHeaders}
}

export const basicDataProcessing = (CNVCut, CNVMatrix, CNVMeta, chromosomeRange) => {
    // Processing CNVCut to Object.
    const CNVCutObject = JSON.parse(CNVCut)

    // Processing CNVMatrix to Object.
    CNVMatrix = Papa.parse(CNVMatrix, {skipEmptyLines: true}).data
    const {binIndex, CNVMatrixObject} = convertCNVArrayToObject(CNVMatrix, chromosomeRange)
    const totalFileNum = Object.keys(CNVMatrixObject).length

    // Processing CNVMeta to Object.
    CNVMeta = Papa.parse(CNVMeta, {skipEmptyLines: true}).data
    const {metaRanges, CNVMetaObject, metaHeaders} = convertCNVMetaToObjectAndGetDataRange(CNVMeta)

    return {CNVCutObject, binIndex, CNVMatrixObject, totalFileNum, metaRanges, CNVMetaObject, metaHeaders}
}

export const getChromosomeRange = (CNVMatrixMeta) => {
    const chromosomeRange = {}

    for (let i = 0; i < CNVMatrixMeta.length; i++) {
        chromosomeRange[CNVMatrixMeta[i][0]] =
            i === 0 ?
                [0, CNVMatrixMeta[i][1]]
                : [chromosomeRange[CNVMatrixMeta[i - 1][0]][1], chromosomeRange[CNVMatrixMeta[i - 1][0]][1] + CNVMatrixMeta[i][1]]
    }

    return chromosomeRange
}

export const calculateHeaderBlockOffset = (CNVMatrixMeta, rowWidth) => {
    const headerBlockOffset = [['chr1', 0, rowWidth * CNVMatrixMeta[0][1]]]
    for (let index = 1; index < CNVMatrixMeta.length; index++) {
        headerBlockOffset.push(
            [CNVMatrixMeta[index][0], CNVMatrixMeta[index - 1][1] * rowWidth + headerBlockOffset[index - 1][1],
                rowWidth * CNVMatrixMeta[index][1]])
    }

    return headerBlockOffset
}

export const updateSettings = (
    heatMapSetting,
    metaChartSetting,
    CNVMetaObject,
    currentRootTotalFileNum,
    currentNodeIndex,
    totalFileNum
) => {
    if (currentNodeIndex !== 0) {
        heatMapSetting.blockHeight =
            _.round((heatMapSetting.defaultHeight * totalFileNum) / currentRootTotalFileNum, 1)
    } else {
        heatMapSetting.blockHeight = heatMapSetting.defaultHeight
    }

    metaChartSetting.offset = metaChartSetting.width * Object.values(CNVMetaObject)[0].length
}

export const parseTree = (treeString, treeGraphicWidth) => {
    const root = d3.hierarchy(parseNewick(treeString), d => d.children)
        .sum(d => d.children ? 0 : 1)
    const dx = 10
    const dy = treeGraphicWidth / (root.height + 1)

    // create a tree layout.
    const tree = d3.cluster().nodeSize([dx, dy])

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name))
    tree(root)

    return root
}

export const getLeafListOfCurrentLeafs = (CNVCut, root) => {
    const leaves = root.leaves()
    const leafListDict = {}

    for (let leaf of leaves) {
        leafListDict[leaf.data.name] = CNVCut[leaf.data.name]['leafs']
    }

    return leafListDict
}

export const getClusterCNVMeanMatrix = (CNVMatrixObject, leafListDict, chromosomeRange) => {
    const leafMatrixDict = {}

    for (let leafName of Object.keys(leafListDict)) {
        const leafCNVMatrix = Object.values(_.pick(CNVMatrixObject, leafListDict[leafName]))
        const zipContent = _.zip(...leafCNVMatrix).map(column => _.mean(column))
        const CNVAvg = {}

        for (let chr in chromosomeRange) {
            CNVAvg[chr] = zipContent.slice(chromosomeRange[chr][0], chromosomeRange[chr][1])
        }

        leafMatrixDict[leafName] =
            {'fileNum': leafCNVMatrix.length, 'CNVAvg': CNVAvg}
    }

    const leafMatrixDictKeys = Object.keys(leafMatrixDict)

    for (let i = 0; i < leafMatrixDictKeys.length; i++) {
        leafMatrixDict[leafMatrixDictKeys[i]]['offset'] =
            i === 0 ? 0 : leafMatrixDict[leafMatrixDictKeys[i - 1]]['offset'] + leafMatrixDict[leafMatrixDictKeys[i - 1]]['fileNum']
    }

    return leafMatrixDict
}

export const getClusterMetaLeaves = (CNVMetaObject, leafListDict) => {
    const clusterMetaDict = {}

    for (let leafName of Object.keys(leafListDict)) {
        clusterMetaDict[leafName] = _.pick(CNVMetaObject, leafListDict[leafName])
    }

    return clusterMetaDict
}

export const resetTreeXPosition = (root, leafListDict, rowHeight) => {
    const leafOffset = {}
    const leaves = Object.keys(leafListDict)

    for (let i = 0; i < leaves.length; i++) {
        leafOffset[i] = i === 0 ? 0 : leafListDict[leaves[i - 1]].length + leafOffset[i - 1]
    }

    const leavesNode = root.leaves()

    for (let i = 0; i < leavesNode.length; i++) {
        leavesNode[i].x = (leafOffset[i] + leafListDict[leaves[i]].length / 2) * rowHeight
    }

    for (let node of root.descendants().reverse()) {
        if (node.children) {
            node.x = (node.children[1].x + node.children[0].x) / 2
        }
    }
}

export const createColorScales = (metaRanges, CNVBaseline) => {
    // CNV Color Legend
    let scaleRange

    if (CNVBaseline === 0) {
        scaleRange = [-1, 1]
    } else {
        scaleRange = [0, 10]
    }

    const colorScaleLow = d3.scaleSequential()
        .domain([scaleRange[0], CNVBaseline])
        .interpolator(d3.interpolateRgb('#add8e6', '#ffffff'))
        .clamp(true)
    const colorScaleHigh = d3.scaleSequential()
        .domain([CNVBaseline, scaleRange[1]])
        .interpolator(d3.interpolateRgb('#ffffff', '#6A0220'))
        .clamp(true)

    // CNV Meta Color Legend
    const genderColorScale = d3.scaleOrdinal()
        .domain(metaRanges['gender'])
        .range(['#1E90FF', '#FF69B4', '#9370DB'])

    const vitalStateColorScale = d3.scaleOrdinal()
        .domain(metaRanges['vital status'])
        .range(['#4CAF50', '#F44336', '#FFC107'])

    const ethnicityColorScale = d3.scaleOrdinal()
        .domain(metaRanges['ethnicity'])
        .range(d3.schemeCategory10)

    const raceColorScale = d3.scaleOrdinal()
        .domain(metaRanges['race'])
        .range(d3.schemeTableau10)

    const hclusterColorScale = d3.scaleOrdinal()
        .domain(metaRanges['hcluster'].sort((a, b) => Number(a) - Number(b)))
        .range(d3.schemeCategory10)

    // const ePC1ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_PC1'])
    //     .interpolator(d3.interpolateRgb('#c4a1d3', '#ad49e1'))
    //
    // const ePC2ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_PC2'])
    //     .interpolator(d3.interpolateRgb('#52b199', '#0d7c66'))
    //
    // const eTSNE1ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_TSNE1'])
    //     .interpolator(d3.interpolateRgb('#d88f92', '#c63c51'))
    //
    // const eTSNE2ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_TSNE2'])
    //     .interpolator(d3.interpolateRgb('#bad9ff', '#3572ef'))
    //
    // const eUMAP1ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_UMAP1'])
    //     .interpolator(d3.interpolateRgb('#ffa699', '#ff7f3e'))
    //
    // const eUMAP2ColorScale = d3.scaleSequential()
    //     .domain(metaRanges['e_UMAP2'])
    //     .interpolator(d3.interpolateRgb('#f0e8fa', '#FF76CE'))

    const colorScales =  {
        'CNVLow': colorScaleLow,
        'CNVHigh': colorScaleHigh,
        'gender': genderColorScale,
        'vital status': vitalStateColorScale,
        'ethnicity': ethnicityColorScale,
        'race': raceColorScale,
        'hcluster': hclusterColorScale,
        // 'e_PC1': ePC1ColorScale,
        // 'e_PC2': ePC2ColorScale,
        // 'e_TSNE1': eTSNE1ColorScale,
        // 'e_TSNE2': eTSNE2ColorScale,
        // 'e_UMAP1': eUMAP1ColorScale,
        // 'e_UMAP2': eUMAP2ColorScale
    }

    const getCNVColor = (value) => {
        return value < CNVBaseline ? colorScales['CNVLow'](value) : colorScales['CNVHigh'](value)
    }

    return {colorScales, getCNVColor}
}
