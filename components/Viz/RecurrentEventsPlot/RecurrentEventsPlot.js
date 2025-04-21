import React, { memo, useMemo, useRef } from "react"
import Box from "@mui/material/Box"
import { useRecurrentEventsStore } from "../../../stores/RecurrentEventsStore"
import { createRecurrentEventsAxis, initFigureConfig } from "./preprocess"
import MemoRecurrentEventsLabel from "./RecurrentEventsLabel"
import MemoRecurrentEventsPloidyStairstep from "./RecurrentEventPloidyStairstep"
import { createPortal } from "react-dom"
import CustomTooltip from "../ToolTip/ToolTip"
import MemoRecurrentEventsMetaMatrix from "./RecurrentEventsMetaMatrix"

const RecurrentEventsPlot = ({
    CNVMatrix,
    ampRegions,
    delRegions,
    fileMetas,
    width,
    height,
    pageSize
}) => {
    const globalSetting = useRecurrentEventsStore((state) => state.globalSetting)
    const titleSetting = useRecurrentEventsStore((state) => state.titleSetting)
    const labelSetting = useRecurrentEventsStore((state) => state.labelSetting)
    const samplePloidyStairstepSetting = useRecurrentEventsStore((state) => state.samplePloidyStairstepSetting)
    const metaMatrixSetting = useRecurrentEventsStore((state) => state.metaMatrixSetting)

    const toolTipRef = useRef(null)

    const {
        figureHeight,
        figureWidth,
        yOffsetFigure,
        xOffsetFigure,
        yAxisLength,
        xAxisRange,
        yOffsetLabel,
        xOffsetAmpLabel,
        xOffsetDelLabel,
        xOffsetMetaMatrix,
        yOffsetMetaMatrix
    } = useMemo(
        () => initFigureConfig(width, height, globalSetting, titleSetting, labelSetting, samplePloidyStairstepSetting, metaMatrixSetting, pageSize),
        [globalSetting, height, labelSetting, metaMatrixSetting, pageSize, samplePloidyStairstepSetting, titleSetting, width]
    )

    const {
        xAxis,
        yAxisList
    } = useMemo(
        () => createRecurrentEventsAxis(yAxisLength, xAxisRange, pageSize, samplePloidyStairstepSetting.chartGap),
        [pageSize, samplePloidyStairstepSetting.chartGap, xAxisRange, yAxisLength]
    )

    return (
        <Box sx={{ mb: '8px' }}>
            <svg width={width} height={height} style={{ display: 'block' }}>
                <g transform={`translate(${globalSetting.marginX}, ${globalSetting.marginY})`}>
                    <g className='title'>
                        <text
                            fontSize={titleSetting.fontSize}
                            transform={`translate(${figureWidth / 2 + labelSetting.width}, ${titleSetting.marginTop})`}
                            dy='1em'
                            textAnchor='middle'
                        >
                            Recurrent Events
                        </text>
                    </g>
                    <MemoRecurrentEventsLabel
                        xOffset={xOffsetAmpLabel}
                        yOffset={yOffsetLabel}
                        recurrentRegions={ampRegions}
                        xAxis={xAxis}
                        isLeft={true}
                    />
                    <MemoRecurrentEventsLabel
                        xOffset={xOffsetDelLabel}
                        yOffset={yOffsetLabel}
                        recurrentRegions={delRegions}
                        xAxis={xAxis}
                        isLeft={false}
                    />
                    <g className='figure' transform={`translate(${xOffsetFigure}, ${yOffsetFigure})`}>
                        {
                            Array.from({ length: pageSize })
                                .map(
                                    (_, index) => {
                                        const fileId = CNVMatrix[index]?.['file_id']
                                        const aliquot = fileMetas.find(meta => meta['fileId'] === fileId)?.aliquot

                                        return (
                                            fileId === undefined ? (
                                                <></>
                                            ) : (
                                                <MemoRecurrentEventsPloidyStairstep
                                                    cnvRegionMap={CNVMatrix[index]}
                                                    columns={CNVMatrix.columns}
                                                    width={yAxisLength}
                                                    height={xAxisRange[1] - xAxisRange[0]}
                                                    xAxis={xAxis}
                                                    yAxis={yAxisList[index]}
                                                    toolTipRef={toolTipRef}
                                                    aliquot={aliquot}
                                                    key={index}
                                                />
                                            )
                                        )
                                    }
                                )
                        }
                    </g>
                    <MemoRecurrentEventsMetaMatrix
                        CNVMatrix={CNVMatrix}
                        fileMetas={fileMetas}
                        metaMatrixBlockWidth={yAxisLength}
                        xOffset={xOffsetMetaMatrix}
                        yOffset={yOffsetMetaMatrix}
                        toolTipRef={toolTipRef}
                    />
                </g>
            </svg>
            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </Box>
    )
}

const MemoRecurrentEventsPlot = memo(RecurrentEventsPlot)

export default MemoRecurrentEventsPlot
