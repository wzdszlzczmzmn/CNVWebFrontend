import * as d3 from 'd3'
import { hg38ChromosomeStartPositions } from 'const/ChromosomeInfo'

export const preprocessData = (ampRegions, delRegions, scoresGISTIC, valueType) => {

    console.log(ampRegions)
    console.log(delRegions)
    console.log(scoresGISTIC)
    console.log(valueType)
}

const preprocessRegions = (regions) => {
    const processedRegions = []
    for(const region of regions) {
        const boundary = parseRegionBoundary(region.boundaries)
        processedRegions.push({
            cytoband: region.cytoband,
            start: boundary[0],
            end: boundary[1],
            genes: region.genes
        })
    }

    processedRegions.sort((a, b) => b.start - a.start)

    return processedRegions
}

const parseRegionBoundary =(boundary) => {
    const match = boundary.match(/chr([XY\d]+):(\d+)-(\d+)/)
    const chr = `chr${match[1]}`
    const start = parseInt(match[2]) + hg38ChromosomeStartPositions[chr]
    const end = parseInt(match[3]) + hg38ChromosomeStartPositions[chr]

    return [start, end]
}

const extractNoRecurrentRegionsNodes = ( processedRegions, scoresGISTIC, valueType ) => {
    const nodes = []

    // if (scoresGISTIC[0].start === '1') {
    //     nodes.push({
    //         x: 1,
    //         y: scoresGISTIC[0][valueType]
    //     })
    // } else {
    //     nodes.push({
    //         x: 1,
    //         y: 0
    //     })
    // }

    let regionIndex = 0
    for (let i =0; i < scoresGISTIC.length; i++) {
        if (scoresGISTIC[i]['start'] < processedRegions[regionIndex]['start']) {
            if (scoresGISTIC[i]['end'] < processedRegions[regionIndex]['end']) {
                nodes.push({
                    // x:
                })
            }
        }
    }
}

const extractRecurrentRegionNodes = ( processedRegions, scoresGISTIC) => {

}

export const initFigureConfig = (width, height, globalSetting, legendSetting, titleSetting, chromosomeAxisSetting) => {
    const innerWidth = width - globalSetting.margin
    const innerHeight = height - globalSetting.margin
    const titleHeight = titleSetting.marginTop + titleSetting.marginBottom + Math.ceil(titleSetting.fontSize * 1.31)
    const legendHeight = legendSetting.marginTop + legendSetting.marginBottom + legendSetting.height

    const figureHeight = innerHeight - titleHeight - legendHeight
    const yOffsetFigure = legendHeight
    const figureWidth = innerWidth
    const xOffsetFigure = 0

    const xOffsetLegend = (innerWidth - (legendSetting.width * 2 + legendSetting.itemGap)) / 2
    const yOffsetLegend = innerHeight - legendSetting.marginBottom + legendSetting.height

    const yAxisLength = (innerHeight - chromosomeAxisSetting.height) / 2
    const ampYAxisRange = [0, yAxisLength]
    const delYAxisRange = [yAxisLength + chromosomeAxisSetting.height, innerHeight]

}
