import React, { memo, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { TabPanel } from '../../Layout/TabPanel'
import Typography from "@mui/material/Typography"
import useSWR from "swr"
import { getProjectCNVInfoURL, fetcher, getProjectMetaInfoURL } from '/data/get'
import CircularProgress from "@mui/material/CircularProgress";
import { useChartDynamicSetting, useDataSetting } from "../../../CustomHook/CNVVizCustomHooks/CNVHeatMapHook"
import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from "../../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import { ListCollapsePanel } from "../../../../Layout/ListCollapsePanel"
import { PieChart } from "@mui/icons-material"
import {
    DataSettingPanel, HclusterSettingPanel, HeatMapSettingPanel, MetaChartSettingPanel, NodeHistorySettingPanel,
    TreeChartSettingPanel,
    WholeChartSettingPanel
} from "../CNVHeatMapVizSettingComponents"
import HeatMapMainPanel from "../../Layout/HeatMapMainPanel"
import { MemoCNVHeatMapContainer } from "../../Container/CNVHeatMapContainer"
import ErrorView from "../../../../StateViews/ErrorView"
import LoadingView from "../../../../StateViews/LoadingView"

const ChromosomeLevelCNVHeatMaps = ({ projectId, cnvTypes }) => {
    const [value, setValue] = useState(0);

    const handleChange = (e, v) => setValue(v);

    return (
        <Box sx={{ border: 1, borderColor: 'divider' }}>
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
                        <TabPanel value={value} index={index} key={index} sx={{ height: '85vh' }}>
                            <ChromosomeLevelCNVHeatMapPanel projectId={projectId} cnvType={cnvType}/>
                        </TabPanel>
                    ))
            }
        </Box>
    )
}

const calculateCNVBaseline = (cnvType, workflowType, valueType) => {
    let cnvBaseline

    if (cnvType === 'Allele-specific Copy Number Segment') {
        if (valueType === 'Total') {
            cnvBaseline = 2
        } else {
            cnvBaseline = 1
        }
    } else if (cnvType === 'Copy Number Segment') {
        if (workflowType === 'AscatNGS') {
            if (valueType === 'Total') {
                cnvBaseline = 2
            } else {
                cnvBaseline = 1
            }
        } else {
            cnvBaseline = 0
        }
    } else if (cnvType === 'Masked Copy Number Segment') {
        cnvBaseline = 0
    }

    return cnvBaseline
}

const ChromosomeLevelCNVHeatMapPanel = ({ projectId, cnvType }) => {
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

    return <ChromosomeLevelCNVHeatMapContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
}

const ChromosomeLevelCNVHeatMapContent = ({ projectId, cnvType, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleClusterChange,
    } = useDataSetting(metaInfo)

    const [wholeChartSetting, handleWholeChartSettingChange] = useChartDynamicSetting({
        paddingTop: 40,
    })

    const [treeChartSetting, handleTreeChartSettingChange] = useChartDynamicSetting({
        width: 300,
        marginToHeatMap: 20,
    })

    const [heatMapChartSetting, handleHeatMapChartSettingChange] = useChartDynamicSetting(
        {
            blockWidth: 2,
            defaultHeight: 6,
            blockHeight: 6,
            blockGap: 0.1,
            chromosomeLegendHeight: 25,
        },
        (prev, name, value) =>
            name === "defaultHeight"
                ? { ...prev, blockHeight: value, [name]: value }
                : { ...prev, [name]: value }
    )

    const [metaChartSetting, handleMetaChartSettingChange] = useChartDynamicSetting({
        width: 16,
    })

    const [hclusterClassifiedChartSetting, handleHclusterChartSettingChange] = useChartDynamicSetting({
        paddingToHeatMap: 40,
        hclusterInfoWidth: 20,
        hclusterInfoHeight: 20,
    })

    const [nodeHistorySetting, handleNodeHistoryChartSettingChange] = useChartDynamicSetting({
        width: 35,
        height: 20,
    })

    const isShowValueTypeSelector = useMemo(() => {
        return (
            cnvType === 'Allele-specific Copy Number Segment' ||
            (cnvType === 'Copy Number Segment' && dataSetting.workflowType === 'AscatNGS')
        )
    }, [cnvType, dataSetting.workflowType])

    const cnvBaseline = useMemo(
        () =>
            calculateCNVBaseline(
                cnvType,
                dataSetting.workflowType,
                dataSetting.valueType
            ),
        [cnvType, dataSetting.valueType, dataSetting.workflowType]
    )

    return (
        <Stack direction='row' sx={{ height: '100%' }}>
            {
                sideBarOpen ?
                    <HeatMapLeftPanel sx={{ px: 1 }}>
                        <List component='div'>
                            <ListCollapsePanel
                                defaultOpenState={true}
                                icon={<PieChart/>}
                                title={'Data Setting'}
                                showDivider={true}
                            >
                                <DataSettingPanel
                                    metaInfo={metaInfo}
                                    dataSetting={dataSetting}
                                    handleDiseaseTypeChange={handleDiseaseTypeChange}
                                    handlePrimarySiteChange={handlePrimarySiteChange}
                                    handleWorkflowTypeChange={handleWorkflowTypeChange}
                                    handleValueTypeChange={handleValueTypeChange}
                                    handleClusterChange={handleClusterChange}
                                    isShowValueTypeSelector={isShowValueTypeSelector}
                                />
                            </ListCollapsePanel>
                            <WholeChartSettingPanel
                                wholeChartSetting={wholeChartSetting}
                                onSettingChange={handleWholeChartSettingChange}
                            />
                            <TreeChartSettingPanel
                                treeChartSetting={treeChartSetting}
                                onSettingChange={handleTreeChartSettingChange}
                            />
                            <HeatMapSettingPanel
                                heatMapSetting={heatMapChartSetting}
                                onSettingChange={handleHeatMapChartSettingChange}
                            />
                            <MetaChartSettingPanel
                                metaChartSetting={metaChartSetting}
                                onSettingChange={handleMetaChartSettingChange}
                            />
                            <HclusterSettingPanel
                                hclusterClassifiedChartSetting={hclusterClassifiedChartSetting}
                                onSettingChange={handleHclusterChartSettingChange}
                            />
                            <NodeHistorySettingPanel
                                nodeHistorySetting={nodeHistorySetting}
                                onSettingChange={handleNodeHistoryChartSettingChange}
                            />
                        </List>
                    </HeatMapLeftPanel>
                    :
                    <></>
            }
            <HeatMapMainPanel sideBarOpen={sideBarOpen} handleSideBarChange={handleSideBarChange}>
                <MemoCNVHeatMapContainer
                    projectId={projectId}
                    CNVBaseline={cnvBaseline}
                    vizSetting={{
                        wholeChartSetting: wholeChartSetting,
                        treeChartSetting: treeChartSetting,
                        heatMapChartSetting: heatMapChartSetting,
                        metaChartSetting: metaChartSetting,
                        hclusterClassifiedChartSetting: hclusterClassifiedChartSetting,
                        nodeHistorySetting: nodeHistorySetting
                    }}
                    dataSetting={dataSetting}
                    cnvType={cnvType}
                    isValueType={isShowValueTypeSelector}
                />
            </HeatMapMainPanel>
        </Stack>
    )
}

const MemoChromosomeLevelCNVHeatMaps = memo(ChromosomeLevelCNVHeatMaps)

export default MemoChromosomeLevelCNVHeatMaps
