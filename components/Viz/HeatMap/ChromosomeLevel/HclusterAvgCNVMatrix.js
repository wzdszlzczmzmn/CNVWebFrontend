import {useEffect, useRef} from "react";
import _ from "lodash";
import * as d3 from "d3";
import {hclusterInfoTooltipTemplate, hclusterCNVMatrixTooltipTemplate} from '../../ToolTip/CNVHeatMapToolTipTemplates'

export const HclusterAvgCNVMatrix = (
    {
        marginLeft,
        paddingTop,
        hclusterInfoWidth,
        hclusterInfoHeight,
        colorScales,
        blockWidth,
        blockGap,
        CNVMatrixObject,
        CNVMetaObject,
        metaHeaders,
        binIndex,
        chromosomeRange,
        headerBlockOffset,
        showTooltip,
        hideTooltip,
        getCNVColor
    }
) => {
    const hclusterAvgCNVMatrixContainerRef = useRef(null)

    useEffect(() => {
        const hclusterAvgCNVMatrixContainer = d3.select(hclusterAvgCNVMatrixContainerRef.current)
        const hclusterCNVAvgMatrix = calculateEachHclusterCNVAvgMatrix(CNVMatrixObject, CNVMetaObject, chromosomeRange, metaHeaders)

        hclusterAvgCNVMatrixContainer.selectAll(':scope > g')
            .data(Object.keys(hclusterCNVAvgMatrix))
            .join('g')
            .attr('transform', (d, i) => `translate(0, ${hclusterInfoHeight * i})`)
            .each(function (hcluster) {
                const gHcluster = d3.select(this)

                let gHclusterInfo = gHcluster.select('.hclusterInfo')
                if (gHclusterInfo.empty()) {
                    gHclusterInfo = gHcluster.append('g')
                        .attr('class', 'hclusterInfo')
                }

                gHclusterInfo.selectAll('rect')
                    .data([hcluster])
                    .join('rect')
                    .each(function (hcluster) {
                        d3.select(this)
                            .attr('transform', `translate(${-hclusterInfoWidth}, 0)`)
                            .attr('fill', d => colorScales['hcluster'](d))
                            .attr('width', hclusterInfoWidth - blockGap)
                            .attr('height', hclusterInfoHeight - blockGap)
                            .on('mouseenter', event => showTooltip(event, hclusterInfoTooltipTemplate(hcluster, hclusterCNVAvgMatrix[hcluster]['fileNum'])))
                            .on('mousemove', event => showTooltip(event, hclusterInfoTooltipTemplate(hcluster, hclusterCNVAvgMatrix[hcluster]['fileNum'])))
                            .on('mouseout', hideTooltip)
                    })

                let gChromosome = gHcluster.select('.chromosome')
                if (gChromosome.empty()) {
                    gChromosome = d3.select(this).append('g')
                        .attr('class', 'chromosome')
                }

                gChromosome.selectAll('g')
                    .data(Object.keys(hclusterCNVAvgMatrix[hcluster]['CNVAvg']))
                    .join('g')
                    .attr('transform', (d, i) => `translate(${headerBlockOffset[i][1]}, 0)`)
                    .each(function (chr) {
                        d3.select(this)
                            .selectAll('rect')
                            .data(hclusterCNVAvgMatrix[hcluster]['CNVAvg'][chr])
                            .join('rect')
                            .each(function (value, i) {
                                d3.select(this)
                                    .attr('x', i * blockWidth)
                                    .attr('width', blockWidth - blockGap)
                                    .attr('height', hclusterInfoHeight - blockGap)
                                    .attr('fill', d => getCNVColor(d))
                                    .on('mouseenter', event => showTooltip(event, hclusterCNVMatrixTooltipTemplate(hcluster, getCNVColor(value), binIndex[chr][i], value)))
                                    .on('mousemove', event => showTooltip(event, hclusterCNVMatrixTooltipTemplate(hcluster, getCNVColor(value), binIndex[chr][i], value)))
                                    .on('mouseout', hideTooltip)
                            })
                    })
            })
    }, [CNVMatrixObject, CNVMetaObject, binIndex, blockGap, blockWidth, chromosomeRange, colorScales, getCNVColor, hclusterInfoHeight, hclusterInfoWidth, headerBlockOffset, hideTooltip, metaHeaders, showTooltip]);

    return (
        <>
            <g ref={hclusterAvgCNVMatrixContainerRef} transform={`translate(${marginLeft}, ${paddingTop})`}></g>
        </>
    )
}

const calculateEachHclusterCNVAvgMatrix = (CNVMatrixObject, CNVMetaObject, chromosomeRange, metaHeaders) => {
    const hclusterColumn = Object.values(CNVMetaObject).map(item => item[metaHeaders.indexOf('hcluster')])
    const hclusters = [...new Set(hclusterColumn)].sort((a, b) => a - b)
    const eachHclusterFileIds = {}

    for (let hcluster of hclusters) {
        eachHclusterFileIds[hcluster] = Object.entries(CNVMetaObject)
            .filter(([key, value]) => value[metaHeaders.indexOf('hcluster')] === hcluster)
            .map(([key]) => key)
    }


    return getHclusterCNVMeanMatrix(CNVMatrixObject, eachHclusterFileIds, chromosomeRange)
}

const getHclusterCNVMeanMatrix = (CNVMatrixObject, eachHclusterFileIds, chromosomeRange) => {
    const hclusterMatrixDict = {}

    for (let hcluster of Object.keys(eachHclusterFileIds)) {
        const hclusterCNVMatrix = Object.values(_.pick(CNVMatrixObject, eachHclusterFileIds[hcluster]))
        const zipContent = _.zip(...hclusterCNVMatrix).map(column => _.mean(column))
        const CNVAvg = {}

        for (let chr in chromosomeRange) {
            CNVAvg[chr] = zipContent.slice(chromosomeRange[chr][0], chromosomeRange[chr][1])
        }

        hclusterMatrixDict[hcluster] = {'fileNum': hclusterCNVMatrix.length, 'CNVAvg': CNVAvg}
    }

    return hclusterMatrixDict
}
