import { memo, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import CustomTooltip from "../ToolTip/ToolTip"
import * as d3 from "d3"
import { useEmbeddingScatterPlotVizSettingStore } from "../../../stores/EmbeddingScatterPlotVizSettingStore"
import { initAxis, initAxisDomain, initFigureConfig } from "./preprocess"
import _ from "lodash"
import Stack from "@mui/material/Stack"
import { EmbeddingScatterPlotTooltipTemplate } from "./TooltipTemplate"

const EmbeddingScatterPlot = ({
    embeddingDict,
    clusterDict,
    width,
    height,
    isCustom,
    embeddingMethod
}) => {
    const globalSetting = useEmbeddingScatterPlotVizSettingStore((state) => state.globalSetting)
    const titleSetting = useEmbeddingScatterPlotVizSettingStore((state) => state.titleSetting)
    const legendSetting = useEmbeddingScatterPlotVizSettingStore((state) => state.legendSetting)
    const scatterSetting = useEmbeddingScatterPlotVizSettingStore((state) => state.scatterSetting)

    const toolTipRef = useRef(null)
    const xAxisRef = useRef(null)
    const yAxisRef = useRef(null)
    const dotsRef = useRef(null)
    const legendContainerRef = useRef(null)

    const {
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
    } = initFigureConfig(height, globalSetting, legendSetting, titleSetting, Object.keys(clusterDict).length)
    const axisDomain = initAxisDomain(embeddingDict)
    const { x, y } = initAxis(axisDomain, xRange, yRange)

    let clusterList = null
    if (!isCustom) {
        clusterList = _.sortBy(Object.keys(clusterDict), str => parseInt(str.match(/\d+/)[0], 10))
    } else {
        clusterList = Object.keys(clusterDict)
    }

    useEffect(() => {
        const gx = d3.select(xAxisRef.current)

        gx.call(d3.axisBottom(x))
    }, [x])

    useEffect(() => {
        const gy = d3.select(yAxisRef.current)

        gy.call(d3.axisLeft(y))
    }, [y])

    useEffect(() => {
        const gDots = d3.select(dotsRef.current)

        gDots.selectAll('g')
            .data(clusterList)
            .join('g')
            .attr('class', d => d)
            .each(function (datum, index) {
                const gClusterDots = d3.select(this)

                gClusterDots.selectAll('circle')
                    .data(clusterDict[datum])
                    .join('circle')
                    .attr('cx', d => x(embeddingDict[d][0]))
                    .attr('cy', d => y(embeddingDict[d][1]))
                    .attr('r', scatterSetting.radius)
                    .attr('fill', colorScale(index))
                    .on('pointerenter pointermove', (event, d) => handleDotPointerEnter(event, d, embeddingDict[d], colorScale(index), toolTipRef))
                    .on('pointerleave', () => handleDotPointerLeft(toolTipRef))
            })
    }, [clusterDict, clusterList, colorScale, embeddingDict, scatterSetting.radius, x, y])

    useEffect(() => {
        const gLegend = d3.select(legendContainerRef.current)

        gLegend.selectAll('g')
            .data(clusterList)
            .join('g')
            .attr('transform', (d, i) => `translate(${Math.floor(i / rowLegendNum) * (legendSetting.width + legendSetting.itemHorizontalGap)}, ${(legendSetting.itemVerticalGap + legendSetting.height) * (i % rowLegendNum)})`)
            .each(function (d, index) {
                const g = d3.select(this)

                g.selectAll('rect')
                    .data([d])
                    .join('rect')
                    .attr('y', 2)
                    .attr('width', 26)
                    .attr('height', 16)
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('fill', colorScale(index))

                g.selectAll('text')
                    .data([d])
                    .join('text')
                    .attr('x', 30)
                    .attr('dy', '1rem')
                    .text(d)

                g.selectAll('.legend-event-trigger')
                    .data([d])
                    .join('rect')
                    .attr('class', 'legend-event-trigger')
                    .attr('width', legendSetting.width)
                    .attr('height', legendSetting.height)
                    .attr('fill', 'transparent')
                    .on('pointerenter pointermove', (event, d) => handleLegendPointerEnter(d, dotsRef))
                    .on('pointerleave', (event, d) => handleLegendPointerLeft(d, dotsRef))
            })
    }, [clusterDict, clusterList, colorScale, legendSetting.height, legendSetting.itemHorizontalGap, legendSetting.itemVerticalGap, legendSetting.width, rowLegendNum])

    return (
        <Stack sx={{ alignItems: 'center', overflowX: 'auto' }}>
            <svg width={svgWidth} height={svgHeight}>
                <g className='plotContainer' transform={`translate(${globalSetting.margin}, ${globalSetting.margin})`}>
                    <g className='title'>
                        <text
                            fontSize={titleSetting.fontSize}
                            transform={`translate(${innerWidth / 2}, ${titleSetting.marginTop})`}
                            dy='1rem'
                            textAnchor='middle'
                        >
                            {embeddingMethod} Plot
                        </text>
                    </g>
                    <g ref={xAxisRef} transform={`translate(${xOffsetScatterPlot}, ${yOffsetXAxis})`}>
                        <text
                            x={figureSize / 2}
                            y={36}
                            fontSize={14}
                            fontWeight='bold'
                            fill='black'
                            textAnchor='middle'
                        >
                            {embeddingMethod}1
                        </text>
                    </g>
                    <g ref={yAxisRef} transform={`translate(${xOffsetScatterPlot}, ${yOffsetScatterPlot})`}>
                        <text
                            y={figureSize / 2 + 36}
                            fontSize={14}
                            fontWeight='bold'
                            fill='black'
                            textAnchor='middle'
                            transform={`rotate(90, 0, ${figureSize / 2})`}
                        >
                            {embeddingMethod}2
                        </text>
                    </g>
                    <g ref={dotsRef} transform={`translate(${xOffsetScatterPlot}, ${yOffsetScatterPlot})`}></g>
                    <g ref={legendContainerRef} transform={`translate(${xOffsetLegend}, ${yOffsetLegend})`}></g>
                </g>
            </svg>
            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </Stack>
    )
}

const handleLegendPointerEnter = (datum, dotsRef) => {
    const gDots = d3.select(dotsRef.current)

    gDots.selectAll(`g:not(.${datum})`)
        .attr('opacity', 0.2)
}

const handleLegendPointerLeft = (datum, dotsRef) => {
    const gDots = d3.select(dotsRef.current)

    gDots.selectAll('g')
        .attr('opacity', 1)
}

const handleDotPointerEnter = (event, nodeId, coordinate, color, tooltipRef) => {
    tooltipRef.current.showTooltip(event, EmbeddingScatterPlotTooltipTemplate(nodeId, coordinate, color))
}

const handleDotPointerLeft = (tooltipRef) => {
    tooltipRef.current.hideTooltip()
}

const MemoEmbeddingScatterPlot = memo(EmbeddingScatterPlot)

export default MemoEmbeddingScatterPlot
