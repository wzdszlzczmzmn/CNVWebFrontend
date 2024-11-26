import * as d3 from 'd3'
import React, {memo, useEffect, useMemo, useRef, useState} from 'react'
import {fetcher, fetcherCSV, getCNVCutURL, getCNVMatrixMetaURL, getCNVMetaURL, getProjectCNVMatrixURL} from 'data/get'
import useSWR from "swr"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import * as Papa from "papaparse"
import _ from "lodash"
import parseNewick from 'tools/newick'
import * as PhylogeneticTree from 'components/Viz/PhylogeneticTree'
import * as CNVMatrixCalculate from 'components/Viz/VizCalculateFunc/CNVMatrixCalculate'
import CustomTooltip from 'components/Viz/ToolTip/ToolTip'
import {createPortal} from "react-dom"

export function LinePlot({
                             data,
                             width = 640,
                             height = 400,
                             marginTop = 20,
                             marginRight = 20,
                             marginBottom = 30,
                             marginLeft = 40
                         }) {
    const gx = useRef();
    const gy = useRef();
    const x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
    const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
    const line = d3.line((d, i) => x(i), y);
    useEffect(() => void d3.select(gx.current).call(d3.axisBottom(x)), [gx, x]);
    useEffect(() => void d3.select(gy.current).call(d3.axisLeft(y)), [gy, y]);
    return (
        <svg width={width} height={height}>
            <g ref={gx} transform={`translate(0,${height - marginBottom})`}/>
            <g ref={gy} transform={`translate(${marginLeft},0)`}/>
            <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data)}/>
            <g fill="white" stroke="currentColor" strokeWidth="1.5">
                {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d)} r="2.5"/>))}
            </g>
        </svg>
    )
}

// Process CNVMeta Data in order to meet the need of visualization. Return each metadata column max and min value
// except the file_id column, each column value array except the file_id column.
const getCNVMetaRangeAndObject = (CNVMeta) => {
    const indexColumn = CNVMeta[0]
    const content = CNVMeta.slice(1, CNVMeta.length)
        .map(row => row.map(((item, index) => index === 0 ? item : parseFloat(item))))

    const contentZip = _.zip(...content)

    const metaRanges = {}

    for (let index = 1; index < indexColumn.length; index++) {
        const max = _.ceil(_.max(contentZip[index]), 0)
        const min = _.floor(_.min(contentZip[index]), 0)
        metaRanges[indexColumn[index]] = [min === -0 ? 0 : min, max === -0 ? 0 : max]
    }

    const CNVMetaObject = {}

    for (let i = 0; i < content.length; i++) {
        const contentRow = content[i]
        CNVMetaObject[contentRow[0]] = contentRow.slice(1, contentRow.length)
    }

    const metaHeaders = indexColumn.slice(1, indexColumn.length)

    return {metaRanges, CNVMetaObject, metaHeaders}
}

const getClusterMetaLeaves = (CNVMetaObject, leafListDict) => {
    const clusterMetaDict = {}

    for (let leafName of Object.keys(leafListDict)) {
        clusterMetaDict[leafName] = _.pick(CNVMetaObject, leafListDict[leafName])
    }

    return clusterMetaDict
}

const transformCNVMatrixArrayToObject = (CNVMatrix, chromosomeRange) => {
    const index = CNVMatrix[0].slice(1, CNVMatrix[0].length)
    const binContent =
        CNVMatrix.slice(1, CNVMatrix.length).map(row => row.map((item, index) => index === 0 ? item : parseFloat(item)))

    const CNVMatrixObject = {}

    for (let index = 0; index < binContent.length; index++) {
        const binContentRow = binContent[index]
        CNVMatrixObject[binContentRow[0]] = binContentRow.slice(1, binContentRow.length)
    }

    const binIndex = {}

    for (let chr in chromosomeRange) {
        binIndex[chr] = index.slice(parseInt(chromosomeRange[chr][0]), parseInt(chromosomeRange[chr][1]))
    }

    return {binIndex, CNVMatrixObject}
}

const calculateHeaderBlockOffset = (CNVMatrixMeta, rowWidth) => {
    const headerBlockOffset = [['chr1', 0, rowWidth * CNVMatrixMeta[0][1]]]
    for (let index = 1; index < CNVMatrixMeta.length; index++) {
        headerBlockOffset.push(
            [CNVMatrixMeta[index][0], CNVMatrixMeta[index - 1][1] * rowWidth + headerBlockOffset[index - 1][1],
                rowWidth * CNVMatrixMeta[index][1]])
    }

    return headerBlockOffset
}

const parseTree = (treeString, treeGraphicWidth) => {
    const root = d3.hierarchy(parseNewick(treeString), d => d.children)
        .sum(d => d.children ? 0 : 1)
    const dx = 10
    const dy = treeGraphicWidth / (root.height + 1)

    // create a tree layout.
    const tree = d3.cluster().nodeSize([dx, dy])

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name))
    tree(root)

    return root
}

const resetTreeXPosition = (root, leafListDict, rowHeight) => {
    const leafOffset = {}
    const leaves = Object.keys(leafListDict)

    for (let i = 0; i < leaves.length; i++) {
        leafOffset[i] = i === 0 ? 0 : leafListDict[leaves[i - 1]].length + leafOffset[i - 1]
    }

    const leavesNode = root.leaves()

    for (let i = 0; i < leavesNode.length; i++) {
        leavesNode[i].x = (leafOffset[i] + leafListDict[leaves[i]].length / 2) * rowHeight
    }

    for (let node of root.descendants().reverse()) {
        if (node.children) {
            node.x = (node.children[1].x + node.children[0].x) / 2
        }
    }
}

