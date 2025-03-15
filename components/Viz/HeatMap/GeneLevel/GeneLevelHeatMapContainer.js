import { memo, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import CustomTooltip from "../../ToolTip/ToolTip"
import { HierarchicalClusteringTree } from "./HierarchicalClusteringTree"
import * as d3 from "d3"
import {
    preprocessAndLayout,
    parseNewickTree,
} from "../../VizUtils/TreeChartUtils/VerticalTreeUtil"
import { NodeHistory, useNodeHistoryList } from "./NodeHistory"
import { parseCNVMeta, parseGeneCNVMatrix } from "../../VizUtils/MatrixChartUtils/MatrixChartUtil"
import { MetaHeatMap } from './MetaHeatMap'
import { GeneCNVMatrixHeatMap } from "./GeneCNVMatrixHeatMap"
import { GeneLevelColorLegends } from "./GeneLevelColorLegends"
import useGeneCNVHeatMapVizSettingStore from "../../../../stores/GeneCNVHeatMapVizSettingStore"

const metaFields =
    ['gender', 'vital status', 'ethnicity', 'race', 'e_PC1', 'e_PC2', 'e_TSNE1', 'e_TSNE2', 'e_UMAP1', 'e_UMAP2']

const GeneLevelCNVHeatMapContainer = ({
    CNVMatrix,
    CNVMeta,
    NewickTree,
    genesInfos,
    subTreeDepth
}) => {
    const {
        nodeHistoryList,
        currentNodeIndex,
        goBackNode,
        goForwardNode,
        goBackRoot,
        goToTreeNode
    } = useNodeHistoryList()
    const chartSetting = useGeneCNVHeatMapVizSettingStore()

    const svgRef = useRef(null)
    const zoomContainerRef = useRef(null)
    const toolTipRef = useRef(null)

    const showTooltip = (event, content) => {
        toolTipRef.current.showTooltip(event, content)
    }

    const hideTooltip = () => {
        toolTipRef.current.hideTooltip()
    }

    const root = useMemo(() => parseNewickTree(NewickTree), [NewickTree])
    const { processedMeta, colorScales } = useMemo(
        () => parseCNVMeta(
            CNVMeta,
            ['gender', 'vital status', 'ethnicity', 'race'],
            ['e_PC1', 'e_PC2', 'e_TSNE1', 'e_TSNE2', 'e_UMAP1', 'e_UMAP2'],
            metaFields
        ),
        [CNVMeta]
    )
    const { processedMatrix, CNVColorScale } = useMemo(
        () => parseGeneCNVMatrix(CNVMatrix, genesInfos),
        [CNVMatrix, genesInfos]
    )

    const currentRoot = root.find(node => node.data.name === nodeHistoryList[currentNodeIndex])

    const {
        nodes,
        leaves,
        yMeta,
        xMeta,
        filteredMeta,
        xMatrix,
        yMatrix,
        cutTreeCNVMatrix
    } = preprocessAndLayout(
        currentRoot,
        subTreeDepth,
        processedMeta,
        metaFields,
        genesInfos,
        processedMatrix,
        chartSetting.hierarchicalClusteringTreeSetting,
        chartSetting.heatMapSetting,
    )

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
                <g ref={zoomContainerRef} transform='translate(100, 100)'>
                    <g className='ColorLegends'>
                        <GeneLevelColorLegends
                            legendWidth={chartSetting.colorLegendSetting.width}
                            legendHeight={chartSetting.colorLegendSetting.height}
                            colorScales={colorScales}
                        />
                    </g>
                    <g className='TreeChartContainer'
                       transform={`translate(${chartSetting.colorLegendSetting.width + chartSetting.gapSetting.colorLegendTreeGap})`}>
                        <g className='NodeHistory' transform='translate(200, -50)'>
                            <NodeHistory
                                buttonWidth={chartSetting.nodeHistorySetting.width}
                                buttonHeight={chartSetting.nodeHistorySetting.height}
                                currentNodeIndex={currentNodeIndex}
                                nodeHistoryList={nodeHistoryList}
                                goBackRoot={goBackRoot}
                                goForwardNode={goForwardNode}
                                goBackNode={goBackNode}
                            />
                        </g>
                        <g className='TreeChart'>
                            <HierarchicalClusteringTree
                                root={currentRoot}
                                nodes={nodes}
                                leaves={leaves}
                                goToTreeNode={goToTreeNode}
                                settings={chartSetting.hierarchicalClusteringTreeSetting}
                                treeHeatMapGap={chartSetting.gapSetting.treeHeatMapGap}
                                showTooltip={showTooltip}
                                hideTooltip={hideTooltip}
                            />
                        </g>
                    </g>
                    <g
                        transform={`translate(${
                            chartSetting.colorLegendSetting.width + chartSetting.gapSetting.colorLegendTreeGap +
                            chartSetting.hierarchicalClusteringTreeSetting.width +
                            chartSetting.gapSetting.treeHeatMapGap}, 0)`
                        }
                    >
                        <MetaHeatMap
                            filteredMeta={filteredMeta}
                            xMeta={xMeta}
                            yMeta={yMeta}
                            metaFields={metaFields}
                            colorScales={colorScales}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                        />
                        <GeneCNVMatrixHeatMap
                            cutTreeCNVMatrix={cutTreeCNVMatrix}
                            xMatrix={xMatrix}
                            yMatrix={yMatrix}
                            geneInfos={genesInfos}
                            CNVMatrixScale={CNVColorScale}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                        />
                    </g>
                </g>
            </svg>

            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </div>
    )
}

export const MemoGeneLevelCNVHeatMapContainer = memo(GeneLevelCNVHeatMapContainer)
