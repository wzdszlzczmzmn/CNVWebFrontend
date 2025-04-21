import React, { memo, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { TabPanel } from '../../Layout/TabPanel'
import Typography from "@mui/material/Typography"
import useSWR from "swr"
import { fetcher, getProjectMetaInfoURL } from "../../../../../data/get"
import ErrorView from "../../../../StateViews/ErrorView"
import LoadingView from "../../../../StateViews/LoadingView"
import { useDataSetting } from "../../../CustomHook/CNVVizCustomHooks/CNVHeatMapHook"
import axios from "axios"
import { postGLCNSRenderingURL } from "../../../../../data/post"
import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from "../../Layout/HeatMapLeftPanel"
import { List } from "@mui/material"
import { ListCollapsePanel } from "../../../../Layout/ListCollapsePanel"
import { PieChart } from "@mui/icons-material"
import { DataSettingPanel } from "../CNVHeatMapVizSettingComponents"
import HeatMapMainPanel from "../../Layout/HeatMapMainPanel"
import SelectGenesModal from "./Modal/GeneSelectModal"
import { MemoGeneLevelCNVHeatMapContainer } from "../../../../Viz/HeatMap/GeneLevel/GeneLevelHeatMapContainer"
import GeneSelector from "./GeneSelector"
import {
    ColorLegendSettingPanel, GapSettingPanel,
    HeatMapSettingPanel,
    HierarchicalClusteringTreeSettingPanel,
    NodeHistorySettingPanel,
} from "../GeneCNVHeatMapVizSettingComponents"

const GeneLevelHeatMapPanelWrapper = ({ projectId }) => {
    const {
        data: metaInfo,
        error: metaError,
        isLoading: isLoadingMeta
    } = useSWR(`${getProjectMetaInfoURL}?projectId=${projectId}&cnvType=Gene Level Copy Number`, fetcher)

    if (metaError) {
        return <ErrorView/>
    }

    if (isLoadingMeta) {
        return <LoadingView/>
    }

    return <GeneLevelHeatMapPanelContent projectId={projectId} metaInfo={metaInfo}/>
}

const GeneLevelHeatMapPanelContent = ({ projectId, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedGenes, setSelectedGenes] = useState([])
    const [renderGenes, setRenderGenes] = useState([])
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleClusterChange
    } = useDataSetting(metaInfo)

    const sortedGenes = useMemo(
        () => ([...selectedGenes].sort((a, b) => a.gene_name.length - b.gene_name.length)),
        [selectedGenes]
    )

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleModalCancel = () => {
        setIsModalOpen(false)
    }

    const resetSelectedGenes = () => {
        setSelectedGenes([])
    }

    const renderHeatMap = () => {
        if (selectedGenes.length === 0) {
            return
        }

        setProcessing(true)
        axios.post(postGLCNSRenderingURL, {
            projectId: projectId,
            diseaseType: dataSetting.diseaseType,
            primarySite: dataSetting.primarySite,
            workflowType: dataSetting.workflowType,
            selectedGenes: selectedGenes.map(gene => gene.gene_id)
        })
            .then((response) => {
                if (response.data !== '') {
                    setRenderData(response.data)
                    setRenderGenes([...selectedGenes])
                } else {
                    setRenderData([])
                }
            }).finally(() => {
            setProcessing(false)
        })
    }

    return (
        <>
            <Stack direction='row' sx={{ height: '85vh' }}>
                {
                    sideBarOpen ?
                        <HeatMapLeftPanel sx={{ px: 1 }}>
                            <List>
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
                                        isShowValueTypeSelector={false}
                                    />

                                    <GeneSelector
                                        selectedGenes={selectedGenes}
                                        sortedGenes={sortedGenes}
                                        showModal={showModal}
                                        resetSelectedGenes={resetSelectedGenes}
                                        renderHeatMap={renderHeatMap}
                                    />
                                </ListCollapsePanel>
                                <HeatMapSettingPanel/>
                                <HierarchicalClusteringTreeSettingPanel/>
                                <NodeHistorySettingPanel/>
                                <ColorLegendSettingPanel/>
                                <GapSettingPanel/>
                            </List>
                        </HeatMapLeftPanel>
                        :
                        <></>
                }
                <HeatMapMainPanel sideBarOpen={sideBarOpen} handleSideBarChange={handleSideBarChange}>
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
                                    Please select genes to render the corresponding visualization.
                                </Typography>
                            </Box>
                        ) : Array.isArray(renderData) && renderData.length === 0 ? (
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
                                    No CNV differences detected for the selected genes.
                                </Typography>
                                <Typography variant='h4'>
                                    Visualization is not available.
                                </Typography>
                            </Box>
                        ) : (
                            <MemoGeneLevelCNVHeatMapContainer
                                CNVMatrix={renderData?.CNV}
                                CNVMeta={renderData?.Meta}
                                NewickTree={renderData?.Newick}
                                genesInfos={renderGenes}
                                subTreeDepth={dataSetting.cluster}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            <SelectGenesModal
                isModalOpen={isModalOpen}
                handleModalCancel={handleModalCancel}
                selectedGenes={selectedGenes}
                setSelectedGenes={setSelectedGenes}
            />
        </>
    )
}

const GeneLevelCNVHeatMaps = ({ projectId }) => {
    const [value, setValue] = useState(0);

    const handleChange = (e, v) => setValue(v);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ border: 1, borderColor: 'divider' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Gene Level Copy Number" sx={{ textTransform: 'none' }}/>
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0} sx={{ height: '85vh' }}>
                    <GeneLevelHeatMapPanelWrapper projectId={projectId}/>
                </TabPanel>
            </Box>
        </Box>
    )
}

const MemoGeneLevelCNVHeatMaps = memo(GeneLevelCNVHeatMaps)

export default MemoGeneLevelCNVHeatMaps
