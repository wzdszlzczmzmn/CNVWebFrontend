import * as d3 from "d3"

const SCROLLBAR_HEIGHT = 16

export const initFigureConfig = (height, globalSetting, legendSetting, titleSetting, legendNum) => {
    const svgHeight = height - SCROLLBAR_HEIGHT
    const innerHeight = svgHeight - globalSetting.margin * 2
    const yTitleHeight = titleSetting.marginTop + titleSetting.marginBottom + Math.ceil(titleSetting.fontSize * 1.31)
    const figureSize = innerHeight - yTitleHeight - globalSetting.axisWidth

    const rowLegendNum = Math.floor(figureSize / (legendSetting.height + legendSetting.itemVerticalGap))
    const rowNum = Math.ceil(legendNum / rowLegendNum)

    const innerWidth = figureSize + globalSetting.axisWidth + (rowNum - 1) * legendSetting.itemHorizontalGap + rowNum * legendSetting.width + legendSetting.marginLeft
    const svgWidth = innerWidth + 2 * globalSetting.margin

    const xOffsetScatterPlot = globalSetting.axisWidth
    const yOffsetScatterPlot = yTitleHeight
    const yOffsetXAxis = yTitleHeight + figureSize

    const xOffsetLegend = globalSetting.axisWidth + figureSize + legendSetting.marginLeft
    const yOffsetLegend = rowNum === 1 ? (
        yTitleHeight + (figureSize - legendSetting.height * legendNum - legendSetting.itemVerticalGap * (legendNum - 1)) / 2
    ) : (
        yTitleHeight + (figureSize - legendSetting.height * rowLegendNum - legendSetting.itemVerticalGap * (rowLegendNum - 1)) / 2
    )

    const xRange = [0, figureSize]
    const yRange = [figureSize, 0]

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    return {
        svgWidth,
        svgHeight,
        innerWidth,
        figureSize,
        rowLegendNum,
        xOffsetScatterPlot,
        yOffsetScatterPlot,
        yOffsetXAxis,
        xOffsetLegend,
        yOffsetLegend,
        xRange,
        yRange,
        colorScale
    }
}

export const initAxisDomain = (embeddingDict) => {
    const firstDimensionValues = Object.values(embeddingDict).map(item => item[0])
    const secondDimensionValues = Object.values(embeddingDict).map(item => item[1])

    return expand(
        [
            Math.min(Math.min(...firstDimensionValues), Math.min(...secondDimensionValues)),
            Math.max(Math.max(...firstDimensionValues), Math.max(...secondDimensionValues))
        ]
    )
}

const expand = (range) => {
    const newMin = Math.floor(range[0] / 5) * 5
    const newMax = Math.ceil(range[1] / 5) * 5

    return [newMin, newMax]
}

export const initAxis = (axisDomain, xRange, yRange) => {
    const x = d3.scaleLinear()
        .domain(axisDomain)
        .range(xRange)

    const y = d3.scaleLinear()
        .domain(axisDomain)
        .range(yRange)

    return {
        x,
        y
    }
}

