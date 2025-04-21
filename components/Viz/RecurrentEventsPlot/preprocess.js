import * as d3 from "d3"
import { NonSexChromosomeXDomain } from "../../../const/ChromosomeInfo"

export const initFigureConfig = (
    width,
    height,
    globalSetting,
    titleSetting,
    labelSetting,
    samplePloidyStairstepSetting,
    metaMatrixSetting,
    pageSize
) => {
    const innerWidth = width - globalSetting.marginX * 2
    const innerHeight = height - globalSetting.marginY * 2
    const titleHeight = titleSetting.marginTop + titleSetting.marginBottom + Math.ceil(titleSetting.fontSize * 1.31)

    const figureHeight = innerHeight - titleHeight - 4 * metaMatrixSetting.height - metaMatrixSetting.marginTop
    const yOffsetFigure = titleHeight
    const figureWidth = innerWidth - labelSetting.width * 2 - 2 * samplePloidyStairstepSetting.marginX
    const xOffsetFigure = labelSetting.width + samplePloidyStairstepSetting.marginX

    const yAxisLength = (figureWidth - (pageSize - 1) * samplePloidyStairstepSetting.chartGap) / pageSize
    const xAxisRange = [0, figureHeight]

    const yOffsetLabel = titleHeight
    const xOffsetAmpLabel = 0
    const xOffsetDelLabel = labelSetting.width + figureWidth + samplePloidyStairstepSetting.marginX * 2

    const xOffsetMetaMatrix = xOffsetFigure
    const yOffsetMetaMatrix = figureHeight + metaMatrixSetting.marginTop + titleHeight

    return {
        figureHeight,
        figureWidth,
        yOffsetFigure,
        xOffsetFigure,
        yAxisLength,
        xAxisRange,
        yOffsetLabel,
        xOffsetAmpLabel,
        xOffsetDelLabel,
        xOffsetMetaMatrix,
        yOffsetMetaMatrix
    }
}

export const createRecurrentEventsAxis = (yAxisLength, xAxisRange, pageSize, chartGap) => {
    const xAxis = d3.scaleLinear()
        .domain(NonSexChromosomeXDomain)
        .range(xAxisRange)

    const calculateYRange = (i, gap, length) => {
        return i === 0 ? (
            [0, length]
        ) : (
            [i * (gap + length), i * (gap + length) + length]
        )
    }

    const yAxisList = Array.from({ length: pageSize }, (_, i) => (
        d3.scaleLinear()
            .domain([-3, 3])
            .range(calculateYRange(i, chartGap, yAxisLength))
    ))

    return {
        xAxis,
        yAxisList
    }
}
