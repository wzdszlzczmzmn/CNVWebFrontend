import React, { memo, useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { TabPanel } from "../Layout/TabPanel"
import useSWR from "swr"
import { fetcher, getProjectGISTICMetaInfoURL, getRecurrentRegionsAreaPlotRenderURL } from "../../../../data/get"
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import { message } from "antd"
import { useDataSetting } from "../../CustomHook/CNVVizCustomHooks/RecurrentRegionsHook"
import Stack from "@mui/material/Stack"
import HeatMapMainPanel from "../Layout/HeatMapMainPanel"
import HeatMapLeftPanel from "../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import { DataSettingPanel } from "./RecurrentRegionsVizConfigComponents"
import MemoRecurrentRegionsAreaPlot from "../../../Viz/RecurrentRegionsAreaPlot/RecurrentRegionsAreaPlot"
import axios from "axios"
import Typography from "@mui/material/Typography"

const RecurrentRegionsContainer = ({ projectId, cnvTypes }) => {
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
                            <RecurrentRegionsWrapper projectId={projectId}  cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const RecurrentRegionsWrapper = ({ projectId, cnvType }) => {
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
        <RecurrentRegionsContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
    )
}

const RecurrentRegionsContent = ({ projectId, cnvType, metaInfo }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting(metaInfo)

    const containerRef = useRef(null)

    const svgWidth = sideBarOpen ? dimensions.width - 285 : dimensions.width

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const renderRecurrentRegionsAreaPlot = () => {
        setProcessing(true)
        axios.get(getRecurrentRegionsAreaPlotRenderURL, {
            params: {
                projectId: projectId,
                cnvType: cnvType,
                diseaseType: dataSettingManager.dataSetting.diseaseType,
                primarySite: dataSettingManager.dataSetting.primarySite
            }
        }).then(response => {
            if (response.data) {
                setRenderData({
                    ampRegions: response.data.ampRegions,
                    delRegions: response.data.delRegions,
                    scoresGISTIC: parseScoresGISTIC(response.data.scoresGISTIC)
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
            <Stack ref={containerRef}  direction='row' sx={{ height: '80vh' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1, minWidth: '285px' }}>
                            <List>
                                <DataSettingPanel
                                    metaInfo={metaInfo}
                                    dataSettingManager={dataSettingManager}
                                    renderRecurrentRegionsAreaPlot={renderRecurrentRegionsAreaPlot}
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
                                    GISTIC analysis cannot be performed because only one CNV sample meets the criteria for project {project}, disease type {disease_type}, and primary site {primary_site}.
                                </Typography>
                            </Box>
                        ) : (
                            <MemoRecurrentRegionsAreaPlot
                                width={svgWidth}
                                height={dimensions.height}
                                ampRegions={renderData?.ampRegions}
                                delRegions={renderData?.delRegions}
                                scoresGISTIC={renderData?.scoresGISTIC}
                                yAxisValueType={dataSettingManager.dataSetting.yAxisValueType}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const parseScoresGISTIC = (scoresGISTIC) => {
    return scoresGISTIC.map(scoreGISTIC => ({
        'type': scoreGISTIC["Type"],
        'chromosome': scoreGISTIC["Chromosome"].trim(), // 去掉多余空格
        'start': +scoreGISTIC["Start"],
        'end': +scoreGISTIC["End"],
        'q-value': +scoreGISTIC["-log10(q-value)"],
        'G-score': +scoreGISTIC["G-score"],
        'average amplitude': +scoreGISTIC["average amplitude"],
        'frequency': +scoreGISTIC["frequency"]
    }))
}

const MemoRecurrentRegionsContainer = memo(RecurrentRegionsContainer)

export default MemoRecurrentRegionsContainer
