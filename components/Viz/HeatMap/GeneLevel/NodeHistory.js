import { useState } from "react"

export const NodeHistory = (
    {
        buttonWidth,
        buttonHeight,
        currentNodeIndex,
        nodeHistoryList,
        goBackRoot,
        goForwardNode,
        goBackNode
    }
) => {
    return (
        <g>
            <g>
                <rect
                    width={buttonWidth * 2 + 4}
                    height={buttonHeight}
                    fill={currentNodeIndex === 0 ? '#AAE3D8' : '#41B3A2'}
                    rx={5}
                    ry={5}
                    cursor={currentNodeIndex === 0 ? 'not-allowed' : 'pointer'}
                    onClick={currentNodeIndex === 0 ? null : goBackRoot}
                />
                <text
                    fontSize={10}
                    x={buttonWidth + 2}
                    y={buttonHeight / 2}
                    textAnchor={'middle'}
                    dominantBaseline={'middle'}
                    fill={'#fff'}
                    pointerEvents={'none'}
                >
                    Back To Root
                </text>
            </g>
            <g transform={`translate(0, ${buttonHeight + 4})`}>
                <g>
                    <rect
                        width={buttonWidth}
                        height={buttonHeight}
                        fill={currentNodeIndex === 0 ? '#AAE3D8' : '#41B3A2'}
                        rx={5}
                        ry={5}
                        cursor={currentNodeIndex === 0 ? 'not-allowed' : 'pointer'}
                        onClick={currentNodeIndex === 0 ? null : goBackNode}
                    />
                    <text
                        fontSize={10}
                        x={buttonWidth / 2}
                        y={buttonHeight / 2}
                        textAnchor={'middle'}
                        dominantBaseline={'middle'}
                        fill={'#fff'}
                        pointerEvents={'none'}
                    >
                        Prev
                    </text>
                </g>
                <g transform={`translate(${buttonWidth + 4}, 0)`}>
                    <rect
                        width={buttonWidth}
                        height={buttonHeight}
                        fill={currentNodeIndex === nodeHistoryList.length - 1 ? '#AAE3D8' : '#41B3A2'}
                        rx={5}
                        ry={5}
                        cursor={currentNodeIndex === nodeHistoryList.length - 1 ? 'not-allowed' : 'pointer'}
                        onClick={currentNodeIndex === nodeHistoryList.length - 1 ? null : goForwardNode}
                    />
                    <text
                        fontSize={10}
                        x={buttonWidth / 2}
                        y={buttonHeight / 2}
                        textAnchor={'middle'}
                        dominantBaseline={'middle'}
                        fill={'#fff'}
                        pointerEvents={'none'}
                    >
                        Next
                    </text>
                </g>
            </g>
        </g>
    )
}

export const useNodeHistoryList = () => {
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

    return {
        nodeHistoryList,
        currentNodeIndex,
        goBackNode,
        goForwardNode,
        goBackRoot,
        goToTreeNode
    }
}
