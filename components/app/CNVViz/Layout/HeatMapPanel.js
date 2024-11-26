import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from './HeatMapLeftPanel'
import HeatMapMainPanel from './HeatMapMainPanel'
import { List } from "@mui/material"
import { MemoCNVHeatMapContainer } from '../Container/CNVHeatMapContainer'
import React, { Fragment, useMemo, useState } from "react"
import Divider from "@mui/material/Divider"
import {
    PieChart,
    Settings
} from "@mui/icons-material"
import useSWR from "swr"
import { getProjectMetaInfoURL, fetcher } from '/data/get'
import { ListCollapsePanel } from '/components/Layout/ListCollapsePanel'
import { DataSelector, SettingInput } from '/components/InputComponents/SettingInputComponents'
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"

const HeatMapPanel = ({ projectId, cnvType }) => {
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

    return (
        cnvType === 'Gene Level Copy Number' ?
            <GeneLevelHeatMapPanelContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
            :
            <HeatMapPanelContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
    )
}

const HeatMapPanelContent = ({ projectId, cnvType, metaInfo }) => {
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
        <Stack direction='row' sx={{height: '85vh'}}>
            {
                sideBarOpen ?
                    <HeatMapLeftPanel sx={{ px: 1 }}>
                        <List component='div'>
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
                />
            </HeatMapMainPanel>
        </Stack>
    )
}

