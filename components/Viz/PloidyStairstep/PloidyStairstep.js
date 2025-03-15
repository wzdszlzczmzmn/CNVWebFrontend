import { memo, useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3"
import { preprocessGroupedCNVMatrix } from "./Preprocess"
import { usePloidyStairstepVizSettingStore } from 'stores/PloidyStairstepVizSettingStore'
import { useCanvasContext } from "../../app/CustomHook/PloidyStairstepHook"
import { chromosomeXDomain, hg38ChromosomeInfo, hg38ChromosomeTicks } from "../../../const/ChromosomeInfo"
import { produce } from 'immer'
import { createPortal } from "react-dom"
import CustomTooltip from "../ToolTip/ToolTip"
import { PloidyStairstepTooltipTemplate } from "./TooltipTemplate"

const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

const PloidyStairstep = ({
    groupedCNVMatrixCSV,
    displaySettingManager,
    CNVBaseline
}) => {
    const globalSettings = usePloidyStairstepVizSettingStore((state) => state.globalSettings)
    const legendSettings = usePloidyStairstepVizSettingStore((state) => state.legendSettings)
    const titleSettings = usePloidyStairstepVizSettingStore((state) => state.titleSettings)
    const [groupInfos, setGroupInfos] = useState([])
    const context = useCanvasContext()
    const xAxisRef = useRef(null)
    const yAxisRef = useRef(null)
    const pathRef = useRef(null)
    const legendRef = useRef(null)
    const svgRef = useRef(null)
    const toolTipRef = useRef(null)
    const toolTipLineRef = useRef(null)
    const xz = useRef(null)

    const groupedCNVNodePairs = useMemo(() => {
        return preprocessGroupedCNVMatrix(groupedCNVMatrixCSV, displaySettingManager.chromosome)
    }, [displaySettingManager.chromosome, groupedCNVMatrixCSV])

    const {
        rowLegendNum,
        legendOffset,
        xRange,
        yRange,
        x,
        y,
        xAxis,
        line
    } = init(globalSettings, legendSettings, titleSettings, displaySettingManager, Object.keys(groupedCNVNodePairs).length)

    useEffect(() => {
        setGroupInfos(Object.keys(groupedCNVNodePairs).map((group, index) => ({
            name: group,
            display: true,
            index: index
        })))
    }, [groupedCNVNodePairs])

    useEffect(() => {
        const gx = d3.select(xAxisRef.current)

        gx.call(xAxis, x)
        xz.current = x
    }, [x, xAxis])

    useEffect(() => {
        const gy = d3.select(yAxisRef.current)

        gy.selectAll('.tick .assist-line').remove()

        gy.call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .clone()
                .attr('class', 'assist-line')
                .attr("x2", xRange[1] - xRange[0])
                .attr("stroke-opacity", d => d === CNVBaseline ? 1 : 0.2)
                .attr("stroke-dasharray", d => d === CNVBaseline ? '10, 10' : null)
            )
    }, [CNVBaseline, xRange, y])

    useEffect(() => {
        const gPath = d3.select(pathRef.current)

        gPath.selectAll('path')
            .data(groupInfos.filter(info => info.display))
            .join('path')
            .attr('clip-path', 'url(#ploidy-stairstep-clip)')
            .attr('stroke', d => colorScale(d.index))
            .attr('fill', 'transparent')
            .attr('d', d => line(groupedCNVNodePairs[d.name], x))
    }, [line, groupedCNVNodePairs, x, groupInfos])

    useEffect(() => {
        const gLegend = d3.select(legendRef.current)

        gLegend.selectAll('g')
            .data(groupInfos)
            .join('g')
            .attr('transform', (d, i) => legendTransform(i, rowLegendNum, legendSettings))
            .each(function (d) {
                const g = d3.select(this)

                g.selectAll('line')
                    .data([d])
                    .join('line')
                    .attr('x1', 0)
                    .attr('y1', legendSettings.height / 2)
                    .attr('x2', legendSettings.width / 4)
                    .attr('y2', legendSettings.height / 2)
                    .attr('stroke', colorScale(d.index))
                    .attr('stroke-width', 2)
                    .attr('opacity', d.display ? 1 : 0.3)

                g.selectAll('text')
                    .data([d])
                    .join('text')
                    .attr('x', legendSettings.width / 4 + 5)
                    .attr('dy', '1rem')
                    .text(d => d.name)
                    .attr('font-size', '14px')
                    .attr('font-family', 'sans-serif')
                    .attr('opacity', d.display ? 1 : 0.3)

                g.selectAll('rect')
                    .data([d])
                    .join('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', legendSettings.width)
                    .attr('height', legendSettings.height)
                    .attr('fill', 'transparent')
                    .attr('cursor', 'pointer')
                    .on('click', (event, d) => {
                        handleLegendClick(d, setGroupInfos)
                    })
            })
    }, [groupInfos, legendSettings, rowLegendNum])

    useEffect(() => {
        const zoomed = (event) => {
            xz.current = event.transform.rescaleX(x);
            d3.select(pathRef.current)
                .selectAll('path')
                .data(groupInfos.filter(info => info.display))
                .attr('d', d => line(groupedCNVNodePairs[d.name], xz.current))
            d3.select(xAxisRef.current).call(xAxis, xz.current);
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 32])
            .extent([[xRange[0], yRange[1]], [xRange[1], yRange[0]]])
            .translateExtent([[xRange[0], -Infinity], [xRange[1], Infinity]])
            .on("zoom", zoomed);

        d3.select(svgRef.current).call(zoom)
    }, [line, x, xAxis, xRange, yRange, groupInfos, groupedCNVNodePairs])

    return (
        <>
            <svg
                width='100%'
                viewBox={`0 0 ${globalSettings.width} ${globalSettings.height}`}
                style={{ maxWidth: '100%', height: 'auto' }}
                ref={svgRef}
            >
                <clipPath id="ploidy-stairstep-clip">
                    <rect x={xRange[0]} y={yRange[1]} width={xRange[1] - xRange[0]}
                          height={yRange[0] - yRange[1]}></rect>
                </clipPath>
                <text
                    fontSize='24px'
                    transform={`translate(${globalSettings.width / 2}, ${globalSettings.marginTop})`}
                    dy='1rem'
                    textAnchor='middle'
                >
                    Ploidy Stairstep ({displaySettingManager.chromosome})
                </text>
                <g ref={legendRef}
                   transform={`translate(${legendOffset}, ${globalSettings.marginTop + titleSettings.height})`}></g>
                <g ref={xAxisRef} transform={`translate(0,${yRange[0]})`}></g>
                <g ref={yAxisRef} transform={`translate(${xRange[0]}, 0)`}></g>
                <g ref={pathRef}></g>
                <rect
                    transform={`translate(${xRange[0]}, ${yRange[1]})`}
                    width={xRange[1] - xRange[0]}
                    height={yRange[0] - yRange[1]}
                    fill='transparent'
                    onPointerEnter={(event) => pointerMoved(
                        event,
                        groupInfos,
                        groupedCNVNodePairs,
                        displaySettingManager.chromosome,
                        xz,
                        toolTipRef,
                        globalSettings.marginLeft,
                        toolTipLineRef,
                        yRange
                    )}
                    onPointerMove={(event) => pointerMoved(
                        event,
                        groupInfos,
                        groupedCNVNodePairs,
                        displaySettingManager.chromosome,
                        xz,
                        toolTipRef,
                        globalSettings.marginLeft,
                        toolTipLineRef,
                        yRange
                    )}
                    onMouseLeave={() => pointerLeft(toolTipRef, toolTipLineRef)}
                ></rect>
                <g ref={toolTipLineRef}></g>
            </svg>
            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </>
    )
}

