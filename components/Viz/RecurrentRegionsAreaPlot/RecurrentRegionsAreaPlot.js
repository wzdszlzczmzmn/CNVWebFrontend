import { memo, useEffect, useMemo, useRef } from "react"
import * as d3 from 'd3'
import { useRecurrentRegionsAreaPlotStore } from "../../../stores/RecurrentRegionsAreaPlotStore"
import {
    calculateChromosomeSignificantRegions,
    calculateChromosomeXAxisPositions,
    calculateYAxisMax,
    createRecurrentRegionTools,
    initFigureConfig,
    preprocessDataNew,
    transformRegionsToNodes
} from "./preprocess"
import { hg38ChromosomeTicks } from 'const/ChromosomeInfo'
import { createPortal } from "react-dom"
import CustomTooltip from "../ToolTip/ToolTip"
import { RecurrentRegionsTooltipTemplate } from "./TooltipTemplate"
import { createChromosomeSorter } from "../../../tools/chromosomeTools"

const RecurrentRegionsAreaPlot = ({
    width,
    height,
    ampRegions,
    delRegions,
    scoresGISTIC,
    yAxisValueType
}) => {
    const globalSetting = useRecurrentRegionsAreaPlotStore((state) => state.globalSetting)
    const titleSetting = useRecurrentRegionsAreaPlotStore((state) => state.titleSetting)
    const legendSetting = useRecurrentRegionsAreaPlotStore((state) => state.legendSetting)
    const labelSetting = useRecurrentRegionsAreaPlotStore((state) => state.labelSetting)
    const chromosomeAxisSetting = useRecurrentRegionsAreaPlotStore((state) => state.chromosomeAxisSetting)
    const displaySetting = useRecurrentRegionsAreaPlotStore((state) => state.displaySetting)

    const svgRef = useRef(null)
    const toolTipRef = useRef(null)
    const toolTipLineRef = useRef(null)
    const ampYAxisRef = useRef(null)
    const delYAxisRef = useRef(null)
    const chromosomeXAxis = useRef(null)
    const ampNoRecurrentPathRef = useRef(null)
    const ampRecurrentPathRef = useRef(null)
    const delNoRecurrentPathRef = useRef(null)
    const delRecurrentPathRef = useRef(null)
    const ampLabelRef = useRef(null)
    const delLabelRef = useRef(null)
    const legendRef = useRef(null)

    const {
        significantAmpRegions,
        spiltAmpRegionsMap,
        significantDelRegions,
        spiltDelRegionsMap
    } = useMemo(
        () => preprocessDataNew(ampRegions, delRegions, scoresGISTIC),
        [ampRegions, delRegions, scoresGISTIC]
    )

    const ampNodes = useMemo(
        () => transformRegionsToNodes(spiltAmpRegionsMap, yAxisValueType, displaySetting.chromosome),
        [displaySetting.chromosome, spiltAmpRegionsMap, yAxisValueType]
    )

    const delNodes = useMemo(
        () => transformRegionsToNodes(spiltDelRegionsMap, yAxisValueType, displaySetting.chromosome),
        [displaySetting.chromosome, spiltDelRegionsMap, yAxisValueType]
    )

    const yAxisMax = useMemo(
        () => calculateYAxisMax(scoresGISTIC, displaySetting.chromosome, yAxisValueType),
        [displaySetting.chromosome, scoresGISTIC, yAxisValueType]
    )

    const {
        figureHeight,
        figureWidth,
        yOffsetFigure,
        xOffsetFigure,
        xOffsetLegend,
        yOffsetLegend,
        ampYAxisRange,
        delYAxisRange,
        xAxisRange,
        yOffsetAmpLabel,
        yOffsetDelLabel
    } = useMemo(
        () => initFigureConfig(
            width,
            height,
            globalSetting,
            legendSetting,
            titleSetting,
            chromosomeAxisSetting,
            labelSetting
        ),
        [chromosomeAxisSetting, globalSetting, height, labelSetting, legendSetting, titleSetting, width]
    )

    const {
        ampYAxis,
        delYAxis,
        xAxis,
        area,
        labelLine,
        labelLineNodesCreator
    } = useMemo(
        () => createRecurrentRegionTools(ampYAxisRange, delYAxisRange, xAxisRange, yAxisMax, displaySetting),
        [ampYAxisRange, delYAxisRange, displaySetting, xAxisRange, yAxisMax]
    )

    const chromosomePositions = useMemo(
        () => calculateChromosomeXAxisPositions(displaySetting.chromosome),
        [displaySetting.chromosome]
    )

    const chromosomeSignificantAmpRegions = useMemo(
        () => calculateChromosomeSignificantRegions(significantAmpRegions, displaySetting.chromosome),
        [displaySetting.chromosome, significantAmpRegions]
    )

    const chromosomeSignificantDelRegions = useMemo(
        () => calculateChromosomeSignificantRegions(significantDelRegions, displaySetting.chromosome),
        [displaySetting.chromosome, significantDelRegions]
    )

    const xz = useRef(xAxis)
    xz.current = xAxis

    useEffect(() => {
        const gy = d3.select(ampYAxisRef.current)

        gy.call(d3.axisLeft(ampYAxis))
    }, [ampYAxis])

    useEffect(() => {
        const gy = d3.select(delYAxisRef.current)

        gy.call(d3.axisLeft(delYAxis))
    }, [delYAxis])

    useEffect(() => {
        const gChromosomeXAxis = d3.select(chromosomeXAxis.current)

        gChromosomeXAxis.selectAll('rect')
            .data(
                Object.keys(
                    chromosomePositions
                ).filter(
                    key => !['chrX', 'chrY'].includes(key)
                ).sort(
                    createChromosomeSorter()
                )
            )
            .join('rect')
            .attr('x', d => xAxis(chromosomePositions[d][0]))
            .attr('width', d => xAxis(chromosomePositions[d][1]) - xAxis(chromosomePositions[d][0]))
            .attr('height', chromosomeAxisSetting.height)
            .attr('fill', (d, i) => i % 2 === 0 ? 'black' : 'white')
            .attr('stroke', 'black')

        gChromosomeXAxis.selectAll('text')
            .data(
                Object.keys(
                    chromosomePositions
                ).filter(
                    key => !['chrX', 'chrY'].includes(key)
                ).sort(
                    createChromosomeSorter()
                )
            )
            .join('text')
            .attr('x', d => (xAxis(chromosomePositions[d][0]) + xAxis(chromosomePositions[d][1])) / 2)
            .attr('y', chromosomeAxisSetting.height / 2)
            .attr('dy', '.31em')
            .attr('fill', (d, i) => i % 2 === 0 ? 'white' : 'black')
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .text(d => d.replace(/^chr/, ""))

    }, [chromosomeAxisSetting.height, chromosomePositions, xAxis])

    useEffect(() => {
        const gPath = d3.select(ampNoRecurrentPathRef.current)

        gPath.selectAll('path')
            .data(['amp'])
            .join('path')
            .attr("fill", "gray")
            .attr('d', area(ampNodes.normalNodes, xAxis, ampYAxis))
            .attr('clip-path', 'url(#recurrent-regions-clip)')
    }, [ampNodes.normalNodes, ampYAxis, area, xAxis])

    useEffect(() => {
        const gPath = d3.select(ampRecurrentPathRef.current)

        gPath.selectAll('path')
            .data(['ampRecurrent'])
            .join('path')
            .attr("fill", "red")
            .attr('d', area(ampNodes.significantNodes, xAxis, ampYAxis))
            .attr('clip-path', 'url(#recurrent-regions-clip)')
    }, [ampNodes.significantNodes, ampYAxis, area, xAxis])

    useEffect(() => {
        const gPath = d3.select(delNoRecurrentPathRef.current)

        gPath.selectAll('path')
            .data(['del'])
            .join('path')
            .attr("fill", "gray")
            .attr('d', area(delNodes.normalNodes, xAxis, delYAxis))
            .attr('clip-path', 'url(#recurrent-regions-clip)')
    }, [area, delNodes.normalNodes, delYAxis, xAxis])

    useEffect(() => {
        const gPath = d3.select(delRecurrentPathRef.current)

        gPath.selectAll('path')
            .data(['delRecurrent'])
            .join('path')
            .attr("fill", "blue")
            .attr('d', area(delNodes.significantNodes, xAxis, delYAxis))
            .attr('clip-path', 'url(#recurrent-regions-clip)')
    }, [delYAxis, area, xAxis, delNodes.significantNodes])

    useEffect(() => {
        const gAmpLabel = d3.select(ampLabelRef.current)

        gAmpLabel.selectAll('text')
            .data(chromosomeSignificantAmpRegions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('text')
            .attr('x', d => xAxis(d.labelPosition))
            .attr('font-size', labelSetting.fontSize)
            .attr('text-anchor', 'middle')
            .attr('transform', d => `rotate(-90, ${xAxis(d.labelPosition)}, 0) translate(-${8 * labelSetting.fontSize * 0.55 / 2}, 0)`)
            .attr('dy', '.3em')
            .style('cursor', 'move')
            .text(d => d.cytoband)
            .call(d3.drag()
                .on('drag', function (event, d) {
                    d.labelPosition = xz.current.invert(event.x)

                    d3.select(this)
                        .attr('x', xz.current(d.labelPosition))
                        .attr('transform', `rotate(-90, ${xz.current(d.labelPosition)}, 0) translate(-${8 * labelSetting.fontSize * 0.55 / 2}, 0)`);

                    gAmpLabel.selectAll('path')
                        .filter(p => `${p.chromosome}_${p.start}_${p.end}` === `${d.chromosome}_${d.start}_${d.end}`)
                        .attr('d', d => labelLine(
                            labelLineNodesCreator(
                                d.labelPosition,
                                d.anchorPosition,
                                labelSetting.height,
                                labelSetting.fontSize,
                                true
                            ),
                            xz.current
                        ))
                })
            )

        gAmpLabel.selectAll('path')
            .data(chromosomeSignificantAmpRegions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('path')
            .attr('d', d => labelLine(
                labelLineNodesCreator(
                    d.labelPosition,
                    d.anchorPosition,
                    labelSetting.height,
                    labelSetting.fontSize,
                    true
                ),
                xAxis
            ))
            .attr('stroke', 'black')
            .attr('fill', 'none')
    }, [chromosomeSignificantAmpRegions, labelLine, labelLineNodesCreator, labelSetting.fontSize, labelSetting.height, xAxis])

    useEffect(() => {
        const gDelLabel = d3.select(delLabelRef.current)

        gDelLabel.selectAll('text')
            .data(chromosomeSignificantDelRegions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('text')
            .attr('x', d => xAxis(d.labelPosition))
            .attr('y', labelSetting.height)
            .attr('font-size', labelSetting.fontSize)
            .attr('text-anchor', 'middle')
            .attr('transform', d => `rotate(-90, ${xAxis(d.labelPosition)}, ${labelSetting.height}) translate(${8 * labelSetting.fontSize * 0.55 / 2}, 0)`)
            .attr('dy', '.3em')
            .style('cursor', 'move')
            .text(d => d.cytoband)
            .call(
                d3.drag()
                    .on('drag', function (event, d) {
                        d.labelPosition = xz.current.invert(event.x)

                        d3.select(this)
                            .attr('x', xz.current(d.labelPosition))
                            .attr('transform', `rotate(-90, ${xz.current(d.labelPosition)}, ${labelSetting.height}) translate(${8 * labelSetting.fontSize * 0.55 / 2}, 0)`);

                        gDelLabel.selectAll('path')
                            .filter(p => `${p.chromosome}_${p.start}_${p.end}` === `${d.chromosome}_${d.start}_${d.end}`)
                            .attr('d', d => labelLine(
                                labelLineNodesCreator(
                                    d.labelPosition,
                                    d.anchorPosition,
                                    labelSetting.height,
                                    labelSetting.fontSize,
                                    false
                                ),
                                xz.current
                            ))
                    })
            )

        gDelLabel.selectAll('path')
            .data(chromosomeSignificantDelRegions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('path')
            .attr('d', d => labelLine(
                labelLineNodesCreator(
                    d.labelPosition,
                    d.anchorPosition,
                    labelSetting.height,
                    labelSetting.fontSize,
                    false
                ),
                xAxis
            ))
            .attr('stroke', 'black')
            .attr('fill', 'none')
    }, [chromosomeSignificantDelRegions, labelLine, labelLineNodesCreator, labelSetting.fontSize, labelSetting.height, xAxis])

    useEffect(() => {
        const gLegend = d3.select(legendRef.current)

        gLegend.selectAll('g')
            .data(['Amp', 'Del'])
            .join('g')
            .each(function (datum, index) {
                const g = d3.select(this)

                g.selectAll('rect')
                    .data(['symbol'])
                    .join('rect')
                    .attr('x', index * (legendSetting.width + legendSetting.itemGap))
                    .attr('width', legendSetting.symbolWidth)
                    .attr('height', legendSetting.height)
                    .attr('fill', datum === 'Amp' ? 'red' : 'blue')
                    .attr('rx', 5)

                g.selectAll('text')
                    .data(['legendText'])
                    .join('text')
                    .attr('x', index * (legendSetting.width + legendSetting.itemGap) + legendSetting.symbolWidth * 1.2)
                    .attr('dy', '1em')
                    .attr('font-size', legendSetting.fontSize)
                    .text(datum)
            })
    }, [legendSetting.fontSize, legendSetting.height, legendSetting.itemGap, legendSetting.symbolWidth, legendSetting.width])

    useEffect(() => {
            const zoomed = (event) => {
                xz.current = event.transform.rescaleX(xAxis)
                d3.select(ampNoRecurrentPathRef.current)
                    .select('path')
                    .attr('d', area(ampNodes.normalNodes, xz.current, ampYAxis))

                d3.select(ampRecurrentPathRef.current)
                    .select('path')
                    .attr('d', area(ampNodes.significantNodes, xz.current, ampYAxis))

                d3.select(delNoRecurrentPathRef.current)
                    .select('path')
                    .attr('d', area(delNodes.normalNodes, xz.current, delYAxis))

                d3.select(delRecurrentPathRef.current)
                    .select('path')
                    .attr('d', area(delNodes.significantNodes, xz.current, delYAxis))

                d3.select(chromosomeXAxis.current)
                    .selectAll('rect')
                    .attr('x', d => xz.current(chromosomePositions[d][0]))
                    .attr('width', d => xz.current(chromosomePositions[d][1]) - xz.current(chromosomePositions[d][0]))

                d3.select(chromosomeXAxis.current)
                    .selectAll('text')
                    .attr('x', d => (xz.current(chromosomePositions[d][0]) + xz.current(chromosomePositions[d][1])) / 2)

                d3.select(ampLabelRef.current)
                    .selectAll('text')
                    .attr('x', d => xz.current(d.labelPosition))
                    .attr('transform', d => `rotate(-90, ${xz.current(d.labelPosition)}, 0) translate(-${8 * labelSetting.fontSize * 0.55 / 2}, 0)`)

                d3.select(ampLabelRef.current)
                    .selectAll('path')
                    .attr('d', d => labelLine(
                        labelLineNodesCreator(
                            d.labelPosition,
                            d.anchorPosition,
                            labelSetting.height,
                            labelSetting.fontSize,
                            true
                        ),
                        xz.current
                    ))

                d3.select(delLabelRef.current)
                    .selectAll('text')
                    .attr('x', d => xz.current(d.labelPosition))
                    .attr('transform', d => `rotate(-90, ${xz.current(d.labelPosition)}, ${labelSetting.height}) translate(${8 * labelSetting.fontSize * 0.55 / 2}, 0)`)

                d3.select(delLabelRef.current)
                    .selectAll('path')
                    .attr('d', d => labelLine(
                        labelLineNodesCreator(
                            d.labelPosition,
                            d.anchorPosition,
                            labelSetting.height,
                            labelSetting.fontSize,
                            false
                        ),
                        xz.current
                    ))
            }

            const zoom = d3.zoom()
                .scaleExtent([1, 32])
                .extent([[xOffsetFigure, yOffsetFigure], [xOffsetFigure + figureWidth, yOffsetFigure + figureHeight]])
                .translateExtent([[xOffsetFigure, -Infinity], [xOffsetFigure + figureWidth, Infinity]])
                .on("zoom", zoomed)

            const svg = d3.select(svgRef.current)

            if (displaySetting.chromosome === 'All') {
                svg.on('.zoom', null)
            } else {
                svg.call(zoom)
            }
        },
        [
            ampNodes.normalNodes, ampNodes.significantNodes, ampYAxis, area, chromosomePositions, delNodes.normalNodes,
            delNodes.significantNodes, delYAxis, displaySetting.chromosome, figureHeight, figureWidth, labelLine,
            labelLineNodesCreator, labelSetting.fontSize, labelSetting.height, xAxis, xOffsetFigure, yOffsetFigure
        ]
    )

    return (
        <>
            <svg
                width={width}
                height={height}
                ref={svgRef}
            >
                <defs>
                    <clipPath id="recurrent-regions-clip">
                        <rect x={xOffsetFigure} y={yOffsetFigure} width={figureWidth} height={figureHeight}/>
                    </clipPath>
                    <clipPath id="chromosome-axis-clip">
                        <rect
                            x={0}
                            y={0}
                            height={height}
                            width={figureWidth}
                        />
                    </clipPath>
                </defs>
                <g transform={`translate(${globalSetting.marginX}, ${globalSetting.marginY})`}>
                    <g className='title'>
                        <text
                            fontSize={titleSetting.fontSize}
                            transform={`translate(${figureWidth / 2}, ${titleSetting.marginTop})`}
                            dy='1em'
                            textAnchor='middle'
                        >
                            Recurrent Regions
                        </text>
                    </g>
                    <g
                        className='ampLabel'
                        transform={`translate(${xOffsetFigure}, ${yOffsetAmpLabel})`}
                        ref={ampLabelRef}
                    ></g>
                    <g
                        className='delLabel'
                        transform={`translate(${xOffsetFigure}, ${yOffsetDelLabel})`}
                        ref={delLabelRef}
                    ></g>
                    <g className='figure' transform={`translate(${xOffsetFigure}, ${yOffsetFigure})`}>
                        <g ref={ampYAxisRef}></g>
                        <g ref={delYAxisRef}></g>
                        <g ref={chromosomeXAxis} transform={`translate(0, ${ampYAxisRange[0]})`}
                           clipPath='url(#chromosome-axis-clip)'></g>
                        <g ref={ampNoRecurrentPathRef}></g>
                        <g ref={ampRecurrentPathRef}></g>
                        <g ref={delNoRecurrentPathRef}></g>
                        <g ref={delRecurrentPathRef}></g>
                        <rect
                            width={figureWidth}
                            height={Math.abs(ampYAxisRange[0] - ampYAxisRange[1])}
                            fill='transparent'
                            onPointerMove={(event) => pointerMoved(
                                event,
                                xz,
                                ampNodes,
                                significantAmpRegions,
                                displaySetting.chromosome,
                                yAxisValueType,
                                toolTipRef,
                                'Amp',
                                toolTipLineRef,
                                ampYAxisRange
                            )}
                            onPointerLeave={() => pointerLeft(toolTipRef, toolTipLineRef)}
                        ></rect>
                        <rect
                            y={Math.abs(ampYAxisRange[0] - ampYAxisRange[1]) + chromosomeAxisSetting.height}
                            width={figureWidth}
                            height={Math.abs(delYAxisRange[0] - delYAxisRange[1])}
                            fill='transparent'
                            onPointerMove={(event) => pointerMoved(
                                event,
                                xz,
                                delNodes,
                                significantDelRegions,
                                displaySetting.chromosome,
                                yAxisValueType,
                                toolTipRef,
                                'Del',
                                toolTipLineRef,
                                delYAxisRange
                            )}
                            onPointerLeave={() => pointerLeft(toolTipRef, toolTipLineRef)}
                        ></rect>
                        <g ref={toolTipLineRef}></g>
                    </g>
                    <g ref={legendRef} className='legends'
                       transform={`translate(${xOffsetLegend}, ${yOffsetLegend})`}></g>
                </g>
            </svg>
            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </>
    )
}

const pointerMoved = (
    event,
    xz,
    nodes,
    significantRegions,
    chromosome,
    valueType,
    toolTipRef,
    type,
    tooltipLineRef,
    yRange
) => {
    const nodeBisect = d3.bisector(d => d.x).right
    const chrInfoBisect = d3.bisector(d => parseInt(d)).left
    const xPosition = parseInt(xz.current.invert(d3.pointer(event)[0]))

    let currentChr
    let currentXPosition

    if (chromosome === 'All') {
        const chrEnds = Object.keys(hg38ChromosomeTicks)
        const chrIndex = chrInfoBisect(chrEnds, xPosition)
        currentChr = hg38ChromosomeTicks[chrEnds[chrIndex]]
        currentXPosition = chrIndex === 0 ? xPosition : xPosition - parseInt(chrEnds[chrIndex - 1])
    } else {
        currentChr = chromosome
        currentXPosition = xPosition
    }

    let value

    if (significantRegions.find(region => region.start <= xPosition && region.end >= xPosition) === undefined) {
        const nodeIndex = nodeBisect(nodes.normalNodes, xPosition) - 1
        value = nodes.normalNodes[nodeIndex].y
    } else {
        const nodeIndex = nodeBisect(nodes.significantNodes, xPosition) - 1
        value = nodes.significantNodes[nodeIndex].y
    }

    d3.select(tooltipLineRef.current)
        .selectAll('line')
        .data([1])
        .join('line')
        .attr('x1', xz.current(xPosition))
        .attr('x2', xz.current(xPosition))
        .attr('y1', yRange[0])
        .attr('y2', yRange[1])
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke', 'black')
        .attr("stroke-opacity", 0.3)
        .style("pointer-events", "none")

    toolTipRef.current.showTooltip(
        event,
        RecurrentRegionsTooltipTemplate({
            chromosome: currentChr,
            xPosition: currentXPosition,
            valueType: valueType,
            value: value,
            type: type
        })
    )
}

const pointerLeft = (tooltipRef, tooltipLineRef) => {
    tooltipRef.current.hideTooltip()
    d3.select(tooltipLineRef.current).selectAll('line').remove()
}

const MemoRecurrentRegionsAreaPlot = memo(RecurrentRegionsAreaPlot)

export default MemoRecurrentRegionsAreaPlot