const GeneLevelHeatMapPanelContent = ({ projectId, cnvType, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    return (
        <Stack direction='row' sx={{ height: '85vh' }}>
            {
                sideBarOpen ?
                    <HeatMapLeftPanel sx={{ px: 1 }}>
                    </HeatMapLeftPanel>
                    :
                    <></>
            }
            <HeatMapMainPanel sideBarOpen={sideBarOpen} handleSideBarChange={handleSideBarChange}>
            </HeatMapMainPanel>
        </Stack>
    )
}

const DataSettingPanel = ({
    metaInfo,
    dataSetting,
    handleDiseaseTypeChange,
    handlePrimarySiteChange,
    handleWorkflowTypeChange,
    handleValueTypeChange,
    handleClusterChange,
    isShowValueTypeSelector,
}) => {
    const dataSettingFields = [
        {
            key: "diseaseType",
            value: dataSetting.diseaseType,
            setValue: handleDiseaseTypeChange,
            title: "Disease Type:",
            valueList: Object.keys(metaInfo),
        },
        {
            key: "primarySite",
            value: dataSetting.primarySite,
            setValue: handlePrimarySiteChange,
            title: "Primary Site:",
            valueList: Object.keys(metaInfo[dataSetting.diseaseType]),
        },
        {
            key: "workflowType",
            value: dataSetting.workflowType,
            setValue: handleWorkflowTypeChange,
            title: "Workflow Type:",
            valueList:
                metaInfo[dataSetting.diseaseType][dataSetting.primarySite],
        },
        ...(isShowValueTypeSelector
            ? [
                {
                    key: "valueType",
                    value: dataSetting.valueType,
                    setValue: handleValueTypeChange,
                    title: "Value Type:",
                    valueList: ["Total", "Major", "Minor"],
                },
            ]
            : []),
        {
            key: "cluster",
            value: dataSetting.cluster,
            setValue: handleClusterChange,
            title: "Cluster:",
            valueList: Array.from({ length: 9 }, (_, i) => i + 2),
        },
    ]

    return (
        <ListCollapsePanel
            defaultOpenState={true}
            icon={<PieChart/>}
            title={'Data Setting'}
            showDivider={true}
        >
            <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
                {dataSettingFields.map((field, index) => (
                    <Fragment key={field.key}>
                        <DataSelector
                            value={field.value}
                            setValue={field.setValue}
                            title={field.title}
                            valueList={field.valueList}
                        />
                        {index < dataSettingFields.length - 1 && <Divider/>}
                    </Fragment>
                ))}
            </Stack>
        </ListCollapsePanel>
    )
}

const WholeChartSettingPanel = ({
    wholeChartSetting,
    onSettingChange
}) => {
    const settings = [
        {
            id: "wholeChartPaddingTop",
            name: "paddingTop",
            value: wholeChartSetting.paddingTop,
            type: "number",
            title: "Padding Top:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Whole Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const TreeChartSettingPanel = ({
    treeChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "treeChartWidth",
            name: "width",
            value: treeChartSetting.width,
            type: "number",
            title: "Width:",
        },
        {
            id: "treeChartMarginToHeatMap",
            name: "marginToHeatMap",
            value: treeChartSetting.marginToHeatMap,
            type: "number",
            title: "Margin To HeatMap:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Tree Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const HeatMapSettingPanel = ({
    heatMapSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "heatMapBlockWidth",
            name: "blockWidth",
            value: heatMapSetting.blockWidth,
            type: "number",
            title: "Block Width:",
        },
        {
            id: "heatMapDefaultHeight",
            name: "defaultHeight",
            value: heatMapSetting.defaultHeight,
            type: "number",
            title: "Block Height:",
        },
        {
            id: "heatMapBlockGap",
            name: "blockGap",
            value: heatMapSetting.blockGap,
            type: "number",
            title: "Block Gap:",
        },
        {
            id: "heatMapChromosomeLegendHeight",
            name: "chromosomeLegendHeight",
            value: heatMapSetting.chromosomeLegendHeight,
            type: "number",
            title: "Chromosome Legend Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'HeatMap Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const MetaChartSettingPanel = ({
    metaChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "metaChartWidth",
            name: "width",
            value: metaChartSetting.width,
            type: "number",
            title: "Width:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Meta Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const HclusterSettingPanel = ({
    hclusterClassifiedChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "hclusterChartPaddingToHeatMap",
            name: "paddingToHeatMap",
            value: hclusterClassifiedChartSetting.paddingToHeatMap,
            type: "number",
            title: "Margin To HeatMap:",
        },
        {
            id: "hclusterChartHclusterInfoWidth",
            name: "hclusterInfoWidth",
            value: hclusterClassifiedChartSetting.hclusterInfoWidth,
            type: "number",
            title: "Hcluster Info Width:",
        },
        {
            id: "hclusterChartHclusterInfoHeight",
            name: "hclusterInfoHeight",
            value: hclusterClassifiedChartSetting.hclusterInfoHeight,
            type: "number",
            title: "Hcluster Info Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Hcluster Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const NodeHistorySettingPanel = ({
    nodeHistorySetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "nodeHistorySettingWidth",
            name: "width",
            value: nodeHistorySetting.width,
            type: "number",
            title: "Width:",
        },
        {
            id: "nodeHistorySettingHeight",
            name: "height",
            value: nodeHistorySetting.height,
            type: "number",
            title: "Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Node History Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const ChartSettingPanel = ({
    defaultOpenState = false,
    icon,
    title,
    showDivider = true,
    settings,
    onSettingChange,
}) => (
    <ListCollapsePanel
        defaultOpenState={defaultOpenState}
        icon={icon}
        title={title}
        showDivider={showDivider}
    >
        <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
            {settings.map((setting, index) => (
                <Fragment key={setting.id}>
                    <SettingInput
                        value={setting.value}
                        handleValueChange={onSettingChange}
                        valueName={setting.name}
                        id={setting.id}
                        type={setting.type}
                        title={setting.title}
                    />
                    {index < settings.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    </ListCollapsePanel>
)

const initializeDataSettingState = (metaInfo) => {
    const defaultDiseaseType = Object.keys(metaInfo)[0]
    const defaultPrimarySite = Object.keys(metaInfo[defaultDiseaseType])[0]
    const defaultWorkflowType = metaInfo[defaultDiseaseType][defaultPrimarySite][0]

    return {
        diseaseType: defaultDiseaseType,
        primarySite: defaultPrimarySite,
        workflowType: defaultWorkflowType,
        valueType: "Total",
        cluster: 5,
    }
}

const useDataSetting = (metaInfo) => {
    const defaultDataSetting = useMemo(() => initializeDataSettingState(metaInfo), [metaInfo])
    const [dataSetting, setDataSetting] = useState(defaultDataSetting)

    const handleDiseaseTypeChange = (newDiseaseType) => {
        const newPrimarySite = Object.keys(metaInfo[newDiseaseType])[0]
        const newWorkflowType = metaInfo[newDiseaseType][newPrimarySite][0]
        setDataSetting({
            diseaseType: newDiseaseType,
            primarySite: newPrimarySite,
            workflowType: newWorkflowType,
            valueType: "Total",
            cluster: 5,
        })
    }

    const handlePrimarySiteChange = (newPrimarySite) => {
        const newWorkflowType = metaInfo[dataSetting.diseaseType][newPrimarySite][0]
        setDataSetting((prev) => ({
            ...prev,
            primarySite: newPrimarySite,
            workflowType: newWorkflowType,
        }))
    }

    const handleWorkflowTypeChange = (newWorkflowType) => {
        setDataSetting((prev) => ({
            ...prev,
            workflowType: newWorkflowType,
        }))
    }

    const handleValueTypeChange = (newValueType) => {
        setDataSetting((prev) => ({
            ...prev,
            valueType: newValueType,
        }))
    }

    const handleClusterChange = (newCluster) => {
        setDataSetting((prev) => ({
            ...prev,
            cluster: newCluster,
        }))
    }

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleClusterChange,
    }
}

const useChartDynamicSetting = (initialState, customHandler) => {
    const [chartSetting, setChartSetting] = useState(initialState)

    const handleChartSettingChange = (event) => {
        const { name, value } = event.target
        const numericValue = parseFloat(value)

        setChartSetting((prev) => {
            if (customHandler) {
                return customHandler(prev, name, numericValue)
            }
            return { ...prev, [name]: numericValue }
        })
    }

    return [chartSetting, handleChartSettingChange]
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

export default HeatMapPanel
