import * as d3 from "d3"

export const parseCNVMeta = (CNVMeta, enumProps, numericProps, metaFields) => {
    const meta = d3.csvParse(CNVMeta, d3.autoType)
    const enumPropsValues = getEnumPropsValues(enumProps, meta)
    const numericPropsValueRanges = getNumericPropsValueRanges(numericProps, meta)

    const colorScales = {
        ...getCNVMetaEnumPropsColorScale(enumPropsValues),
        ...getCNVMetaNumericPropsColorScale(numericPropsValueRanges)
    }

    const processedMeta = processMatrix(meta, metaFields)

    return {
        processedMeta,
        colorScales,
    }
}

const getEnumPropsValues = (enumProps, ObjectList) => {
    const enumPropsValues = {}

    enumProps.forEach((enumProp) => {
        enumPropsValues[enumProp] = [...new Set(ObjectList.map(object => object[enumProp]))].sort()
    })

    return enumPropsValues
}

const getNumericPropsValueRanges = (numericProps, ObjectList) => {
    const numericValueRanges = {}

    numericProps.forEach((numericProp) => {
        const values = ObjectList.map(object => object[numericProp])

        numericValueRanges[numericProp] = {
            min: Math.min(...values),
            max: Math.max(...values)
        }
    })

    return numericValueRanges
}

const getCNVMetaEnumPropsColorScale = (enumPropsValues) => {
    const genderColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['gender'])
        .range(["#E57373", "#4A90E2", "#A0A0A0", "#4A4A4A"])

    const vitalStatusColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['vital status'])
        .range(["#28a745", "#dc3545", "#A0A0A0", "#4A4A4A"])

    const ethnicityColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['ethnicity'])
        .range(d3.schemePaired)

    const raceColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['race'])
        .range(d3.schemePaired.slice(5).concat(d3.schemePaired.slice(0, 5)))

    return {
        'gender': genderColorScale,
        'vital status': vitalStatusColorScale,
        'ethnicity': ethnicityColorScale,
        'race': raceColorScale,
    }
}

const getCNVMetaNumericPropsColorScale = (numericPropsValueRanges) => {
    const ePC1ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_PC1'].min, numericPropsValueRanges['e_PC1'].max])  // 设定数据的值域，0到100
        .range(['#c4a1d3', '#ad49e1'])

    const ePC2ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_PC2'].min, numericPropsValueRanges['e_PC2'].max])
        .range(['#52b199', '#0d7c66'])

    const eTSNE1ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_TSNE1'].min, numericPropsValueRanges['e_TSNE2'].max])
        .range(['#d88f92', '#c63c51'])

    const eTSNE2ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_TSNE2'].min, numericPropsValueRanges['e_TSNE2'].max])
        .range(['#bad9ff', '#3572ef'])

    const eUMAP1ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_UMAP1'].min, numericPropsValueRanges['e_UMAP1'].max])
        .range(['#ffa699', '#ff7f3e'])

    const eUMAP2ColorScale = d3.scaleLinear()
        .domain([numericPropsValueRanges['e_UMAP2'].min, numericPropsValueRanges['e_UMAP2'].max])
        .range(['#f0e8fa', '#FF76CE'])

    return {
        'e_PC1': ePC1ColorScale,
        'e_PC2': ePC2ColorScale,
        'e_TSNE1': eTSNE1ColorScale,
        'e_TSNE2': eTSNE2ColorScale,
        'e_UMAP1': eUMAP1ColorScale,
        'e_UMAP2': eUMAP2ColorScale
    }
}

export const parseGeneCNVMatrix = (CNVMatrix, geneInfos) => {
    const matrix = d3.csvParse(CNVMatrix, d3.autoType)
    const CNVColorScale = createGeneCNVColorScale()
    const geneIdFields = geneInfos.map(geneInfo => geneInfo['gene_id'])
    const processedMatrix = processMatrix(matrix, geneIdFields)

    return {
        processedMatrix,
        CNVColorScale
    }
}

const createGeneCNVColorScale = () => {
    const colorScaleLow = d3.scaleLinear()
        .domain([0, 2])
        .range(['#add8e6', '#ffffff'])
        .clamp(true)
    const colorScaleHigh = d3.scaleLinear()
        .domain([2, 10])
        .range(['#ffffff', '#6A0220'])
        .clamp(true)

    return (value) => {
        return value < 2 ? colorScaleLow(value) : colorScaleHigh(value)
    }
}

const processMatrix = (matrix, fields) => {
    return matrix.reduce((acc, item) => {
        const fileId = item['file_id']
        acc[fileId] = fields.map(field => item[field])

        return acc
    }, {})
}
