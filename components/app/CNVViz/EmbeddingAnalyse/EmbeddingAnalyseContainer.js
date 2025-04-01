import React, { memo, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { fetcher, getProjectCNVInfoURL, getProjectMetaInfoURL } from "../../../../data/get"
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { TabPanel } from "../Layout/TabPanel"
import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from "../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import Typography from "@mui/material/Typography"
import HeatMapMainPanel from "../Layout/HeatMapMainPanel"
import { message } from "antd"
import { useDataSetting } from 'components/app/CustomHook/CNVVizCustomHooks/EmbeddingAnalyseHook'
import { DataSettingPanel } from "./EmbeddingVizConfigComponents"
import axios from "axios"
import { postEmbeddingAnalyseRenderURL } from "../../../../data/post"
import MemoEmbeddingScatterPlot from "../../../Viz/EmbeddingScatterPlot/EmbeddingScatterPlot"

const EmbeddingAnalyseWrapper = ({ projectId, cnvType }) => {
    const {
        data: metaInfo,
        error: metaError,
        isLoading: isLoadingMeta
    } = useSWR(`${getProjectMetaInfoURL}?projectId=${projectId}&cnvType=${cnvType}`, fetcher)

    if (metaError) {
        return <ErrorView/>
    }

    if (isLoadingMeta) {
        return <LoadingView/>
    }

    return <EmbeddingAnalyseContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
}

const EmbeddingAnalyseContent = ({ projectId, cnvType, metaInfo }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [CNVBaseline, setCNVBaseline] = useState(2)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting(metaInfo)

    const containerRef = useRef(null)

    const isShowValueTypeSelector = cnvType === 'Allele-specific Copy Number Segment' || (
        cnvType === 'Copy Number Segment' && dataSettingManager.dataSetting.workflowType === 'AscatNGS'
    )
    const isCustom = dataSettingManager.dataSetting.groupingStrategy === 'Custom'
    const svgWidth = sideBarOpen ? dimensions.width - 285 : dimensions.width

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const renderEmbeddingAnalyse = () => {
        if (!Number.isInteger(Number(dataSettingManager.dataSetting.groupNumber))) {
            messageApi.error("Group Number must be a Integer.")
        } else {
            setProcessing(true)
            axios.post(postEmbeddingAnalyseRenderURL, {
                projectId: projectId,
                cnvType: cnvType,
                diseaseType: dataSettingManager.dataSetting.diseaseType,
                primarySite: dataSettingManager.dataSetting.primarySite,
                workflowType: dataSettingManager.dataSetting.workflowType,
                embeddingMethod: dataSettingManager.dataSetting.embeddingMethod,
                valueType: isShowValueTypeSelector ? dataSettingManager.dataSetting.valueType : undefined,
                groupingStrategy: dataSettingManager.dataSetting.groupingStrategy,
                groupNumber: dataSettingManager.dataSetting.groupNumber,
                clusterMethod: dataSettingManager.dataSetting.groupingStrategy === 'Hierarchical Clustering' ? dataSettingManager.dataSetting.clusterMethod : undefined,
                clusterMetric: dataSettingManager.dataSetting.groupingStrategy === 'Hierarchical Clustering' ? dataSettingManager.dataSetting.clusterMetric : undefined
            }).then((response) => {
                setRenderData({
                    ...response.data,
                    embeddingMethod: dataSettingManager.dataSetting.embeddingMethod
                })
            }).catch((error) => {
                setRenderData(null)
                messageApi.error(error.response.data.errorMessage)
            }).finally(() => {
                setProcessing(false)
            })
        }
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
                                    renderEmbeddingAnalyse={renderEmbeddingAnalyse}
                                    isShowValueTypeSelector={isShowValueTypeSelector}
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
                        ) : (
                            <MemoEmbeddingScatterPlot
                                embeddingDict={renderData?.embeddingDict}
                                clusterDict={renderData?.clusterDict}
                                width={svgWidth}
                                height={dimensions.height}
                                isCustom={isCustom}
                                embeddingMethod={renderData?.embeddingMethod}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const EmbeddingAnalyseContainer = ({ projectId, cnvTypes }) => {
    const [value, setValue] = useState(0)

    const handleChange = (e, v) => setValue(v)

    return (
        <Box sx={{ width: '100%', border: 1, borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    {
                        cnvTypes
                            .filter(cnvType => cnvType !== 'Gene Level Copy Number')
                            .map((cnvType, index) => (
                                <Tab label={cnvType} key={index} sx={{ textTransform: 'none' }}/>
                            ))
                    }
                </Tabs>
            </Box>
            {
                cnvTypes
                    .filter(cnvType => cnvType !== 'Gene Level Copy Number')
                    .map((cnvType, index) => (
                        <TabPanel value={value} index={index} key={index} sx={{ height: '80vh' }}>
                            <EmbeddingAnalyseWrapper projectId={projectId} cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const MemoEmbeddingAnalyseContainer = memo(EmbeddingAnalyseContainer)

export default MemoEmbeddingAnalyseContainer
