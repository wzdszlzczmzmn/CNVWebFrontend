import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { TabPanel } from "../Layout/TabPanel"
import useSWR from "swr"
import {
    fetcher,
    getProjectGISTICMetaInfoURL,
    getRecurrentEventsEachPageRenderURL,
    getRecurrentEventsRenderURL
} from "../../../../data/get"
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import { ConfigProvider, message, Pagination, Spin } from "antd"
import Stack from "@mui/material/Stack"
import { useDataSetting } from 'components/app/CustomHook/CNVVizCustomHooks/RecurrentEventsHook'
import HeatMapLeftPanel from "../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import HeatMapMainPanel from "../Layout/HeatMapMainPanel"
import { DataSettingPanel } from "./RecurrentEventsVizConfigComponents"
import Typography from "@mui/material/Typography"
import axios from "axios"
import * as d3 from "d3"
import MemoRecurrentEventsPlot from "../../../Viz/RecurrentEventsPlot/RecurrentEventsPlot"

const RecurrentEventsContainer = ({ projectId, cnvTypes }) => {
    const [value, setValue] = useState(0)

    const handleChange = (e, v) => setValue(v)

    const filteredCNVTypes = cnvTypes.filter(
        cnvType => cnvType === 'Masked Copy Number Segment' || cnvType === 'Copy Number Segment'
    )

    return (
        <Box sx={{ width: '100%', border: 1, borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    {
                        filteredCNVTypes
                            .map((cnvType, index) => (
                                <Tab label={cnvType} key={index} sx={{ textTransform: 'none' }}/>
                            ))
                    }
                </Tabs>
            </Box>
            {
                filteredCNVTypes
                    .map((cnvType, index) => (
                        <TabPanel value={value} index={index} key={index} sx={{ height: '80vh' }}>
                            <RecurrentEventsWrapper projectId={projectId} cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const RecurrentEventsWrapper = ({ projectId, cnvType }) => {
    const {
        data: metaInfo,
        error: metaError,
        isLoading: isLoadingMeta
    } = useSWR(`${getProjectGISTICMetaInfoURL}?projectId=${projectId}&cnvType=${cnvType}`, fetcher)

    if (metaError) {
        return <ErrorView/>
    }

    if (isLoadingMeta) {
        return <LoadingView/>
    }

    return (
        <RecurrentEventsContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
    )
}

const RecurrentEventsContent = ({ projectId, cnvType, metaInfo }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting(metaInfo)

    const containerRef = useRef(null)

    const svgWidth = sideBarOpen ? dimensions.width - 285 : dimensions.width
    const svgHeight = dimensions.height - 48

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const renderRecurrentEvents = () => {
        setProcessing(true)
        axios.get(getRecurrentEventsRenderURL, {
            params: {
                projectId: projectId,
                cnvType: cnvType,
                diseaseType: dataSettingManager.dataSetting.diseaseType,
                primarySite: dataSettingManager.dataSetting.primarySite
            }
        }).then((response) => {
            if (response.data !== '') {
                setRenderData({
                    ampRegions: response.data.ampRegions,
                    delRegions: response.data.delRegions,
                    fileMetas: response.data.fileMetas
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

    return (
        <>
            <Stack ref={containerRef} direction='row' sx={{ height: '80vh' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1, minWidth: '285px' }}>
                            <List>
                                <DataSettingPanel
                                    metaInfo={metaInfo}
                                    dataSettingManager={dataSettingManager}
                                    renderRecurrentEvents={renderRecurrentEvents}
                                />
                            </List>
                        </HeatMapLeftPanel>
                    ) : (
                        <></>
                    )
                }
                <HeatMapMainPanel
                    sideBarOpen={sideBarOpen}
                    handleSideBarChange={handleSideBarChange}
                >
                    {
                        processing ? (
                            <LoadingView
                                sx={{ height: '100%', border: 0 }}
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
                        ) : Array.isArray(renderData) && renderData.length === 0 ? (
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
                            <RecurrentEventsVizWrapper
                                ampRegions={renderData?.ampRegions}
                                delRegions={renderData?.delRegions}
                                fileMetas={renderData?.fileMetas}
                                width={svgWidth}
                                height={svgHeight}
                                projectId={projectId}
                                cnvType={cnvType}
                                diseaseType={dataSettingManager.dataSetting.diseaseType}
                                primarySite={dataSettingManager.dataSetting.primarySite}
                                messageApi={messageApi}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const RecurrentEventsVizWrapper = ({
    ampRegions,
    delRegions,
    fileMetas,
    width,
    height,
    projectId,
    cnvType,
    diseaseType,
    primarySite,
    messageApi
}) => {
    const [CNVMatrix, setCNVMatrix] = useState(null)
    const [current, setCurrent] = useState(1)
    const [loading, setLoading] = useState(false)
    const pageSize = 30
    const files = useMemo(
        () => fileMetas.slice((current - 1) * pageSize, current * pageSize).map(file => file.fileId),
        [current, fileMetas]
    )

    const onPageChange = (page) => {
        setCurrent(page)
    }

    const fetchCNVMatrix = () => {
        setLoading(true)
        axios.post(getRecurrentEventsEachPageRenderURL, {
            projectId: projectId,
            cnvType: cnvType,
            diseaseType: diseaseType,
            primarySite: primarySite,
            files: files
        }).then((response) => {
            setCNVMatrix(d3.csvParse(response.data, d3.autoType))
        }).catch(error => {
            setCNVMatrix(null)
            messageApi.error(error.response.data.errorMessage)
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(fetchCNVMatrix, [
        cnvType,
        current,
        diseaseType,
        fileMetas,
        files,
        messageApi,
        primarySite,
        projectId
    ])

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
                            <Box sx={{ width: width, height: height }}></Box>
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

const MemoRecurrentEventsContainer = memo(RecurrentEventsContainer)

export default MemoRecurrentEventsContainer
