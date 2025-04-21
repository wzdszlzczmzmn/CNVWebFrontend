import * as d3 from 'd3'
import {
    hg38ChromosomeInfo, hg38ChromosomeRanges,
    hg38ChromosomeStartPositions,
    NonSexChromosomeXDomain
} from 'const/ChromosomeInfo'
import { createChromosomeSorter } from "../../../tools/chromosomeTools"
import { preprocessRegions } from "../Shared/RecurrentRegionsPreprocess"

export const preprocessDataNew = (ampRegions, delRegions, scoresGISTIC) => {
    // Amp regions preprocess.
    const significantAmpRegions = preprocessRegions(ampRegions)
    const ampScoresGISTIC = scoresGISTIC.filter(record => record.type === 'Amp')
    const spiltAmpRegionsMap = spiltRegions(significantAmpRegions, ampScoresGISTIC)

    // Del regions preprocess.
    const significantDelRegions = preprocessRegions(delRegions)
    const delScoresGISTIC = scoresGISTIC.filter(record => record.type === 'Del')
    const spiltDelRegionsMap = spiltRegions(significantDelRegions, delScoresGISTIC)

    return {
        significantAmpRegions,
        spiltAmpRegionsMap,
        significantDelRegions,
        spiltDelRegionsMap
    }
}

export const spiltRegions = (significantRegions, regions) => {
    const chromosomeList =
        Object.keys(
            hg38ChromosomeStartPositions
        ).filter(
            key => !['chrX', 'chrY'].includes(key)
        ).sort(
            createChromosomeSorter()
        )

    const chromosomeRegionsMap = chromosomeList.reduce((acc, chr) => {
        acc[chr] = []
        return acc
    }, {})

    for (const region of regions) {
        chromosomeRegionsMap[region.chromosome].push(region)
    }

    const result = {}
    for (const chromosome of chromosomeList) {
        const chromosomeRegions = chromosomeRegionsMap[chromosome]
        const chromosomeSignificantRegions = significantRegions.filter(
            region => region.chromosome === chromosome
        )

        const splitResult = splitSingleChromosomeRegionsByOverlap(chromosomeRegions, chromosomeSignificantRegions)
        result[chromosome] = {
            normalRegions: splitResult.nonOverlappingRegions,
            significantRegions: splitResult.overlappingRegions
        }
    }

    return result
}

const splitSingleChromosomeRegionsByOverlap = (regions, significantRegions) => {
    const overlappingRegions = []
    const nonOverlappingRegions = []

    for (const region of regions) {
        let fragments = [region]

        for (const sig of significantRegions) {
            const newFragments = []

            for (const frag of fragments) {
                // No overlap
                if (frag.end < sig.start || frag.start > sig.end) {
                    newFragments.push(frag)
                } else {
                    // Overlapping part
                    const overlapStart = Math.max(frag.start, sig.start)
                    const overlapEnd = Math.min(frag.end, sig.end)
                    overlappingRegions.push(
                        {
                            ...frag,
                            start: overlapStart,
                            end: overlapEnd,
                        }
                    )

                    // Left non-overlapping part — right aligned to overlapStart
                    if (frag.start < overlapStart) {
                        newFragments.push(
                            {
                                ...frag,
                                end: overlapStart
                            }
                        )
                    }

                    // Right non-overlapping part — left aligned to overlapEnd
                    if (frag.end > overlapEnd) {
                        newFragments.push(
                            {
                                ...frag,
                                start: overlapEnd
                            }
                        )
                    }
                }
            }

            fragments = newFragments
        }

        nonOverlappingRegions.push(...fragments)
    }

    return { overlappingRegions, nonOverlappingRegions }
}

