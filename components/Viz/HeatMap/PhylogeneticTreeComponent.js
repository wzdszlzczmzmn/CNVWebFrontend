import * as d3 from "d3"
import {useEffect, useRef} from "react"
import {treeNodeTooltipTemplate} from '../ToolTip/CNVHeatMapToolTipTemplates'

export const PhylogeneticTree = (
    {
        marginLeft,
        paddingTop,
        width,
        root,
        CNVCut,
        goToTreeNode,
        showTooltip,
        hideTooltip
    }
) => {
    const treeContainerRef = useRef(null)

    useEffect(() => {
        const treeContainer = d3.select(treeContainerRef.current)
        const heatMapContainer = d3.select(".heatMapContainer")

        setTreeNodeVerticalPosition(root, root.data.length = 0, width / treeBranchMaxLength(root))

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
            .attr('d', linkUseBranchLength)

        gNode.selectAll('g')
            .data(root.descendants(), d => d.data.name)
            .join(
                enter => {
                    enter.append('g')
                        .attr('transform', nodePositionUseBranchLength)
                        .append('circle')
                        .attr('r', 4)
                        .each(function (node) {
                            const nodeName = node.data.name
                            const nodeTreeDetail = CNVCut[nodeName]

                            if (!node.children) {
                                d3.select(this)
                                    .on('mouseenter', event => {
                                        leafMouseOver(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                        showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                    })
                                    .on('mouseout', () => {
                                        hideTooltip()
                                        leafMouseOut(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                    })
                                    .on('mousemove', event => showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                            } else {
                                d3.select(this)
                                    .on('mouseenter', event => {
                                        showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                    })
                                    .on('mouseout', () => {
                                        hideTooltip()
                                    })
                                    .on('mousemove', event => showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
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
                    update.attr('transform', nodePositionUseBranchLength)
                        .each(function (node) {
                            const nodeName = node.data.name
                            const nodeTreeDetail = CNVCut[nodeName]

                            if (!node.children) {
                                d3.select(this)
                                    .on('mouseenter', event => {
                                        leafMouseOver(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                        showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                    })
                                    .on('mouseout', () => {
                                        hideTooltip()
                                        leafMouseOut(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
                                    })
                                    .on('mousemove', event => showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
                            } else {
                                d3.select(this)
                                    .on('mouseenter', event => {
                                        showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root']))
                                    })
                                    .on('mouseout', () => {
                                        hideTooltip()
                                    })
                                    .on('mousemove', event => showTooltip(event, treeNodeTooltipTemplate(nodeName, nodeTreeDetail['parent'], nodeTreeDetail['leafs'].length, nodeTreeDetail['dist_to_root'])))
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
                                        leafMouseOut(heatMapContainer.selectAll('.chromosome').filter(d => d !== nodeName))
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
    }, [CNVCut, goToTreeNode, hideTooltip, root, showTooltip, width]);

    return (
        <>
            <g ref={treeContainerRef} transform={`translate(${marginLeft}, ${paddingTop})`}></g>
        </>
    )
}

const leafMouseOver = (otherLeafHeatMap) => {
    otherLeafHeatMap.attr('opacity', 0.1)
}

const leafMouseOut = (otherLeafHeatMap) => {
    otherLeafHeatMap.attr('opacity', 1)
}

// Calculate the length of the longest branch in a phylogenetic tree.
const treeBranchMaxLength = (treeNode) => {
    return treeNode.data.length + (treeNode.children ? d3.max(treeNode.children, treeBranchMaxLength) : 0)
}

// Set vertical position of a tree node. Vertical position is relative to the root node.
// Parameter y0 is vertical position of the root node of a phylogenetic tree.
// Parameter k represents the scale factor of the SVG graphic's vertical length to its branch length.
// An example of parameter k: height / maxLength(root)
const setTreeNodeVerticalPosition = (treeNode, y0, k) => {
    treeNode.verticalPosition = (y0 += treeNode.data.length) * k
    if (treeNode.children) treeNode.children.forEach(treeNode => {
        setTreeNodeVerticalPosition(treeNode, y0, k)
    })
}

// Get the link path between tree nodes. The branch length is used.
const linkUseBranchLength = (treeLink) => {
    return `M ${treeLink.source.verticalPosition} ${treeLink.source.x} V ${treeLink.target.x} H ${treeLink.target.verticalPosition}`
}

// Get the link path between tree nodes. The branch length is ignored.
const linkIgnoreBranchLength = (treeLink) => {
    return `M ${treeLink.source.y} ${treeLink.source.x} V ${treeLink.target.x} H ${treeLink.target.y}`
}

const nodePositionUseBranchLength = (treeNode) => {
    return `translate(${treeNode.verticalPosition}, ${treeNode.x})`
}

const nodePositionIgnoreBranchLength = (treeNode) => {
    return `translate(${treeNode.y}, ${treeNode.x})`
}