const init = (globalSettings, legendSettings, titleSettings, displaySettingManager, groupNumber) => {
    // Calculate global inner width and height.
    const innerWidth = globalSettings.width - globalSettings.marginLeft - globalSettings.marginRight
    const innerHeight = globalSettings.height - globalSettings.marginTop - globalSettings.marginBottom

    // Calculate each row legend number.
    const rowLegendNum = Math.floor(innerWidth * 0.8 / (legendSettings.itemHorizontalGap + legendSettings.width))
    const rowNum = Math.ceil(groupNumber / rowLegendNum)
    const legendOffset =
        (innerWidth - rowLegendNum * legendSettings.width - (rowLegendNum - 1) * legendSettings.itemHorizontalGap) / 2
        + globalSettings.marginLeft

    // Calculate Line Chart settings.
    const yPadding = (rowNum + 1) * legendSettings.height + titleSettings.height + globalSettings.marginTop
    const lineChartWidth = innerWidth
    const lineChartHeight = innerHeight - yPadding
    const xRange = [globalSettings.marginLeft, globalSettings.marginLeft + lineChartWidth]
    const yRange = [globalSettings.marginTop + yPadding + lineChartHeight, globalSettings.marginTop + yPadding]

    // Create the horizontal and vertical scales.
    let xDomain
    if (displaySettingManager.chromosome !== 'All') {
        xDomain = [1, hg38ChromosomeInfo[displaySettingManager.chromosome]]
    } else {
        xDomain = chromosomeXDomain
    }

    const x = d3.scaleLinear()
        .domain(xDomain)
        .range([xRange[0], xRange[1]])

    const y = d3.scaleLinear()
        .domain([displaySettingManager.CNVMin, displaySettingManager.CNVMax])
        .range([yRange[0], yRange[1]])

    // Layout and style function
    const line = (data, x) => {
        return d3.line()
            .curve(d3.curveStepAfter)
            .x(d => x(d[0]))
            .y(d => y(d[1]))
            (data)
    }

    const xAxis = displaySettingManager.chromosome === 'All' ? (
        (g, x) => {
            const ticks = Object.keys(hg38ChromosomeTicks)
            g.call(d3.axisBottom(x).tickValues(ticks).tickFormat(d => hg38ChromosomeTicks[d]))
                .call(
                    g => g.selectAll('.tick line')
                        .attr('y2', (d, i) => i % 2 === 0 ? '6' : '15')
                ).call(
                g => g.selectAll('.tick text')
                    .attr('y', (d, i) => i % 2 === 0 ? '9' : '18')
            )
        }
    ) : (
        (g, x) => {
            g.call(d3.axisBottom(x).ticks(8, "~s").tickSizeOuter(0))
        }
    )

    return {
        rowLegendNum,
        legendOffset,
        xRange,
        yRange,
        x,
        y,
        xAxis,
        line
    }
}

