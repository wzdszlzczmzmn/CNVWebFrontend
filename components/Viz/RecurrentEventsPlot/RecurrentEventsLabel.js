import { preprocessRegions } from "../Shared/RecurrentRegionsPreprocess"
import { memo, useEffect, useMemo, useRef } from "react"
import { useRecurrentEventsStore } from "../../../stores/RecurrentEventsStore"
import { hg38ChromosomeStartPositions } from "../../../const/ChromosomeInfo"
import * as d3 from 'd3'

const RecurrentEventsLabel = ({
    xOffset,
    yOffset,
    recurrentRegions,
    xAxis,
    isLeft
}) => {
    const labelSetting = useRecurrentEventsStore((state) => state.labelSetting)

    const labelRef = useRef(null)

    const regions = useMemo(
        () => mapRegionsToAxis(preprocessRegions(recurrentRegions), xAxis),
        [recurrentRegions, xAxis]
    )

    useEffect(() => {
        const gLabel = d3.select(labelRef.current)

        gLabel.selectAll('text')
            .data(regions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('text')
            .attr('x', isLeft ? 0 : labelSetting.width - (labelSetting.fontSize * 8 * 0.55))
            .attr('y', d => d.labelPosition)
            .attr('font-size', labelSetting.fontSize)
            .attr('dy', '.3em')
            .style('cursor', 'move')
            .text(d => d.cytoband)
            .call(
                d3.drag()
                    .on('drag', function (event, d) {
                        d.labelPosition = event.y

                        d3.select(this)
                            .attr('y', d.labelPosition)

                        gLabel.selectAll('path')
                            .filter(p => `${p.chromosome}_${p.start}_${p.end}` === `${d.chromosome}_${d.start}_${d.end}`)
                            .attr('d', d => labelLine(
                                    labelLineNodesCreator(
                                        d.labelPosition,
                                        d.anchorPosition,
                                        labelSetting.width,
                                        labelSetting.fontSize,
                                        isLeft
                                    )
                                )
                            )
                    })
            )

        gLabel.selectAll('path')
            .data(regions, d => `${d.chromosome}_${d.start}_${d.end}`)
            .join('path')
            .attr('d', d => labelLine(
                    labelLineNodesCreator(
                        d.labelPosition,
                        d.anchorPosition,
                        labelSetting.width,
                        labelSetting.fontSize,
                        isLeft
                    )
                )
            )
            .attr('stroke', 'black')
            .attr('fill', 'none')
    }, [isLeft, labelSetting.fontSize, labelSetting.width, regions, xAxis])

    return (
        <g ref={labelRef} transform={`translate(${xOffset}, ${yOffset})`}></g>
    )
}

const mapRegionsToAxis = (regions, axis) => {
    return regions.map(
        region => ({
            ...region,
            start: region.start + hg38ChromosomeStartPositions[region.chromosome],
            end: region.end + hg38ChromosomeStartPositions[region.chromosome],
            anchorPosition: axis((region.start + region.end) / 2 + hg38ChromosomeStartPositions[region.chromosome]),
            labelPosition: axis((region.start + region.end) / 2 + hg38ChromosomeStartPositions[region.chromosome])
        })
    )
}

const labelLine = (nodes) => {
    return d3.line()
        .curve(d3.curveLinear)
        .x(d => d.x)
        .y(d => d.y)
        (nodes)
}

const labelLineNodesCreator = (labelPosition, anchorPosition, labelWidth, labelFontSize, isLeft) => {
    const textLength = labelFontSize * 8 * 0.55

    return isLeft ? ([
        {
            x: labelWidth,
            y: anchorPosition
        },
        {
            x: (labelWidth + textLength) / 2,
            y: anchorPosition
        },
        {
            x: textLength,
            y: labelPosition
        }
    ]) : ([
        {
            x: 0,
            y: anchorPosition
        },
        {
            x: (labelWidth - textLength) / 2,
            y: anchorPosition
        },
        {
            x: labelWidth - textLength,
            y: labelPosition
        }
    ])
}

const MemoRecurrentEventsLabel = memo(RecurrentEventsLabel)

export default MemoRecurrentEventsLabel
