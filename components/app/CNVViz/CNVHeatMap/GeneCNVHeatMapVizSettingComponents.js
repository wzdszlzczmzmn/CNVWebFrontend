import { ListCollapsePanel } from "../../../Layout/ListCollapsePanel"
import Stack from "@mui/material/Stack"
import React, { Fragment } from "react"
import Divider from "@mui/material/Divider"
import useGeneCNVHeatMapVizSettingStore from 'stores/GeneCNVHeatMapVizSettingStore'
import { Settings } from "@mui/icons-material"
import { SettingRadio } from "components/app/CNVViz/SettingConfigComponents/SettingRadio"
import { SettingInput } from "components/app/CNVViz/SettingConfigComponents/SettingInput"

export const HeatMapSettingPanel = () => {
    const setting = useGeneCNVHeatMapVizSettingStore((state) => state.heatMapSetting)
    const setChartSetting = useGeneCNVHeatMapVizSettingStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'heatMapSetting')
    }

    const settingItems = [
        {
            id: "heatMapMode",
            name: "mode",
            value: setting.mode,
            title: "Mode",
            options: [
                {
                    label: "Fixed",
                    value: "Fixed"
                },
                {
                    label: "Adaptive",
                    value: "Adaptive"
                }
            ],
            inputComponentType: "Radio"
        },
        {
            id: "heatMapCNVRectWidth",
            name: "CNVRectWidth",
            value: setting.CNVRectWidth,
            type: "number",
            title: "CNV Rect Width:",
            inputComponentType: "TextField"
        },
        {
            id: "heatMapMetaRectWidth",
            name: "metaRectWidth",
            value: setting.metaRectWidth,
            type: "number",
            title: "Meta Rect Width:",
            inputComponentType: "TextField"
        }
    ]

    if (setting.mode === 'Fixed') {
        settingItems.push(
            {
                id: "heatMapRectHeight",
                name: "rectHeight",
                value: setting.rectHeight,
                type: "number",
                title: "Rect Height:",
                inputComponentType: "TextField"
            }
        )
    }else {
        settingItems.push(
            {
                id: "heatMapHeight",
                name: "height",
                value: setting.height,
                type: "number",
                title: "Height:",
                inputComponentType: "TextField"
            }
        )
    }

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'HeatMap Setting'}
            settings={settingItems}
            onSettingChange={handleChartSettingChange}
        />
    )
}

export const HierarchicalClusteringTreeSettingPanel = () => {
    const setting = useGeneCNVHeatMapVizSettingStore((state) => state.hierarchicalClusteringTreeSetting)
    const setChartSetting = useGeneCNVHeatMapVizSettingStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'hierarchicalClusteringTreeSetting')
    }

    const settingItems = [
        {
            id: "hierarchicalClusteringTreeWidth",
            name: "width",
            value: setting.width,
            type: "number",
            title: "Tree Width:",
            inputComponentType: "TextField"
        },
        {
            id: "hierarchicalClusteringTreeNodeRadius",
            name: "nodeRadius",
            value: setting.nodeRadius,
            type: "number",
            title: "Node Radius:",
            inputComponentType: "TextField"
        }
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Tree Setting'}
            settings={settingItems}
            onSettingChange={handleChartSettingChange}
        />
    )
}

export const NodeHistorySettingPanel = () => {
    const setting = useGeneCNVHeatMapVizSettingStore((state) => state.nodeHistorySetting)
    const setChartSetting = useGeneCNVHeatMapVizSettingStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'nodeHistorySetting')
    }

    const settingItems = [
        {
            id: "nodeHistoryWidth",
            name: "width",
            value: setting.width,
            type: "number",
            title: "Width:",
            inputComponentType: "TextField"
        },
        {
            id: "nodeHistoryHeight",
            name: "height",
            value: setting.height,
            type: "number",
            title: "Height:",
            inputComponentType: "TextField"
        }
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Node History Setting'}
            settings={settingItems}
            onSettingChange={handleChartSettingChange}
        />
    )
}

export const ColorLegendSettingPanel = () => {
    const setting = useGeneCNVHeatMapVizSettingStore((state) => state.colorLegendSetting)
    const setChartSetting = useGeneCNVHeatMapVizSettingStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'colorLegendSetting')
    }

    const settingItems = [
        {
            id: "colorLegendWidth",
            name: "width",
            value: setting.width,
            type: "number",
            title: "Width:",
            inputComponentType: "TextField"
        },
        {
            id: "colorLegendHeight",
            name: "height",
            value: setting.height,
            type: "number",
            title: "Height:",
            inputComponentType: "TextField"
        }
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Color Legend Setting'}
            settings={settingItems}
            onSettingChange={handleChartSettingChange}
        />
    )
}

export const GapSettingPanel = () => {
    const setting = useGeneCNVHeatMapVizSettingStore((state) => state.gapSetting)
    const setChartSetting = useGeneCNVHeatMapVizSettingStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'gapSetting')
    }

    const settingItems = [
        {
            id: "treeHeatMapGap",
            name: "treeHeatMapGap",
            value: setting.treeHeatMapGap,
            type: "number",
            title: "Tree - HeatMap Gap:",
            inputComponentType: "TextField"
        },
        {
            id: "colorLegendTreeGap",
            name: "colorLegendTreeGap",
            value: setting.colorLegendTreeGap,
            type: "number",
            title: "Color Legend - Tree Gap:",
            inputComponentType: "TextField"
        }
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Gap Setting'}
            settings={settingItems}
            onSettingChange={handleChartSettingChange}
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
                    {
                        setting.inputComponentType === "TextField" ? (
                        <SettingInput
                            value={setting.value}
                            handleValueChange={onSettingChange}
                            valueName={setting.name}
                            id={setting.id}
                            type={setting.type}
                            title={setting.title}
                        />
                        ) : (
                            <SettingRadio
                                value={setting.value}
                                name={setting.name}
                                options={setting.options}
                                title={setting.title}
                                handleValueChange={onSettingChange}
                            />
                        )
                    }
                    {index < settings.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    </ListCollapsePanel>
)
