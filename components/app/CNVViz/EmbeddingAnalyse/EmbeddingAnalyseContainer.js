import React, { memo, useState } from "react"
import useSWR from "swr"
import { fetcher, getProjectCNVTypeInfoURL, getProjectMetaInfoURL } from "../../../../data/get"
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
import { useDataSetting } from 'components/app/CustomHook/EmbeddingAnalyseHook'

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
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [CNVBaseline, setCNVBaseline] = useState(2)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting(metaInfo)

    const isShowValueTypeSelector = cnvType === 'Allele-specific Copy Number Segment' || (
        cnvType === 'Copy Number Segment' && dataSettingManager.dataSetting.workflowType === 'AscatNGS'
    )

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    return (
        <>
            <Stack direction='row' sx={{ height: '600px' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1 }}>
                            <List>

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
                        ) : !renderData ? (
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
                        ) : (
                            <></>
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const EmbeddingAnalyseContainer = ({ projectId }) => {
    const [value, setValue] = useState(0)

    const handleChange = (e, v) => setValue(v)

    const {
        data: cnvTypes,
        error: cnvTypesError,
        isLoading: isLoading
    } = useSWR(`${getProjectCNVTypeInfoURL}?projectId=${projectId}`, fetcher)


    if (cnvTypesError) {
        return <ErrorView/>
    }

    if (isLoading) {
        return <LoadingView/>
    }

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
                    .map((cnvType, index) => (
                        <TabPanel value={value} index={index} key={index} sx={{ height: '600px' }}>
                            <EmbeddingAnalyseWrapper projectId={projectId} cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const MemoEmbeddingAnalyseContainer = memo(EmbeddingAnalyseContainer)

export default MemoEmbeddingAnalyseContainer