export const transformRegionsToNodes = (regionsMap, valueType, chromosome) => {
    if (chromosome === 'All') {
        const normalNodes = []
        const significantNodes = []

        for (const chromosome of Object.keys(regionsMap).sort(createChromosomeSorter())) {
            normalNodes.push(
                ...extractSingleChromosomeNodes(
                    regionsMap[chromosome].normalRegions,
                    chromosome,
                    valueType,
                    true
                )
            )
            significantNodes.push(
                ...extractSingleChromosomeNodes(
                    regionsMap[chromosome].significantRegions,
                    chromosome,
                    valueType,
                    true
                )
            )
        }

        return {
            normalNodes: normalNodes,
            significantNodes: significantNodes
        }
    } else {
        return {
            normalNodes: extractSingleChromosomeNodes(
                regionsMap[chromosome].normalRegions,
                chromosome,
                valueType,
                false
            ),
            significantNodes: extractSingleChromosomeNodes(
                regionsMap[chromosome].significantRegions,
                chromosome,
                valueType,
                false
            )
        }
    }
}

const extractSingleChromosomeNodes = (regions, chromosome, valueType, isGlobalCoordinate) => {
    if (regions.length === 0) {
        return [
            {
                x: calculateGenomeCoordinate(1, chromosome, isGlobalCoordinate),
                y: 0
            },
            {
                x: calculateGenomeCoordinate(hg38ChromosomeInfo[chromosome], chromosome, isGlobalCoordinate),
                y: 0
            }
        ]
    }

    const nodes = [
        {
            x: calculateGenomeCoordinate(1, chromosome, isGlobalCoordinate),
            y: 0
        },
        {
            x: calculateGenomeCoordinate(regions[0].start, chromosome, isGlobalCoordinate),
            y: regions[0][valueType]
        }
    ]
    let prevValue = regions[0][valueType]
    let prevEnd = calculateGenomeCoordinate(regions[0].end, chromosome, isGlobalCoordinate)
    for (const region of regions.slice(1)) {
        const start = calculateGenomeCoordinate(region.start, chromosome, isGlobalCoordinate)
        const end = calculateGenomeCoordinate(region.end, chromosome, isGlobalCoordinate)
        const value = region[valueType]

        if (prevEnd + 1 === start) {
            if (prevValue !== value) {
                nodes.push({
                    x: start,
                    y: value
                })
            }
        } else {
            nodes.push({
                x: prevEnd,
                y: 0
            })
            nodes.push({
                x: start,
                y: value
            })
        }

        prevEnd = end
        prevValue = value
    }

    if (prevEnd !== calculateGenomeCoordinate(hg38ChromosomeInfo[chromosome], chromosome, isGlobalCoordinate)) {
        nodes.push({
            x: prevEnd,
            y: 0
        })
        nodes.push({
            x: calculateGenomeCoordinate(hg38ChromosomeInfo[chromosome], chromosome, isGlobalCoordinate),
            y: 0
        })
    } else {
        nodes.push({
            x: calculateGenomeCoordinate(hg38ChromosomeInfo[chromosome], chromosome, isGlobalCoordinate),
            y: 0
        })
    }

    return nodes
}

const calculateGenomeCoordinate = (position, chromosome, isGlobalCoordinate) => {
    if (isGlobalCoordinate) {
        return position + hg38ChromosomeStartPositions[chromosome]
    } else {
        return position
    }
}

export const calculateYAxisMax = (scoresGISTIC, chromosome, valueType) => {
    const filteredScoresGISTIC =
        chromosome === 'All' ? (
            scoresGISTIC
        ) : (
            scoresGISTIC.filter(record => record.chromosome === chromosome)
        )

    return Math.ceil(
        filteredScoresGISTIC.reduce(
            (max, r) => {
                const val = r[valueType]

                return val > max ? val : max
            },
            -Infinity
        )
    )
}

export const calculateChromosomeXAxisPositions = (chromosome) => {
    if (chromosome === 'All') {
        return hg38ChromosomeRanges
    } else {
        return {
            [chromosome]: [1, hg38ChromosomeInfo[chromosome]]
        }
    }
}

export const calculateChromosomeSignificantRegions = (significantRegions, chromosome) => {
    if (chromosome === 'All') {
        return significantRegions.map(
            region => ({
                ...region,
                start: region.start + hg38ChromosomeStartPositions[region.chromosome],
                end: region.end + hg38ChromosomeStartPositions[region.chromosome],
                anchorPosition: (region.start + region.end) / 2 + hg38ChromosomeStartPositions[region.chromosome],
                labelPosition: (region.start + region.end) / 2 + hg38ChromosomeStartPositions[region.chromosome]
            })
        )
    } else {
        return significantRegions.filter(
            region => region.chromosome === chromosome
        ).map(
            region => ({
                ...region,
                anchorPosition: (region.start + region.end) / 2,
                labelPosition: (region.start + region.end) / 2
            })
        )
    }
}

