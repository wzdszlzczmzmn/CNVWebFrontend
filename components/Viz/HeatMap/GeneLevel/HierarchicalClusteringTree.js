import * as d3 from "d3"
import { useEffect, useRef } from "react"
import {
    linkUseBranchLengthConstructor,
    nodePositionUseBranchLengthConstructor,
} from "../../VizUtils/TreeChartUtils/VerticalTreeUtil"
import { treeNodeTooltipTemplate } from "../../ToolTip/CNVHeatMapToolTipTemplates"

export const HierarchicalClusteringTree = (
    {
        root,
        nodes,
        leaves,
        goToTreeNode,
        settings,
        treeHeatMapGap,
        showTooltip,
        hideTooltip
    }
) => {
    const chartWrapperRef = useRef(null)
    const linksRef = useRef(null)
    const nodesRef = useRef(null)
    const curvesRef = useRef(null)

    const filteredLinks = root.links().filter(
        link => nodes.includes(link.source) && nodes.includes(link.target)
    )

    useEffect(() => {
        const gLink = d3.select(linksRef.current)

        gLink.selectAll("path")
            .data(filteredLinks)
            .join('path')
            .attr('d', linkUseBranchLengthConstructor)
    }, [filteredLinks])

    useEffect(() => {
        const gNode = d3.select(nodesRef.current)
        hideHoverCurve(curvesRef)

        gNode.selectAll("circle")
            .data(nodes, d => d.data.name)
            .join('circle')
            .attr('transform', nodePositionUseBranchLengthConstructor)
            .attr('r', settings.nodeRadius)
            .attr('fill', d => d.children ? '#333' : '#999')
            .on('click', (event, d) => {
                if (d.children) {
                    goToTreeNode(d.data.name)
                }
            })
            .on('mouseover', (event, d) => {
                if (leaves.includes(d)) {
                    showHoverCurve(curvesRef, d, settings.width, treeHeatMapGap)
                }
                showTooltip(event, treeNodeTooltipTemplate(d.data.name, d.parent ? d.parent.data.name : 'NONE', d.value, d.data.distanceToRoot))
            })
            .on('mousemove', (event, d) => {
                showTooltip(event, treeNodeTooltipTemplate(d.data.name, d.parent ? d.parent.data.name : 'NONE', d.value, d.data.distanceToRoot))
            })
            .on('mouseout', hideTooltip)
    }, [nodes, goToTreeNode, settings.nodeRadius, hideTooltip, showTooltip, treeHeatMapGap, settings.width, leaves])

    return (
        <g ref={chartWrapperRef}>
            <g ref={linksRef} className='links' fill='none' stroke='#000000'></g>
            <g ref={nodesRef} className='nodes' cursor='pointer' pointerEvents='all'></g>
            <g ref={curvesRef} className='curves'></g>
        </g>
    )
}

const showHoverCurve = (curvesRef, leaf, treeWidth, treeHeatMapGap) => {
    const gCurve = d3.select(curvesRef.current)
    const nodePairs = [
        [[leaf.verticalPosition, leaf.horizontalPosition], [treeWidth + treeHeatMapGap, leaf.topX]],
        [[leaf.verticalPosition, leaf.horizontalPosition], [treeWidth + treeHeatMapGap, leaf.bottomX]]
    ]
    const line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveBumpX)

    gCurve.selectAll('path')
        .data(nodePairs)
        .join('path')
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("d", d => line(d))
}

const hideHoverCurve = (curvesRef) => {
    d3.select(curvesRef.current)
        .selectAll('path')
        .remove()
}
