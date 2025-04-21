import { memo, useEffect, useMemo, useRef } from "react"
import * as d3 from "d3"
import { parseAllChromosomeGroupCNVMatrixToNodePairs } from "../Shared/PloidyStairstepParseToNode"
import { hg38ChromosomeTicks } from "../../../const/ChromosomeInfo"
import { RecurrentEventsTooltipTemplate } from "./TooltipTemplate"

const RecurrentEventPloidyStairstep = ({
    cnvRegionMap,
    columns,
    width,
    height,
    xAxis,
    yAxis,
    toolTipRef,
    aliquot
}) => {
    const ploidyStairstepRef = useRef(null)
    const toolTipLineRef = useRef(null)

    const nodes = useMemo(
        () => {
            const filteredColumns = columns.slice(1).filter(col => !col.startsWith('chrX') && !col.startsWith('chrY'))

            return parseAllChromosomeGroupCNVMatrixToNodePairs(cnvRegionMap, filteredColumns)
        },
        [cnvRegionMap, columns]
    )

    useEffect(() => {
        const gPloidyStairstep = d3.select(ploidyStairstepRef.current)

        gPloidyStairstep.selectAll('path')
            .data(['path'])
            .join('path')
            .attr('stroke', 'black')
            .attr('fill', 'transparent')
            .attr('clip-path', `url(#${cnvRegionMap['file_id']})`)
            .attr('d', line(nodes, xAxis, yAxis))
    }, [cnvRegionMap, nodes, xAxis, yAxis])

    return (
        <g>
            <clipPath id={cnvRegionMap['file_id']}>
                <rect
                    fill='none'
                    width={width}
                    height={height}
                    transform={`translate(${yAxis.range()[0]}, 0)`}
                />
            </clipPath>
            <g ref={toolTipLineRef}></g>
            <g ref={ploidyStairstepRef}></g>
            <rect
                fill='transparent'
                stroke='gray'
                strokeWidth='1px'
                width={width}
                height={height}
                transform={`translate(${yAxis.range()[0]}, 0)`}
                onPointerMove={(event) => pointerMoved(
                    event,
                    nodes,
                    xAxis,
                    yAxis,
                    toolTipRef,
                    toolTipLineRef,
                    aliquot
                )}
                onPointerLeave={(event) => pointerLeft(
                    toolTipRef,
                    toolTipLineRef
                )}
            ></rect>
        </g>
    )
}

const line = (data, xAxis, yAxis) => {
    return d3.line()
        .curve(d3.curveStepAfter)
        .x(d => yAxis(d[1]))
        .y(d => xAxis(d[0]))
        (data)
}

const pointerMoved = (event, nodes, xAxis, yAxis, toolTipRef, toolTipLineRef, aliquot) => {
    const nodesBisect = d3.bisector(d => d[0]).right
    const chrInfoBisect = d3.bisector(d => parseInt(d)).left
    const xPosition = parseInt(xAxis.invert(d3.pointer(event)[1]))

    const chrEnds = Object.keys(hg38ChromosomeTicks)
    const chrIndex = chrInfoBisect(chrEnds, xPosition)
    const currentChr = hg38ChromosomeTicks[chrEnds[chrIndex]]
    const currentXPosition = chrIndex === 0 ? xPosition : xPosition - parseInt(chrEnds[chrIndex - 1])

    const nodeIndex = nodesBisect(nodes, xPosition) - 1
    const value = nodes[nodeIndex]?.[1]

    const props = {
        chromosome: currentChr,
        xPosition: currentXPosition,
        value: value,
        aliquot: aliquot
    }

    d3.select(toolTipLineRef.current)
        .selectAll('line')
        .data([1])
        .join('line')
        .attr('y1', xAxis(xPosition))
        .attr('y2', xAxis(xPosition))
        .attr('x1', yAxis.range()[0])
        .attr('x2', yAxis.range()[1])
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke', 'black')
        .attr("stroke-opacity", 0.3)
        .style("pointer-events", "none")

    toolTipRef.current.showTooltip(event, RecurrentEventsTooltipTemplate(props))
}

const pointerLeft = (toolTipRef, toolTipLineRef) => {
    toolTipRef.current.hideTooltip()
    d3.select(toolTipLineRef.current).selectAll('line').remove()
}

const MemoRecurrentEventsPloidyStairstep = memo(RecurrentEventPloidyStairstep)

export default MemoRecurrentEventsPloidyStairstep
