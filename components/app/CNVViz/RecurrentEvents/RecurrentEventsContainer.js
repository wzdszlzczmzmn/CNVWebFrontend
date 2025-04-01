import React, { memo, useState } from "react"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { TabPanel } from "../Layout/TabPanel"
import useSWR from "swr"
import { fetcher, getProjectGISTICMetaInfoURL } from "../../../../data/get"
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import { message } from "antd"
import Stack from "@mui/material/Stack"
import { useDataSetting } from 'components/app/CustomHook/CNVVizCustomHooks/RecurrentEventsHook'
import HeatMapLeftPanel from "../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import HeatMapMainPanel from "../Layout/HeatMapMainPanel"
import { DataSettingPanel } from "./RecurrentEventsVizConfigComponents"

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
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()

    const dataSettingManager = useDataSetting(metaInfo)

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    return (
        <>
            <Stack direction='row' sx={{ height: '80vh' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1, minWidth: '285px' }}>
                            <List>
                                <DataSettingPanel
                                    metaInfo={metaInfo}
                                    dataSettingManager={dataSettingManager}
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

                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

const MemoRecurrentEventsContainer = memo(RecurrentEventsContainer)

export default MemoRecurrentEventsContainer
