import Typography from "@mui/material/Typography";
import React, {memo, useEffect, useMemo, useRef, useState} from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import {ConfigProvider, message, Pagination, Spin} from "antd";
import axios from "axios";
import {
    getGISTICRecurrentEventURL,
} from "../../../../data/get";
import LoadingView from "../../../StateViews/LoadingView";
import {useRecurrentEventsStore} from "../../../../stores/RecurrentEventsStore";
import {createRecurrentEventsAxis, initFigureConfig} from "../../../Viz/RecurrentEventsPlot/preprocess";
import MemoRecurrentEventsLabel from "../../../Viz/RecurrentEventsPlot/RecurrentEventsLabel";
import MemoRecurrentEventsPloidyStairstep from "../../../Viz/RecurrentEventsPlot/RecurrentEventPloidyStairstep";
import {createPortal} from "react-dom";
import CustomTooltip from "../../../Viz/ToolTip/ToolTip";

const RecurrentEventsChart = ({id}) => {

    return (
        <Stack spacing={2}>
            <Typography variant="h4" gutterBottom align="center">
                Recurrent Region Chart
            </Typography>
            <Box sx={{border: '1px, solid, rgba(0, 0, 0, 0.12)'}}>
                <TaskRecurrentEventsContent projectId={id}/>
            </Box>
        </Stack>
    )
}

const TaskRecurrentEventsContent = ({projectId}) => {
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()

    const containerRef = useRef(null)

    const svgWidth = sideBarOpen ? dimensions.width - 285 : dimensions.width
    const svgHeight = dimensions.height - 48

    const renderRecurrentEvents = () => {
        setProcessing(true)
        axios.get(getGISTICRecurrentEventURL, {
            params: {
                projectId: projectId,
            }
        }).then((response) => {
            if (response.data) {
                setRenderData({
                    ampRegions: response.data.ampRegions,
                    delRegions: response.data.delRegions,
                    segmentInfo: response.data.segmentInfo
                })
            } else {
                setRenderData([])
            }
        }).catch(error => {
            setRenderData(null)
            messageApi.error(error.response.data.errorMessage)
        }).finally(() => {
            setProcessing(false)
        })
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                })
            }
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [])

    useEffect(renderRecurrentEvents, [messageApi, projectId])

    console.log(renderData)

    return (
        <>
            <Stack ref={containerRef} direction='row' sx={{height: '80vh'}}>
                <Box sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                }}>
                    {
                        processing ? (
                            <LoadingView
                                sx={{height: '100%', border: 0}}
                                loadingPrompt="Processing Data..., please wait for a moment."
                            />
                        ) : !renderData ? (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: '20px'
                            }}>
                                <Typography variant='h4'>
                                    Adjust the data settings, then click ‘Render’ to generate the visualization.
                                </Typography>
                            </Box>
                        ) : renderData === [] ? (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: '20px'
                            }}>
                                <Typography variant='h4'>
                                    GISTIC analysis cannot be performed because only one CNV sample meets the criteria
                                    for project {projectId}, disease type {dataSettingManager.dataSetting.diseaseType},
                                    and primary site {dataSettingManager.dataSetting.primarySite}.
                                </Typography>
                            </Box>
                        ) : (
                            <TaskRecurrentEventsVizWrapper
                                ampRegions={renderData?.ampRegions}
                                delRegions={renderData?.delRegions}
                                fileMetas={renderData?.segmentInfo}
                                width={svgWidth}
                                height={svgHeight}
                            />
                        )
                    }
                </Box>
            </Stack>
            {contextHolder}
        </>
    )
}

const TaskRecurrentEventsVizWrapper = (
    {
        ampRegions,
        delRegions,
        fileMetas,
        width,
        height
    }
) => {
    const [CNVMatrix, setCNVMatrix] = useState(null)
    const [current, setCurrent] = useState(1)
    const [loading, setLoading] = useState(false)
    const pageSize = 30

    const onPageChange = (page) => {
        setCurrent(page)
    }

    useEffect(() => {
        const currentPage = fileMetas.slice((current - 1) * pageSize, current * pageSize)
        setCNVMatrix(currentPage)
    }, [current, fileMetas])

    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Spin: {
                            contentHeight: height
                        }
                    }
                }}
            >
                <Spin tip="Loading" size="large" spinning={loading}>
                    {
                        CNVMatrix === null ? (
                            <Box sx={{width: width, height: height}}></Box>
                        ) : (
                            <MemoRecurrentEventsPlot
                                CNVMatrix={CNVMatrix}
                                ampRegions={ampRegions}
                                delRegions={delRegions}
                                fileMetas={fileMetas}
                                width={width}
                                height={height}
                                pageSize={pageSize}
                            />
                        )
                    }
                </Spin>
            </ConfigProvider>

            <Pagination
                align='center'
                current={current}
                onChange={onPageChange}
                total={fileMetas.length}
                defaultPageSize={30}
                showSizeChanger={false}
            />
        </>
    )
}

const RecurrentEventsPlot = (
    {
        CNVMatrix,
        ampRegions,
        delRegions,
        fileMetas,
        width,
        height,
        pageSize
    }
) => {
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
        <Box sx={{mb: '8px'}}>
            <svg width={width} height={height} style={{display: 'block'}}>
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
                            Array.from({length: pageSize})
                                .map(
                                    (_, index) => {
                                        const fileId = CNVMatrix[index]?.['file_id']

                                        return (
                                            fileId === undefined ? (
                                                <></>
                                            ) : (
                                                <MemoRecurrentEventsPloidyStairstep
                                                    cnvRegionMap={CNVMatrix[index]}
                                                    columns={Object.keys(CNVMatrix[index])}
                                                    width={yAxisLength}
                                                    height={xAxisRange[1] - xAxisRange[0]}
                                                    xAxis={xAxis}
                                                    yAxis={yAxisList[index]}
                                                    toolTipRef={toolTipRef}
                                                    aliquot={fileId}
                                                    key={index}
                                                />
                                            )
                                        )
                                    }
                                )
                        }
                    </g>
                </g>
            </svg>
            {createPortal(<CustomTooltip ref={toolTipRef}/>, document.body)}
        </Box>
    )
}

const MemoRecurrentEventsPlot = memo(RecurrentEventsPlot)


export default RecurrentEventsChart