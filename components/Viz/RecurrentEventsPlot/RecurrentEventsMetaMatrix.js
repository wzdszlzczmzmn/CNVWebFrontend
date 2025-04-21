import { memo, useEffect, useMemo, useRef } from "react"
import * as d3 from "d3"
import { useRecurrentEventsStore } from "../../../stores/RecurrentEventsStore"
import { CNVMetaMatrixTooltipTemplate } from "./TooltipTemplate"

const metaFields = ['gender', 'race', 'ethnicity', 'vitalStatus']

const RecurrentEventsMetaMatrix = ({
    CNVMatrix,
    fileMetas,
    metaMatrixBlockWidth,
    xOffset,
    yOffset,
    toolTipRef
}) => {
    const samplePloidyStairstepSetting = useRecurrentEventsStore((state) => state.samplePloidyStairstepSetting)
    const metaMatrixSetting = useRecurrentEventsStore((state) => state.metaMatrixSetting)

    const metaMatrixRef = useRef(null)

    const colorScales = useMemo(
        () => getMetaMatrixColorScale(getMetaMatrixPropsValues(metaFields, fileMetas)),
        [fileMetas]
    )

    const filteredMetas = preprocess(CNVMatrix, fileMetas)

    useEffect(() => {
        const gMetaMatrix = d3.select(metaMatrixRef.current)

        gMetaMatrix.selectAll('g')
            .data(metaFields)
            .join('g')
            .attr('transform', (d, i) => `translate(0, ${i * metaMatrixSetting.height})`)
            .each(function (metaField) {
                const g = d3.select(this)

                g.selectAll('rect')
                    .data(filteredMetas)
                    .join('rect')
                    .attr('width', metaMatrixBlockWidth)
                    .attr('height', metaMatrixSetting.height)
                    .attr('x', (d, i) => i === 0 ? 0 : i * (metaMatrixBlockWidth + samplePloidyStairstepSetting.chartGap))
                    .attr('fill', d => colorScales[metaField](d[metaField]))
                    .on('pointermove',
                        (event, d) => toolTipRef.current.showTooltip(
                            event,
                            CNVMetaMatrixTooltipTemplate(
                                d['aliquot'],
                                colorScales[metaField](d[metaField]),
                                metaField,
                                d[metaField]
                            )
                        )
                    )
                    .on('pointerleave', toolTipRef.current.hideTooltip)

                g.selectAll('text')
                    .data([1])
                    .join('text')
                    .attr('x', -8)
                    .attr('dy', '1em')
                    .attr('text-anchor', 'end')
                    .text(metaField)
            })
    }, [colorScales, filteredMetas, metaMatrixBlockWidth, metaMatrixSetting.height, samplePloidyStairstepSetting.chartGap, toolTipRef])

    return (
        <g ref={metaMatrixRef} transform={`translate(${xOffset}, ${yOffset})`}>

        </g>
    )
}

const preprocess = (matrix, metas) => {
    const fileIds = matrix.map(item => item['file_id'])
    const metaMap = new Map(metas.map(m => [m.fileId, m]));
    return fileIds.map(id => metaMap.get(id))
}

const getMetaMatrixPropsValues = (enumProps, ObjectList) => {
    const enumPropsValues = {}

    enumProps.forEach((enumProp) => {
        enumPropsValues[enumProp] = [...new Set(ObjectList.map(object => object[enumProp]))].sort()
    })

    return enumPropsValues
}

const getMetaMatrixColorScale = (enumPropsValues) => {
    const genderColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['gender'])
        .range(["#E57373", "#4A90E2", "#A0A0A0", "#4A4A4A"])

    const vitalStatusColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['vitalStatus'])
        .range(["#28a745", "#dc3545", "#A0A0A0", "#4A4A4A"])

    const ethnicityColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['ethnicity'])
        .range(d3.schemePaired)

    const raceColorScale = d3.scaleOrdinal()
        .domain(enumPropsValues['race'])
        .range(d3.schemePaired.slice(5).concat(d3.schemePaired.slice(0, 5)))

    return {
        'gender': genderColorScale,
        'vitalStatus': vitalStatusColorScale,
        'ethnicity': ethnicityColorScale,
        'race': raceColorScale,
    }
}

const MemoRecurrentEventsMetaMatrix = memo(RecurrentEventsMetaMatrix)

export default MemoRecurrentEventsMetaMatrix
