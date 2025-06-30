import React, { memo, useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import useSWR from "swr"
import { fetcher, getProjectCNVInfoURL, getProjectMetaInfoURL } from "../../../../data/get"
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from "../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import HeatMapMainPanel from "../Layout/HeatMapMainPanel"
import { useDataSetting, useDisplaySetting } from 'components/app/CustomHook/CNVVizCustomHooks/PloidyStairstepHook'
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { TabPanel } from "../Layout/TabPanel"
import { DataSettingPanel, DisplaySettingPanel } from "./VizConfigComponents"
import { message } from "antd"
import Typography from "@mui/material/Typography"
import axios from "axios"
import { postPloidyStairstepRenderURL } from "../../../../data/post"
import MemoPloidyStairstep from "../../../Viz/PloidyStairstep/PloidyStairstep"

const PloidyStairstepWrapper = ({ projectId, cnvType }) => {
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

    return <PloidyStairstepContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
}

const PloidyStairstepContent = ({ projectId, cnvType, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [CNVBaseline, setCNVBaseline] = useState(2)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting(metaInfo)
    const displaySettingManager = useDisplaySetting()
    const { setCNVMax, setCNVMin } = displaySettingManager

    const isShowValueTypeSelector = cnvType === 'Allele-specific Copy Number Segment' || (
        cnvType === 'Copy Number Segment' && dataSettingManager.dataSetting.workflowType === 'AscatNGS'
    )

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const renderPloidyStairstep = () => {
        if (!Number.isInteger(Number(dataSettingManager.dataSetting.groupNumber))) {
            messageApi.error("Group Number must be a Integer.")
        } else {
            setProcessing(true)
            axios.post(postPloidyStairstepRenderURL, {
                projectId: projectId,
                cnvType: cnvType,
                diseaseType: dataSettingManager.dataSetting.diseaseType,
                primarySite: dataSettingManager.dataSetting.primarySite,
                workflowType: dataSettingManager.dataSetting.workflowType,
                groupingStrategy: dataSettingManager.dataSetting.groupingStrategy,
                groupNumber: dataSettingManager.dataSetting.groupNumber,
                valueType: isShowValueTypeSelector ? dataSettingManager.dataSetting.valueType : undefined,
                clusterMethod: dataSettingManager.dataSetting.groupingStrategy === 'Hierarchical Clustering' ? dataSettingManager.dataSetting.clusterMethod : undefined,
                clusterMetric: dataSettingManager.dataSetting.groupingStrategy === 'Hierarchical Clustering' ? dataSettingManager.dataSetting.clusterMetric : undefined
            }).then((response) => {
                if (response.data !== '') {
                    setRenderData(response.data)
                } else {
                    setRenderData([])
                }
                if (isShowValueTypeSelector) {
                    setCNVMax(10)
                    setCNVMin(0)

                    if (dataSettingManager.dataSetting.valueType === 'Total') {
                        setCNVBaseline(2)
                    } else {
                        setCNVBaseline(1)
                    }
                } else {
                    setCNVMax(3)
                    setCNVMin(-3)
                    setCNVBaseline(0)
                }
            }).catch((error) => {
                setRenderData(null)
                messageApi.error(error.response.data.errorMessage)
            }).finally(() => {
                setProcessing(false)
            })
        }
    }

    return (
        <>
            <Stack direction='row' sx={{ height: '600px' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1 }}>
                            <List>
                                <DataSettingPanel
                                    metaInfo={metaInfo}
                                    dataSettingManager={dataSettingManager}
                                    renderPloidyStairstep={renderPloidyStairstep}
                                    isShowValueTypeSelector={isShowValueTypeSelector}
                                />

                                <DisplaySettingPanel
                                    displaySettingManager={displaySettingManager}
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
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {
                        processing ? (
                            <LoadingView
                                sx={{ height: '100%', border: 0 }}
                                loadingPrompt="Processing Data..., please wait for a moment."
                            />
                        ) : renderData === null ? (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Typography variant='h4'>
                                    Adjust the data settings, then click ‘Render’ to generate the visualization.
                                </Typography>
                            </Box>
                        ) : Array.isArray(renderData) && renderData.length === 0 ?(
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: '20px'
                            }}>
                                <Typography variant='h4'>
                                    Group Number Larger Than Filtered Samples.
                                </Typography>
                            </Box>
                        ) :  (
                            <MemoPloidyStairstep
                                groupedCNVMatrixCSV={renderData?.groupedCNVMatrixCSV}
                                displaySettingManager={displaySettingManager}
                                CNVBaseline={CNVBaseline}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const PloidyStairstepContainer = ({ projectId, cnvTypes }) => {
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
                        <TabPanel value={value} index={index} key={index} sx={{ height: '600px' }}>
                            <PloidyStairstepWrapper projectId={projectId} cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const MemoPloidyStairstepContainer = memo(PloidyStairstepContainer)

export default MemoPloidyStairstepContainer
