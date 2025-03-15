import { useEffect, useMemo, useRef, useState } from "react";
import {
    basicDataProcessing,
    getChromosomeRange,
    calculateHeaderBlockOffset,
    updateSettings,
    parseTree,
    getLeafListOfCurrentLeafs,
    getClusterCNVMeanMatrix,
    getClusterMetaLeaves,
    resetTreeXPosition,
    createColorScales
} from "./CNVHeatMapProcessing"
import { createPortal } from "react-dom";
import CustomTooltip from '../../ToolTip/ToolTip'
import * as d3 from 'd3'
import { HeatMap } from './HeatMapComponent'
import { NodeHistory } from './NodeHistoryComponent'
import { PhylogeneticTree } from './PhylogeneticTreeComponent'
import { Header } from './HeaderComponent'
import { HclusterAvgCNVMatrix } from './HclusterAvgCNVMatrix'
import { ColorLegends } from './ColorLegends'

export const CNVHeatMap = ({
    CNVMatrixMeta,
    CNVMatrix,
    CNVMeta,
    CNVCut,
    CNVBaseline,
    vizSetting = {}
}) => {
    const svgRef = useRef(null)
    const zoomContainerRef = useRef(null)

    // ToolTip.
    const toolTipRef = useRef(null)

    const {
        wholeChartSetting = {
            paddingTop: 40
        },
        treeChartSetting = {
            width: 300,
            marginToHeatMap: 20
        },
        heatMapChartSetting = {
            blockWidth: 1.5,
            defaultHeight: 5,
            blockHeight: 5,
            blockGap: 0.1,
            chromosomeLegendHeight: 25,
        },
        metaChartSetting = {
            width: 12
        },
        hclusterClassifiedChartSetting = {
            paddingToHeatMap: 40,
            hclusterInfoWidth: 20,
            hclusterInfoHeight: 20
        },
        nodeHistorySetting = {
            width: 35,
            height: 20
        },
        colorLegendSetting = {
            marginTop: 50,
            width: 350,
            legendWidth: 250,
            legendHeight: 50
        }
    } = vizSetting

    // Get Chromosome Range.
    const chromosomeRange = useMemo(() => getChromosomeRange(CNVMatrixMeta), [CNVMatrixMeta])

    // Basic Data Processing.
    const data =
        useMemo(() => basicDataProcessing(CNVCut, CNVMatrix, CNVMeta, chromosomeRange),
            [CNVCut, CNVMatrix, CNVMeta, chromosomeRange])

    const headerBlockOffset = useMemo(
        () => calculateHeaderBlockOffset(CNVMatrixMeta, heatMapChartSetting.blockWidth),
        [CNVMatrixMeta, heatMapChartSetting.blockWidth])

    // Get Color Scales.
    const { colorScales, getCNVColor } = createColorScales(data.metaRanges, CNVBaseline)

    const showTooltip = (event, content) => {
        toolTipRef.current.showTooltip(event, content)
    }

    const hideTooltip = () => {
        toolTipRef.current.hideTooltip()
    }

    // Node History.
    const [nodeHistoryList, setNodeHistoryList] = useState(['n0'])
    const [currentNodeIndex, setCurrentNodeIndex] = useState(0)

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

    const goToTreeNode = (newTreeNode) => {
        const newNodeHistoryList = [...nodeHistoryList.slice(0, currentNodeIndex + 1), newTreeNode]
        setNodeHistoryList(newNodeHistoryList)
        setCurrentNodeIndex(currentNodeIndex + 1)
    }

    // Data Processing Causing by Node History Change.
    const root = parseTree(data.CNVCutObject[nodeHistoryList[currentNodeIndex]]['newick'], treeChartSetting.width)
    const leafListDict = getLeafListOfCurrentLeafs(data.CNVCutObject, root)
    const CNVClusterMeanMatrix = getClusterCNVMeanMatrix(data.CNVMatrixObject, leafListDict, chromosomeRange)
    const currentNodeTotalFileNum = Object.values(CNVClusterMeanMatrix).reduce((sum, item) => sum + item.fileNum, 0)

    // Update Settings Causing by Node History Change.
    updateSettings(heatMapChartSetting, metaChartSetting, data.CNVMetaObject, currentNodeTotalFileNum, currentNodeIndex, data.totalFileNum)

    const leaves = root.leaves().map(leaf => leaf.data.name)
    const clusterMetaDict = getClusterMetaLeaves(data.CNVMetaObject, leafListDict)
    resetTreeXPosition(root, leafListDict, heatMapChartSetting.blockHeight)

    useEffect(() => {
        function zoomed(event) {
            d3.select(zoomContainerRef.current).attr('transform', event.transform)
        }

        const zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', zoomed)

        d3.select(svgRef.current).call(zoom)
    }, [])

    return (
        <div style={{ height: '85vh' }}>
            <svg ref={svgRef} width={"100%"} height={"100%"}>
                <g ref={zoomContainerRef}>
                    <ColorLegends
                        width={colorLegendSetting.width}
                        marginTop={colorLegendSetting.marginTop}
                        legendWidth={colorLegendSetting.legendWidth}
                        legendHeight={colorLegendSetting.legendHeight}
                        colorScales={colorScales}
                        CNVBaseline={CNVBaseline}
                    />

                    <HeatMap
                        marginLeft={treeChartSetting.width + treeChartSetting.marginToHeatMap + colorLegendSetting.width}
                        paddingTop={wholeChartSetting.paddingTop + heatMapChartSetting.chromosomeLegendHeight}
                        blockHeight={heatMapChartSetting.blockHeight}
                        blockWidth={heatMapChartSetting.blockWidth}
                        metaWidth={metaChartSetting.width}
                        metaOffset={metaChartSetting.offset}
                        colorScales={colorScales}
                        blockGap={heatMapChartSetting.blockGap}
                        leaves={leaves}
                        CNVClusterMeanMatrix={CNVClusterMeanMatrix}
                        clusterMetaDict={clusterMetaDict}
                        metaNameList={data.metaHeaders}
                        headerBlockOffset={headerBlockOffset}
                        binIndex={data.binIndex}
                        getCNVColor={getCNVColor}
                        showTooltip={showTooltip}
                        hideTooltip={hideTooltip}
                    />

                    <NodeHistory
                        buttonWidth={nodeHistorySetting.width}
                        buttonHeight={nodeHistorySetting.height}
                        marginLeft={treeChartSetting.width * 0.85 - 2 * nodeHistorySetting.width + colorLegendSetting.width}
                        paddingTop={wholeChartSetting.paddingTop + heatMapChartSetting.chromosomeLegendHeight - 2 * nodeHistorySetting.height - 4}
                        currentNodeIndex={currentNodeIndex}
                        nodeHistoryList={nodeHistoryList}
                        goBackNode={goBackNode}
                        goForwardNode={goForwardNode}
                        goBackRoot={goBackRoot}
                    />

                    <PhylogeneticTree
                        marginLeft={colorLegendSetting.width}
                        paddingTop={wholeChartSetting.paddingTop + heatMapChartSetting.chromosomeLegendHeight}
                        width={treeChartSetting.width}
                        root={root}
                        CNVCut={data.CNVCutObject}
                        goToTreeNode={goToTreeNode}
                        showTooltip={showTooltip}
                        hideTooltip={hideTooltip}
                    />

                    <Header
                        marginLeft={treeChartSetting.width + treeChartSetting.marginToHeatMap + colorLegendSetting.width}
                        paddingTop={wholeChartSetting.paddingTop}
                        metaOffset={metaChartSetting.offset}
                        chromosomeLegendHeight={heatMapChartSetting.chromosomeLegendHeight}
                        blockWidth={heatMapChartSetting.blockWidth}
                        blockGap={heatMapChartSetting.blockGap}
                        metaWidth={metaChartSetting.width}
                        headerBlockOffset={headerBlockOffset}
                        CNVMatrixMeta={CNVMatrixMeta}
                        metaHeaders={data.metaHeaders}
                        showTooltip={showTooltip}
                        hideTooltip={hideTooltip}
                    />

                    <HclusterAvgCNVMatrix
                        marginLeft={treeChartSetting.width + treeChartSetting.marginToHeatMap + metaChartSetting.offset + colorLegendSetting.width}
                        paddingTop={wholeChartSetting.paddingTop + heatMapChartSetting.chromosomeLegendHeight +
                            heatMapChartSetting.defaultHeight * data.totalFileNum +
                            hclusterClassifiedChartSetting.paddingToHeatMap}
                        hclusterInfoWidth={hclusterClassifiedChartSetting.hclusterInfoWidth}
                        hclusterInfoHeight={hclusterClassifiedChartSetting.hclusterInfoHeight}
                        colorScales={colorScales}
                        blockWidth={heatMapChartSetting.blockWidth}
                        blockGap={heatMapChartSetting.blockGap}
                        CNVMatrixObject={data.CNVMatrixObject}
                        CNVMetaObject={data.CNVMetaObject}
                        metaHeaders={data.metaHeaders}
                        binIndex={data.binIndex}
                        chromosomeRange={chromosomeRange}
                        headerBlockOffset={headerBlockOffset}
                        showTooltip={showTooltip}
                        hideTooltip={hideTooltip}
                        getCNVColor={getCNVColor}
                    />
                </g>
            </svg>

            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </div>
    )
}