const getLeafListOfCurrentLeafs = (CNVCut, root) => {
    const leaves = root.leaves()
    const leafListDict = {}

    for (let leaf of leaves) {
        leafListDict[leaf.data.name] = CNVCut[leaf.data.name]['leafs']
    }

    return leafListDict
}

const createPhylogeneticTree = (root, treeContainer, treeGraphicWidth, heatMapContainer, CNVCut, goToTreeNode, showTooltip, hideTooltip) => {
    PhylogeneticTree.setTreeNodeVerticalPosition(
        root, root.data.length = 0, treeGraphicWidth / PhylogeneticTree.treeBranchMaxLength(root))

    let gLink = treeContainer.select('.links')
    if (gLink.empty()) {
        gLink = treeContainer.append('g')
            .attr('class', 'links')
            .attr('fill', 'none')
            .attr('stroke', '#000000')
    }

    let gNode = treeContainer.select('.nodes')
    if (gNode.empty()) {
        gNode = treeContainer.append('g')
            .attr('class', 'nodes')
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'all')
    }

    gLink.selectAll('path')
        .data(root.links())
        .join('path')
        .attr('d', PhylogeneticTree.linkUseBranchLength)

    gNode.selectAll('g')
        .data(root.descendants(), d => d.data.name)
        .join(
            enter => {
                enter.append('g')
                    .attr('transform', PhylogeneticTree.nodePositionUseBranchLength)
                    .append('circle')
                    .attr('r', 4)
                    .each(function (node) {
                        const nodeName = node.data.name
                        const nodeTreeDetail = CNVCut[nodeName]

                        if (!node.children) {
                            d3.select(this)
                                .on('mouseenter', event => {
                                    leafMouseOver(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                    showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                })
                                .on('mouseout', () => {
                                    hideTooltip()
                                    leafMouseOut(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                })
                                .on('mousemove', event => showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                        } else {
                            d3.select(this)
                                .on('mouseenter', event => {
                                    showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                })
                                .on('mouseout', () => {
                                    hideTooltip()
                                })
                                .on('mousemove', event => showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                        }

                        CNVCut[node.data.name]['leafs'].length === 1 ?
                            d3.select(this)
                                .attr('fill', '#999')
                            :
                            d3.select(this)
                                .attr('fill', '#333')
                                .on('click', function (event, d) {
                                    goToTreeNode(d.data.name)
                                })
                    })
            },
            update => {
                update.attr('transform', PhylogeneticTree.nodePositionUseBranchLength)
                    .each(function (node) {
                        const nodeName = node.data.name
                        const nodeTreeDetail = CNVCut[nodeName]

                        if (!node.children) {
                            d3.select(this)
                                .on('mouseenter', event => {
                                    leafMouseOver(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                    showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                })
                                .on('mouseout', () => {
                                    hideTooltip()
                                    leafMouseOut(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                })
                                .on('mousemove', event => showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                        } else {
                            d3.select(this)
                                .on('mouseenter', event => {
                                    showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                })
                                .on('mouseout', () => {
                                    hideTooltip()
                                })
                                .on('mousemove', event => showTooltip(event, treeNodeTooltipJSX(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                        }

                        CNVCut[node.data.name]['leafs'].length === 1 ?
                            d3.select(this)
                                .select('circle')
                                .attr('fill', '#999')
                            :
                            d3.select(this)
                                .select('circle')
                                .attr('fill', '#333')
                                .on('click', function (event, d) {
                                    goToTreeNode(d.data.name)
                                })
                    })
            },
            exit => {
                exit.transition()
                    .duration(500)
                    .attr('fill-opacity', 0)
                    .remove()
            }
        )
}

// Create Color Scale for Whole HeatMap Visualization.
const createHeatMapColorScale = (metaRanges) => {
    // CNV Color Legend
    const colorScaleLow = d3.scaleSequential()
        .domain([0, 2])
        .interpolator(d3.interpolateRgb('#add8e6', '#F5F5F5'))
    const colorScaleHigh = d3.scaleSequential()
        .domain([2, 10])
        .interpolator(d3.interpolateRgb('#F5F5F5', '#6A0220'))

    // CNV Meta Color Legend
    const hclusterColorScale = d3.scaleSequential()
        .domain(metaRanges['hcluster'])
        .interpolator(d3.interpolateRgb('#f9f871', '#0090a9'))

    const ePC1ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_PC1'])
        .interpolator(d3.interpolateRgb('#c4a1d3', '#ad49e1'))

    const ePC2ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_PC2'])
        .interpolator(d3.interpolateRgb('#52b199', '#0d7c66'))

    const eTSNE1ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_TSNE1'])
        .interpolator(d3.interpolateRgb('#d88f92', '#c63c51'))

    const eTSNE2ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_TSNE2'])
        .interpolator(d3.interpolateRgb('#bad9ff', '#3572ef'))

    const eUMAP1ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_UMAP1'])
        .interpolator(d3.interpolateRgb('#ffa699', '#ff7f3e'))

    const eUMAP2ColorScale = d3.scaleSequential()
        .domain(metaRanges['e_UMAP2'])
        .interpolator(d3.interpolateRgb('#f0e8fa', '#FF76CE'))

    return {
        'CNVLow': colorScaleLow,
        'CNVHigh': colorScaleHigh,
        'hcluster': hclusterColorScale,
        'e_PC1': ePC1ColorScale,
        'e_PC2': ePC2ColorScale,
        'e_TSNE1': eTSNE1ColorScale,
        'e_TSNE2': eTSNE2ColorScale,
        'e_UMAP1': eUMAP1ColorScale,
        'e_UMAP2': eUMAP2ColorScale
    }
}

const appendMetaInfoToSVG = (clusterMetaDict, rowHeight, metaWidth, colorScales, heatMapContainer, blockGap, showTooltip, hideTooltip) => {
    const scaleMap = ['hcluster', 'e_PC1', 'e_PC2', 'e_TSNE1', 'e_TSNE2', 'e_UMAP1', 'e_UMAP2']

    heatMapContainer.each(function (leaf) {
        let metaInfoContainer = d3.select(this).select('.metaInfo')
        if (metaInfoContainer.empty()) {
            metaInfoContainer = d3.select(this)
                .append('g')
                .attr('class', 'metaInfo')
        }

        metaInfoContainer
            .selectAll('g')
            .data(Object.keys(clusterMetaDict[leaf]))
            .join('g')
            .attr('transform', (d, i) => `translate(0, ${i * rowHeight})`)
            .each(function (fileItem) {
                d3.select(this)
                    .selectAll('rect')
                    .data(d => clusterMetaDict[leaf][d])
                    .join('rect')
                    .attr('x', (d, i) => metaWidth * i)
                    .attr('width', metaWidth - blockGap)
                    .attr('height', rowHeight - blockGap)
                    .attr('fill', (d, i) => colorScales[scaleMap[i]](d))
                    .each(function (d, i) {
                        d3.select(this)
                            .on('mouseenter',
                                event => showTooltip(event, CNVMatrixTooltipJSX(fileItem, colorScales[scaleMap[i]](d), scaleMap[i], d)))
                            .on('mousemove',
                                event => showTooltip(event, CNVMatrixTooltipJSX(fileItem, colorScales[scaleMap[i]](d), scaleMap[i], d)))
                            .on('mouseout', hideTooltip)
                    })
            })
    })
}

const appendHeaderToSVG = (headerBlockOffset, headerContainer, headerBlockHeight, metaHeaders, metaOffset, metaWith, heatMapContainer, rowWidth, CNVMatrixMeta, blockGap, showTooltip, hideTooltip) => {
    const chromosomeList = CNVMatrixMeta.map(item => item[0])
    const chromosomeLengthList = CNVMatrixMeta.map(item => item[1])

    let chromosomeHeaderContainer = headerContainer.select('.chromosomeHeader')
    if (chromosomeHeaderContainer.empty()) {
        chromosomeHeaderContainer = headerContainer.append('g')
            .attr('class', 'chromosomeHeader')
            .attr('transform', `translate(${metaOffset}, 0)`)
    }

    chromosomeHeaderContainer
        .selectAll('g')
        .data(headerBlockOffset)
        .join(
            enter => {
                const gElement = enter.append('g')
                    .attr('transform', d => `translate(${d[1]}, 0)`)

                gElement.append('rect')
                    .attr('width', d => d[2])
                    .attr('height', headerBlockHeight)
                    .attr('fill', (d, i) => i % 2 === 0 ? '#c6c6c6' : '#303030')
                    .attr('cursor', 'pointer')
                    .attr('pointer-events', 'all')
                    .each(function (d) {
                        const chr = _.replace(d[0], 'chr', 'Chromosome')

                        d3.select(this)
                            .on('mouseenter', event => showTooltip(event, chromosomeHeaderTooltipJSX(chr)))
                            .on('mousemove', event => showTooltip(event, chromosomeHeaderTooltipJSX(chr)))
                            .on('mouseout', hideTooltip)
                    })
                    .on('click', function (event, d) {
                        const chr = d[0]
                        const afterChr = chromosomeList.slice(chromosomeList.indexOf(chr) + 1, chromosomeList.length)
                        const chrLength = chromosomeLengthList[chromosomeList.indexOf(chr)]

                        expandChromosomeCNVViz(
                            chr,
                            afterChr,
                            heatMapContainer,
                            chrLength,
                            rowWidth,
                            d,
                            this.parentNode,
                            chromosomeHeaderContainer,
                            blockGap)
                    })

                gElement.append('text')
                    .attr('x', d => d[2] / 2)
                    .attr('y', headerBlockHeight / 2)
                    .attr('pointer-events', 'none')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.35em')
                    .text(d => d[0].slice(3, d[0].length))
                    .attr('fill', (d, i) => i % 2 === 0 ? '#000000' : '#ffffff')
            },
            update => {
                update.each(function () {
                    const gElement = d3.select(this)
                        .attr('transform', d => `translate(${d[1]}, 0)`)

                    gElement.select('rect')
                        .attr('width', d => d[2])
                        .on('click', function (event, d) {
                            const chr = d[0]
                            const afterChr = chromosomeList.slice(chromosomeList.indexOf(chr) + 1, chromosomeList.length)
                            const chrLength = chromosomeLengthList[chromosomeList.indexOf(chr)]

                            expandChromosomeCNVViz(
                                chr,
                                afterChr,
                                heatMapContainer,
                                chrLength,
                                rowWidth,
                                d,
                                this.parentNode,
                                chromosomeHeaderContainer,
                                blockGap)
                        })

                    gElement.select('text')
                        .attr('x', d => d[2] / 2)
                })
            }
        )

    let metaHeaderContainer = headerContainer.select('.metaHeader')
    if (metaHeaderContainer.empty()) {
        metaHeaderContainer = headerContainer.append('g')
            .attr('class', 'metaHeader')
            .attr('transform', `translate(0, ${headerBlockHeight})`)
    }

    metaHeaderContainer
        .selectAll('text')
        .data(metaHeaders)
        .join(
            enter => enter.append('text')
                .attr('dy', '0.75em')
                .attr('font-size', '12')
                .attr('font-family', 'sans-serif')
                .attr('transform', (d, i) => `rotate(-90) translate(4, ${metaWith * i})`)
                .text(d => d.split('_').pop())
        )
}

const expandChromosomeCNVViz = (chr, afterChr, heatMapContainer, chrLength, width, headerDatum, headerClicked, chromosomeHeaderContainer, blockGap) => {
    const scale = 5
    const offset = chrLength * width * (scale - 1)

    const chromosomeSelection = heatMapContainer.selectAll('.chromosome').selectAll('g')
    const currentChromosomeSelection = chromosomeSelection.filter(function (d) {
        return d === chr
    })
    const afterChromosomeSelection = chromosomeSelection.filter(function (d) {
        return afterChr.includes(d)
    })
    const afterHeaderSelection = chromosomeHeaderContainer.selectAll('g').filter(function (d) {
        return afterChr.includes(d[0])
    })

    if (parseFloat(currentChromosomeSelection.select('rect').attr('width')) !== width - blockGap) {
        afterChromosomeSelection.each(function () {
            const currentTransform = d3.select(this).attr('transform')
            const currentXOffset = parseFloat(currentTransform.match(/translate\(([\d.]+), 0\)/)[1])

            d3.select(this)
                .attr('transform', `translate(${currentXOffset - offset}, 0)`)
        })
        currentChromosomeSelection.selectAll('rect').attr('width', width - blockGap).attr('x', (d, i) => i * width)

        d3.select(headerClicked).select('rect').attr('width', chrLength * width)
        d3.select(headerClicked).select('text').attr('x', (chrLength * width) / 2)
        afterHeaderSelection.each(function () {
            const currentTransform = d3.select(this).attr('transform')
            const currentXOffset = parseFloat(currentTransform.match(/translate\(([\d.]+), 0\)/)[1])

            d3.select(this)
                .attr('transform', `translate(${currentXOffset - offset}, 0)`)
        })
    } else {
        afterChromosomeSelection.each(function () {
            const currentTransform = d3.select(this).attr('transform')
            const currentXOffset = parseFloat(currentTransform.match(/translate\(([\d.]+), 0\)/)[1])

            d3.select(this)
                .attr('transform', `translate(${currentXOffset + offset}, 0)`)
        })
        currentChromosomeSelection.selectAll('rect').attr('width', scale * width - blockGap).attr('x', (d, i) => i * scale * width)

        d3.select(headerClicked).select('rect').attr('width', chrLength * scale * width)
        d3.select(headerClicked).select('text').attr('x', (chrLength * scale * width) / 2)
        afterHeaderSelection.each(function () {
            const currentTransform = d3.select(this).attr('transform')
            const currentXOffset = parseFloat(currentTransform.match(/translate\(([\d.]+), 0\)/)[1])

            d3.select(this)
                .attr('transform', `translate(${currentXOffset + offset}, 0)`)
        })
    }
}

const appendClusterCNVHeatMapToSVG = (CNVMatrixObject, heatMapContainer, headerBlockOffset, rowWidth, rowHeight, marginTop, marginLeft, getColor, blockGap, showTooltip, hideTooltip, binIndex) => {
    heatMapContainer.each(function (leaf) {
        const leafMatrix = CNVMatrixObject[leaf]
        console.log(CNVMatrixObject)
        const fileNum = leafMatrix.fileNum

        let chromosomeContainer = d3.select(this).select('.chromosome')
        if (chromosomeContainer.empty()) {
            chromosomeContainer = d3.select(this).append('g')
                .attr('class', 'chromosome')
        }

        chromosomeContainer.selectAll('g')
            .data(Object.keys(leafMatrix.CNVAvg))
            .join('g')
            .attr('transform', (d, i) => `translate(${marginLeft + headerBlockOffset[i][1]}, 0)`)
            .each(function (chr) {
                d3.select(this)
                    .selectAll('rect')
                    .data(leafMatrix.CNVAvg[chr])
                    .join('rect')
                    .each(function (value, i) {
                        d3.select(this)
                            .attr('x', i * rowWidth)
                            .attr('width', rowWidth - blockGap)
                            .attr('height', rowHeight * fileNum - blockGap)
                            .attr('fill', d => getColor(d))
                            .on('mouseenter', event => showTooltip(event, CNVMatrixTooltipJSX(leaf, getColor(value), binIndex[chr][i], value)))
                            .on('mousemove', event => showTooltip(event, CNVMatrixTooltipJSX(leaf, getColor(value), binIndex[chr][i], value)))
                            .on('mouseout', hideTooltip)
                    })
            })
    })
}

const appendHclusterCNVHeatMap = (hclusterCNVAvgMatrix, hclusterAvgMatrixContainer, basicSetting, basicData, headerBlockOffset, showTooltip, hideTooltip) => {
    hclusterAvgMatrixContainer.selectAll(':scope > g')
        .data(Object.keys(hclusterCNVAvgMatrix))
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${basicSetting.hclusterInfoHeight * i})`)
        .each(function (hcluster, i) {
            const gHcluster = d3.select(this)

            let gHclusterInfo = gHcluster.select('.hclusterInfo')
            if (gHclusterInfo.empty()) {
                gHclusterInfo = gHcluster.append('g')
                    .attr('class', 'hclusterInfo')
                    .attr('transform', `translate(${-basicSetting.hclusterInfoWidth}, 0)`)
            }

            gHclusterInfo.selectAll('rect')
                .data([hcluster])
                .join('rect')
                .each(function (hcluster) {
                    d3.select(this)
                        .attr('fill', d => basicData.colorScales['hcluster'](d))
                        .attr('width', basicSetting.hclusterInfoWidth - 0.1)
                        .attr('height', basicSetting.hclusterInfoHeight - 0.1)
                        .on('mouseenter', event => showTooltip(event, hclusterInfoTooltipJSX(hcluster, hclusterCNVAvgMatrix[hcluster]['fileNum'])))
                        .on('mousemove', event => showTooltip(event, hclusterInfoTooltipJSX(hcluster, hclusterCNVAvgMatrix[hcluster]['fileNum'])))
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
                                .attr('x', i * basicSetting.rowWidth)
                                .attr('width', basicSetting.rowWidth - basicSetting.blockGap)
                                .attr('height', basicSetting.hclusterInfoHeight - basicSetting.blockGap)
                                .attr('fill', d => basicData.getColor(d))
                                .on('mouseenter', event => showTooltip(event, hclusterCNVMatrixTooltipJSX(hcluster, basicData.getColor(value), basicData.binIndex[chr][i], value)))
                                .on('mousemove', event => showTooltip(event, hclusterCNVMatrixTooltipJSX(hcluster, basicData.getColor(value), basicData.binIndex[chr][i], value)))
                                .on('mouseout', hideTooltip)
                        })
                })
        })
}

const getChromosomeRange = (CNVMatrixMeta) => {
    const chromosomeRange = {}

    for (let i = 0; i < CNVMatrixMeta.length; i++) {
        chromosomeRange[CNVMatrixMeta[i][0]] =
            i === 0 ?
                [0, CNVMatrixMeta[i][1]]
                : [chromosomeRange[CNVMatrixMeta[i - 1][0]][1], chromosomeRange[CNVMatrixMeta[i - 1][0]][1] + CNVMatrixMeta[i][1]]
    }

    return chromosomeRange
}

const leafMouseOver = (otherLeafHeatMap) => {
    otherLeafHeatMap.attr('opacity', 0.1)
}

const leafMouseOut = (otherLeafHeatMap) => {
    otherLeafHeatMap.attr('opacity', 1)
}

const calculateEachHclusterCNVAvgMatrix = (basicData, chromosomeRange) => {
    const hclusterColumn = Object.values(basicData.CNVMetaObject).map(item => item[0])
    const hclusters = [...new Set(hclusterColumn)].sort((a, b) => a - b)
    const eachHclusterFileIds = {}

    for (let hcluster of hclusters) {
        eachHclusterFileIds[hcluster] = Object.entries(basicData.CNVMetaObject)
            .filter(([key, value]) => value[0] === hcluster)
            .map(([key]) => key)
    }


    return CNVMatrixCalculate.getHclusterCNVMeanMatrix(basicData.CNVMatrixObject, eachHclusterFileIds, chromosomeRange)
}

const getBasicDataForVizCalculation = (CNVMatrix, CNVMeta, chromosomeRange) => {
    CNVMatrix = Papa.parse(CNVMatrix, {skipEmptyLines: true}).data
    const {binIndex, CNVMatrixObject} = transformCNVMatrixArrayToObject(CNVMatrix, chromosomeRange)

    CNVMeta = Papa.parse(CNVMeta, {skipEmptyLines: true}).data
    const {metaRanges, CNVMetaObject, metaHeaders} = getCNVMetaRangeAndObject(CNVMeta)
    const colorScales = createHeatMapColorScale(metaRanges)

    // getColor func is designed for CNV Number Color
    const getColor = (value) => {
        return value < 2 ? colorScales['CNVLow'](value) : colorScales['CNVHigh'](value)
    }

    return {binIndex, CNVMatrixObject, metaRanges, CNVMetaObject, metaHeaders, colorScales, getColor}
}

const getBasicSetting = (setting, CNVMatrixObject, CNVMetaObject) => {
    // SVG Graphic Padding Setting
    const paddingTop = 40
    const blockGap = 0.1

    // Phylogenetic Tree Setting
    const treeGraphicWidth = 300
    const treeGraphicOffset = 20

    // CNV HeatMap each row size setting
    const rowHeight = 5
    const rowWidth = 1.5

    // SVG Graphic size setting calculated by contents and set margin
    const width = rowWidth * (Object.values(CNVMatrixObject)[0].length + Object.values(CNVMetaObject)[0].length)
    const height = rowHeight * Object.values(CNVMatrixObject).length

    // SVG Graphic Meta HeatMap size setting
    const metaWidth = 12
    const metaOffset = metaWidth * Object.values(CNVMetaObject)[0].length

    // SVG Graphic Header Size Setting
    const headerBlockHeight = 25

    // node history block width and height
    const nodeHistoryBlockWidth = 35
    const nodeHistoryBlockHeight = 20

    // hcluster Container setting
    const hclusterPaddingToHeatMap = 40
    const hclusterInfoWidth = 20
    const hclusterInfoHeight = 20

    return {
        paddingTop,
        blockGap,
        treeGraphicWidth,
        treeGraphicOffset,
        rowHeight,
        rowWidth,
        width,
        height,
        metaWidth,
        metaOffset,
        headerBlockHeight,
        nodeHistoryBlockWidth,
        nodeHistoryBlockHeight,
        hclusterPaddingToHeatMap,
        hclusterInfoWidth,
        hclusterInfoHeight
    }
}

const CNVMatrixTooltipJSX = (title, valueColor, valueTitle, value) => (
    <div style={{margin: "0px 0 0", lineHeight: 1}}>
        <div style={{margin: "0px 0 0", lineHeight: 1}}>
            <div
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: "#666",
                    fontWeight: 800,
                    lineHeight: "1.5",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            marginRight: 4,
                            borderRadius: 10,
                            width: 10,
                            height: 10,
                            backgroundColor: valueColor
                        }}
                    />
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                        {valueTitle}
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                        {_.round(value, 3)}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)

const chromosomeHeaderTooltipJSX = (chromosome) => (
    <div style={{margin: "0px 0 0", lineHeight: 1}}>
        <div style={{margin: "0px 0 0", lineHeight: 1}}>
            <span
                style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
            >
              {chromosome}
            </span>
            <div style={{clear: "both"}}/>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)

const treeNodeTooltipJSX = (node, parent, fileNum, distance) => (
    <div style={{margin: "0px 0 0", lineHeight: 1}}>
        <div style={{margin: "0px 0 0", lineHeight: 1}}>
            <div
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: "#666",
                    fontWeight: 800,
                    lineHeight: "1.5",
                }}
            >
                {node}
            </div>

            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                      Parent Node:
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                      {parent}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>


            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                      Number of CNV Files:
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                      {fileNum}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>


            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                      Distance to Root:
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                      {_.round(distance, 3)}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)

const hclusterInfoTooltipJSX = (hcluster, fileNum) => (
    <div style={{margin: "0px 0 0", lineHeight: 1}}>
        <div style={{margin: "0px 0 0", lineHeight: 1}}>
            <div
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: "#666",
                    fontWeight: 800,
                    lineHeight: "1.5",
                }}
            >
                Hcluster: {hcluster}
            </div>

            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                      Number of CNV Files:
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                      {fileNum}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)

const hclusterCNVMatrixTooltipJSX = (hcluster, valueColor, valueTitle, value) => (
    <div style={{margin: "0px 0 0", lineHeight: 1}}>
        <div style={{margin: "0px 0 0", lineHeight: 1}}>
            <div
                style={{
                    fontSize: 18,
                    textAlign: "center",
                    color: "#666",
                    fontWeight: 800,
                    lineHeight: "1.5",
                }}
            >
                Hcluster: {hcluster}
            </div>

            <div
                style={{
                    margin: '10px 0 0',
                    lineHeight: 1,
                }}
            >
                <div
                    style={{
                        margin: '0 0 0',
                        lineHeight: 1,
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            marginRight: 4,
                            borderRadius: 10,
                            width: 10,
                            height: 10,
                            backgroundColor: valueColor
                        }}
                    />
                    <span
                        style={{fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}
                    >
                        {valueTitle}
                    </span>
                    <span
                        style={{
                            float: "right",
                            marginLeft: 20,
                            fontSize: 14,
                            color: "#666",
                            fontWeight: 900
                        }}
                    >
                        {_.round(value, 3)}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)

export const CNVHeatMap = ({CNVMatrixMeta, CNVMatrix, CNVMeta, CNVCut}) => {
    const svgRef = useRef(null)
    const zoomContainerRef = useRef(null)
    const heatMapContainerRef = useRef(null)
    const treeContainerRef = useRef(null)
    const headerContainerRef = useRef(null)
    const nodeHistoryHistoryRef = useRef(null)
    const hclusterAvgMatrixContainerRef = useRef(null)

    const tooltipRef = useRef(null)

    const showToolTip = (event, content) => {
        tooltipRef.current.showTooltip(event, content)
    }

    const hideTooltip = () => {
        tooltipRef.current.hideTooltip()
    }

    const [nodeHistoryList, setNodeHistoryList] = useState(['n0'])
    const [currentNodeIndex, setCurrentNodeIndex] = useState(0)
    const [hclusterContainerPaddingTop, setHclusterContainerPaddingTop] = useState(0)

    const goBackNode = () => {
        if (currentNodeIndex > 0) {
            setCurrentNodeIndex(currentNodeIndex - 1)
        }
    }

    const goForwardNode = () => {
        if (currentNodeIndex < nodeHistoryList.length - 1) {
            setCurrentNodeIndex(currentNodeIndex + 1)
        }
    }

    const goBackRoot = () => {
        setNodeHistoryList(['n0'])
        setCurrentNodeIndex(0)
    }

    const chromosomeRange = useMemo(() => getChromosomeRange(CNVMatrixMeta), [CNVMatrixMeta])

    // Basic Data Processing.
    CNVCut = JSON.parse(CNVCut)
    const basicData =
        useMemo(() => getBasicDataForVizCalculation(CNVMatrix, CNVMeta, chromosomeRange), [CNVMatrix, CNVMeta, chromosomeRange])

    // Basic Setting.
    const basicSetting = useMemo(() =>
            getBasicSetting(null, basicData.CNVMatrixObject, basicData.CNVMetaObject),
        [basicData.CNVMatrixObject, basicData.CNVMetaObject])

    const headerBlockOffset = useMemo(() =>
        calculateHeaderBlockOffset(CNVMatrixMeta, basicSetting.rowWidth), [CNVMatrixMeta, basicSetting.rowWidth])

    useEffect(() => {
        const goToTreeNode = (newTreeNode) => {
            const newNodeHistoryList = [...nodeHistoryList.slice(0, currentNodeIndex + 1), newTreeNode]
            setNodeHistoryList(newNodeHistoryList)
            setCurrentNodeIndex(currentNodeIndex + 1)
        }

        const root = parseTree(CNVCut[nodeHistoryList[currentNodeIndex]]['newick'], basicSetting.treeGraphicWidth)
        const leafListDict = getLeafListOfCurrentLeafs(CNVCut, root)
        const CNVClusterMeanMatrix = CNVMatrixCalculate.getClusterCNVMeanMatrix(basicData.CNVMatrixObject, leafListDict, chromosomeRange)
        const leaves = root.leaves().map(leaf => leaf.data.name)

        const clusterMetaDict = getClusterMetaLeaves(basicData.CNVMetaObject, leafListDict)

        resetTreeXPosition(root, leafListDict, basicSetting.rowHeight)

        const currentTotalFileNum = Object.values(CNVClusterMeanMatrix).reduce((sum, item) => sum + item.fileNum, 0)

        setHclusterContainerPaddingTop(
            basicSetting.paddingTop + basicSetting.headerBlockHeight + basicSetting.hclusterPaddingToHeatMap
            + basicSetting.rowHeight * currentTotalFileNum)

        const heatMapContainer = d3.select(heatMapContainerRef.current)
            .selectAll(':scope > g')
            .data(leaves)
            .join('g')
            .attr('transform',
                (d, i) => `translate(${basicSetting.treeGraphicWidth + basicSetting.treeGraphicOffset}, ${basicSetting.paddingTop + basicSetting.headerBlockHeight + CNVClusterMeanMatrix[leaves[i]]['offset'] * basicSetting.rowHeight})`)

        const treeContainer = d3.select(treeContainerRef.current)
        const headerContainer = d3.select(headerContainerRef.current)

        console.log(basicData.metaHeaders)

        appendMetaInfoToSVG(
            clusterMetaDict,
            basicSetting.rowHeight,
            basicSetting.metaWidth,
            basicData.colorScales,
            heatMapContainer,
            basicSetting.blockGap,
            showToolTip,
            hideTooltip
        )

        createPhylogeneticTree(root, treeContainer, basicSetting.treeGraphicWidth, heatMapContainer, CNVCut, goToTreeNode, showToolTip, hideTooltip)

        appendHeaderToSVG(
            headerBlockOffset,
            headerContainer,
            basicSetting.headerBlockHeight,
            basicData.metaHeaders,
            basicSetting.metaOffset,
            basicSetting.metaWidth,
            heatMapContainer,
            basicSetting.rowWidth,
            CNVMatrixMeta,
            basicSetting.blockGap,
            showToolTip,
            hideTooltip
        )

        appendClusterCNVHeatMapToSVG(
            CNVClusterMeanMatrix,
            heatMapContainer,
            headerBlockOffset,
            basicSetting.rowWidth,
            basicSetting.rowHeight,
            basicSetting.headerBlockHeight + basicSetting.paddingTop,
            basicSetting.metaOffset,
            basicData.getColor,
            basicSetting.blockGap,
            showToolTip,
            hideTooltip,
            basicData.binIndex
        )
    }, [basicData, basicSetting, CNVCut, CNVMatrixMeta, nodeHistoryList, currentNodeIndex, chromosomeRange, headerBlockOffset])

    useEffect(() => {
        const hclusterAvgMatrixContainer = d3.select(hclusterAvgMatrixContainerRef.current)
        const hclusterCNVAvgMatrix = calculateEachHclusterCNVAvgMatrix(basicData, chromosomeRange)

        appendHclusterCNVHeatMap(hclusterCNVAvgMatrix, hclusterAvgMatrixContainer, basicSetting, basicData, headerBlockOffset, showToolTip, hideTooltip)
    }, [basicData, basicSetting, chromosomeRange, headerBlockOffset])

    useEffect(() => {
        // SVG Graphic Zoom Setting. Use d3 zoom to make SVG can be dragged,
        // but due to the max and min of zoom extent is set same, it can not be zoomed.
        const zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', zoomed)

        function zoomed(event) {
            // select the first g element of svg to apply the transform
            d3.select('svg g').attr('transform', event.transform)
        }

        d3.select(svgRef.current).call(zoom)
    }, [])

    return (
        <div style={{height: '90vh'}}>
            <svg ref={svgRef} width={"100%"} height={"100%"}>
                <g ref={zoomContainerRef}>
                    <g ref={heatMapContainerRef}></g>
                    <g ref={treeContainerRef}
                       transform={`translate(8, ${basicSetting.paddingTop + basicSetting.headerBlockHeight})`}></g>
                    <g ref={headerContainerRef}
                       transform={`translate(${basicSetting.treeGraphicOffset + basicSetting.treeGraphicWidth}, ${basicSetting.paddingTop})`}></g>
                    <g ref={hclusterAvgMatrixContainerRef}
                       transform={`translate(${basicSetting.treeGraphicWidth + basicSetting.treeGraphicOffset + 7 * basicSetting.metaWidth}, ${hclusterContainerPaddingTop})`}></g>
                    <g
                        ref={nodeHistoryHistoryRef}
                        transform={`translate(${basicSetting.treeGraphicWidth * 0.85 - 2 * basicSetting.nodeHistoryBlockWidth}, ${basicSetting.paddingTop + basicSetting.headerBlockHeight - 2 * basicSetting.nodeHistoryBlockHeight - 3})`}
                    >
                        <g>
                            <rect
                                width={basicSetting.nodeHistoryBlockWidth * 2 + 4}
                                height={basicSetting.nodeHistoryBlockHeight}
                                fill={currentNodeIndex === 0 ? '#AAE3D8' : '#41B3A2'}
                                rx={5}
                                ry={5}
                                cursor={currentNodeIndex === 0 ? 'not-allowed' : 'pointer'}
                                onClick={currentNodeIndex === 0 ? null : goBackRoot}
                            />
                            <text
                                fontSize={10}
                                x={basicSetting.nodeHistoryBlockWidth + 2}
                                y={basicSetting.nodeHistoryBlockHeight / 2}
                                textAnchor={'middle'}
                                dominantBaseline={'middle'}
                                fill={'#fff'}
                                pointerEvents={'none'}
                            >Back To Root
                            </text>
                        </g>
                        <g transform={`translate(0, ${basicSetting.nodeHistoryBlockHeight + 3})`}>
                            <g>
                                <rect
                                    width={basicSetting.nodeHistoryBlockWidth}
                                    height={basicSetting.nodeHistoryBlockHeight}
                                    fill={currentNodeIndex === 0 ? '#AAE3D8' : '#41B3A2'}
                                    rx={5}
                                    ry={5}
                                    cursor={currentNodeIndex === 0 ? 'not-allowed' : 'pointer'}
                                    onClick={currentNodeIndex === 0 ? null : goBackNode}
                                />
                                <text
                                    fontSize={10}
                                    x={basicSetting.nodeHistoryBlockWidth / 2}
                                    y={basicSetting.nodeHistoryBlockHeight / 2}
                                    textAnchor={'middle'}
                                    dominantBaseline={'middle'}
                                    fill={'#fff'}
                                    pointerEvents={'none'}
                                >Prev
                                </text>
                            </g>
                            <g transform={`translate(${basicSetting.nodeHistoryBlockWidth + 4}, 0)`}>
                                <rect
                                    width={basicSetting.nodeHistoryBlockWidth}
                                    height={basicSetting.nodeHistoryBlockHeight}
                                    fill={currentNodeIndex === nodeHistoryList.length - 1 ? '#AAE3D8' : '#41B3A2'}
                                    rx={5}
                                    ry={5}
                                    cursor={currentNodeIndex === nodeHistoryList.length - 1 ? 'not-allowed' : 'pointer'}
                                    onClick={currentNodeIndex === nodeHistoryList.length - 1 ? null : goForwardNode}
                                />
                                <text
                                    fontSize={10}
                                    x={basicSetting.nodeHistoryBlockWidth / 2}
                                    y={basicSetting.nodeHistoryBlockHeight / 2}
                                    textAnchor={'middle'}
                                    dominantBaseline={'middle'}
                                    fill={'#fff'}
                                    pointerEvents={'none'}
                                >Next
                                </text>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>

            {createPortal(<CustomTooltip ref={tooltipRef}/>, document.body)}
        </div>
    )
}

const CNVHeatMapContainer = ({projectId}) => {
    const {
        data: CNVMatrixMeta,
        error: CNVMatrixMetaError,
        isLoading: isLoadingCNVMatrixMeta
    } = useSWR(`${getCNVMatrixMetaURL}/3000000`, fetcher)

    const {
        data: CNVMatrix,
        error: CNVMatrixError,
        isLoading: isLoadingCNVMatrix
    } = useSWR(`${getProjectCNVMatrixURL}/${projectId}`, fetcherCSV)

    const {
        data: CNVMeta,
        error: CNVMetaError,
        isLoading: isLoadingCNVMeta
    } = useSWR(`${getCNVMetaURL}/${projectId}`, fetcherCSV)

    const {
        data: CNVCut,
        error: CNVCutError,
        isLoading: isLoadingCNVCut
    } = useSWR(`${getCNVCutURL}/${projectId}`, fetcher)

    if (CNVMatrixError || CNVMatrixMetaError || CNVMetaError || CNVCutError) {
        return (
            <Box sx={{width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant='h4'>😭 Fail To Load Data</Typography>
            </Box>
        )
    }

    if (isLoadingCNVMatrix || isLoadingCNVMatrixMeta || isLoadingCNVMeta || isLoadingCNVCut) {
        return (
            <Box sx={{width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <CircularProgress size={60}/>
                <Typography
                    variant='h5'
                    sx={{ml: 3}}>
                    Loading {
                    isLoadingCNVMatrixMeta ?
                        'CNV Matrix Meta Data' : isLoadingCNVMatrix ?
                            'CNV Matrix' : isLoadingCNVMeta ?
                                'CNV Meta Data' : isLoadingCNVCut ?
                                    'CNV Phylogenetic Tree Data' : ''}..., please wait for a moment.</Typography>
            </Box>
        )
    }

    return <CNVHeatMap CNVMatrixMeta={CNVMatrixMeta} CNVMatrix={CNVMatrix} CNVMeta={CNVMeta} CNVCut={CNVCut}/>
}

export const MemoCNVHeatMapContainer = memo(CNVHeatMapContainer)
