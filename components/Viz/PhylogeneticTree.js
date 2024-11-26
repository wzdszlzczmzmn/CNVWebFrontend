import * as d3 from 'd3'

// Calculate the length of the longest branch in a phylogenetic tree.
export const treeBranchMaxLength = (treeNode) => {
    return treeNode.data.length + (treeNode.children ? d3.max(treeNode.children, treeBranchMaxLength) : 0)
}

// Set vertical position of a tree node. Vertical position is relative to the root node.
// Parameter y0 is vertical position of the root node of a phylogenetic tree.
// Parameter k represents the scale factor of the SVG graphic's vertical length to its branch length.
// An example of parameter k: height / maxLength(root)
export const setTreeNodeVerticalPosition = (treeNode, y0, k) => {
    treeNode.verticalPosition = (y0 += treeNode.data.length) * k
    if (treeNode.children) treeNode.children.forEach(treeNode => {setTreeNodeVerticalPosition(treeNode, y0, k)})
}

// Get the link path between tree nodes. The branch length is used.
export const linkUseBranchLength = (treeLink) => {
    return `M ${treeLink.source.verticalPosition} ${treeLink.source.x} V ${treeLink.target.x} H ${treeLink.target.verticalPosition}`
}

// Get the link path between tree nodes. The branch length is ignored.
export const linkIgnoreBranchLength = (treeLink) => {
    return `M ${treeLink.source.y} ${treeLink.source.x} V ${treeLink.target.x} H ${treeLink.target.y}`
}

export const nodePositionUseBranchLength = (treeNode) => {
    return`translate(${treeNode.verticalPosition}, ${treeNode.x})`
}

export const nodePositionIgnoreBranchLength = (treeNode) => {
    return`translate(${treeNode.y}, ${treeNode.x})`
}

