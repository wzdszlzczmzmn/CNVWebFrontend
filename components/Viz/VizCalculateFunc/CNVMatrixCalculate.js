import _ from 'lodash'

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

export const getHclusterCNVMeanMatrix = (CNVMatrixObject, eachHclusterFileIds, chromosomeRange) => {
    const hclusterMatrixDict = {}

    for (let hcluster of Object.keys(eachHclusterFileIds)) {
        const hclusterCNVMatrix = Object.values(_.pick(CNVMatrixObject, eachHclusterFileIds[hcluster]))
        const zipContent = _.zip(...hclusterCNVMatrix).map(column => _.mean(column))
        const CNVAvg = {}

        for (let chr in chromosomeRange) {
            CNVAvg[chr] = zipContent.slice(chromosomeRange[chr][0], chromosomeRange[chr][1])
        }

        hclusterMatrixDict[hcluster] = {'fileNum': hclusterCNVMatrix.length, 'CNVAvg': CNVAvg}
    }

    return hclusterMatrixDict
}