export const initFigureConfig = (
    width,
    height,
    globalSetting,
    legendSetting,
    titleSetting,
    chromosomeAxisSetting,
    labelSetting
) => {
    const innerWidth = width - globalSetting.marginX * 2
    const innerHeight = height - globalSetting.marginY * 2
    const titleHeight = titleSetting.marginTop + titleSetting.marginBottom + Math.ceil(titleSetting.fontSize * 1.31)
    const legendHeight = legendSetting.marginTop + legendSetting.marginBottom + legendSetting.height

    const figureHeight = innerHeight - titleHeight - legendHeight - 2 * labelSetting.height
    const yOffsetFigure = titleHeight + labelSetting.height
    const figureWidth = innerWidth
    const xOffsetFigure = 0

    const xOffsetLegend = (innerWidth - (legendSetting.width * 2 + legendSetting.itemGap)) / 2
    const yOffsetLegend = innerHeight - legendSetting.marginBottom - legendSetting.height

    const yAxisLength = (figureHeight - chromosomeAxisSetting.height) / 2
    const ampYAxisRange = [yAxisLength, 0]
    const delYAxisRange = [yAxisLength + chromosomeAxisSetting.height, figureHeight]
    const xAxisRange = [0, figureWidth]

    const yOffsetAmpLabel = titleHeight
    const yOffsetDelLabel = titleHeight + labelSetting.height + figureHeight

    return {
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
    }
}

export const createRecurrentRegionTools = (ampYAxisRange, delYAxisRange, xAxisRange, yAxisMax, displaySetting, labelSetting) => {
    let ampYAxis
    let delYAxis

    if (displaySetting.mode === 'Adaptive') {
        ampYAxis = d3.scaleLinear()
            .domain([0, yAxisMax])
            .range(ampYAxisRange)

        delYAxis = d3.scaleLinear()
            .domain([0, yAxisMax])
            .range(delYAxisRange)
    } else {
        ampYAxis = d3.scaleLinear()
            .domain([0, displaySetting.ampYAxisMax])
            .range(ampYAxisRange)

        delYAxis = d3.scaleLinear()
            .domain([0, displaySetting.delYAxisMax])
            .range(delYAxisRange)
    }

    const xDomain =
        displaySetting.chromosome === 'All' ? (
            NonSexChromosomeXDomain
        ) : (
            [0, hg38ChromosomeInfo[displaySetting.chromosome]]
        )

    const xAxis = d3.scaleLinear()
        .domain(xDomain)
        .range(xAxisRange)

    const area = (data, x, y) => {
        return d3.area()
            .curve(d3.curveStepAfter)
            .x(d => x(d.x))
            .y0(y(0))
            .y1(d => y(d.y))
            (data)
    }

    const labelLine = (nodes, x) => {
        return d3.line()
            .curve(d3.curveLinear)
            .x(d => x(d.x))
            .y(d => d.y)
            (nodes)
    }

    const labelLineNodesCreator = (labelPosition, anchorPosition, labelHeight, labelFontSize, isAmp) => {
        const textLength = labelFontSize * 8 * 0.55

        return isAmp ? ([
            {
                x: anchorPosition,
                y: labelHeight
            },
            {
                x: anchorPosition,
                y: (labelHeight + textLength) / 2
            },
            {
                x: labelPosition,
                y: textLength
            }
        ]) : ([
            {
                x: anchorPosition,
                y: 0
            },
            {
                x: anchorPosition,
                y: (labelHeight - textLength) / 2
            },
            {
                x: labelPosition,
                y: labelHeight - textLength
            }
        ])
    }

    return {
        ampYAxis,
        delYAxis,
        xAxis,
        area,
        labelLine,
        labelLineNodesCreator
    }
}