const pointerMoved = (event, groupInfos, groupedCNVNodePairs, chr, xz, toolTipRef, offset, tooltipLineRef, yRange) => {
    const nodePairsBisect = d3.bisector(d => d[0]).right
    const chrInfoBisect = d3.bisector(d => parseInt(d)).left
    const groupActivatedList = groupInfos.filter(group => group.display).map(group => group.name)
    const xPosition = parseInt(xz.current.invert(d3.pointer(event)[0] + offset))

    const groupValues = {}

    if (chr === 'All') {
        const chrEnds = Object.keys(hg38ChromosomeTicks)
        const chrIndex = chrInfoBisect(chrEnds, xPosition)
        const currentChr = hg38ChromosomeTicks[chrEnds[chrIndex]]
        const currentXPosition = chrIndex === 0 ? xPosition : xPosition - parseInt(chrEnds[chrIndex - 1])

        groupValues.chromosome = currentChr
        groupValues.xPosition = currentXPosition
    } else {
        groupValues.chromosome = chr
        groupValues.xPosition = xPosition
    }

    groupValues.colorScale = colorScale
    groupValues.values = []

    for(let group of groupActivatedList) {
        const CNVNodePairs = groupedCNVNodePairs[group]
        const i = nodePairsBisect(CNVNodePairs, xPosition) - 1

        groupValues.values.push({
            group: group,
            value: CNVNodePairs[i][1]
        })
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

    toolTipRef.current.showTooltip(event, PloidyStairstepTooltipTemplate(groupValues))
}

const pointerLeft = (toolTipRef, tooltipLineRef) => {
    toolTipRef.current.hideTooltip()
    d3.select(tooltipLineRef.current).selectAll('line').remove()
}

const truncateText = (text, maxWidth, context) => {
    if (context.measureText(text).width <= maxWidth) {
        return text
    }

    while (text.length > 0) {
        text = text.slice(0, -1)
        if (context.measureText(text + '...').width <= maxWidth) {
            return text + '...'
        }
    }

    return '...'
}

const legendTransform = (index, rowLegendNum, legendSettings) => {
    const xOffset = (index % rowLegendNum) * (legendSettings.width + legendSettings.itemHorizontalGap)
    const yOffset = Math.floor(index / rowLegendNum) * (legendSettings.height + legendSettings.itemVerticalGap)

    return `translate(${xOffset}, ${yOffset})`
}

const handleLegendClick = (groupInfo, setGroupInfos) => {
    setGroupInfos(produce(draft => {
        const group = draft.find(g => g.name === groupInfo.name)
        if (group) {
            group.display = !group.display
        }
    }))
}

const MemoPloidyStairstep = memo(PloidyStairstep)

export default MemoPloidyStairstep
