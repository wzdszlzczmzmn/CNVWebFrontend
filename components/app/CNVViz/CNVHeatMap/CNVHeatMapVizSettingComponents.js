import Stack from "@mui/material/Stack"
import React, { Fragment } from "react"
import Divider from "@mui/material/Divider"
import { Settings } from "@mui/icons-material"
import { ListCollapsePanel } from "../../../Layout/ListCollapsePanel"
import { SettingInput } from "components/app/CNVViz/SettingConfigComponents/SettingInput"
import { SettingSelector } from "components/app/CNVViz/SettingConfigComponents/SettingSelector"

export const DataSettingPanel = ({
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
                : []
        ),
        // ...(handleClusterChange === null ?
        //         []
        //         :
        //         [
        //             {
        //                 key: "cluster",
        //                 value: dataSetting.cluster,
        //                 setValue: handleClusterChange,
        //                 title: "Cluster:",
        //                 valueList: Array.from({ length: 9 }, (_, i) => i + 2),
        //             }
        //         ]
        // )
    ]

    return (
        <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
            {dataSettingFields.map((field, index) => (
                <Fragment key={field.key}>
                    <SettingSelector
                        value={field.value}
                        setValue={field.setValue}
                        title={field.title}
                        valueList={field.valueList}
                    />
                    {index < dataSettingFields.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    )
}

export const WholeChartSettingPanel = ({
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

export const TreeChartSettingPanel = ({
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

export const HeatMapSettingPanel = ({
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

export const MetaChartSettingPanel = ({
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

export const HclusterSettingPanel = ({
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

export const NodeHistorySettingPanel = ({
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

export const ChartSettingPanel = ({
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
