import { ListCollapsePanel } from "../../../Layout/ListCollapsePanel"
import { PieChart, Settings } from "@mui/icons-material"
import Stack from "@mui/material/Stack"
import React, { Fragment } from "react"
import { SettingSelector, SettingSelectorRaw } from "../SettingConfigComponents/SettingSelector"
import { SettingInput } from "../SettingConfigComponents/SettingInput"
import Divider from "@mui/material/Divider"
import { Button } from "antd"
import { useRecurrentRegionsAreaPlotStore } from "../../../../stores/RecurrentRegionsAreaPlotStore"
import { SettingRadio } from "../SettingConfigComponents/SettingRadio"
import { hg38ChromosomeInfo } from "../../../../const/ChromosomeInfo"

export const DataSettingPanel = ({
    metaInfo,
    dataSettingManager,
    renderRecurrentRegionsAreaPlot
}) => {
    const settingItems = [
        {
            key: "diseaseType",
            value: dataSettingManager.dataSetting.diseaseType,
            setValue: dataSettingManager.handleDiseaseTypeChange,
            title: "Disease Type:",
            valueList: metaInfo.map(meta => meta.diseaseType),
            inputComponentType: "Selector"
        },
        {
            key: "primarySite",
            value: dataSettingManager.dataSetting.primarySite,
            setValue: dataSettingManager.handlePrimarySiteChange,
            title: "Primary Site:",
            valueList: metaInfo.find(
                meta => meta.diseaseType === dataSettingManager.dataSetting.diseaseType
            ).primarySites,
            inputComponentType: "Selector"
        },
        {
            key: "workflowType",
            value: dataSettingManager.dataSetting.workflowType,
            setValue: dataSettingManager.handleWorkflowTypeChange,
            title: "Workflow Type:",
            valueList: ['DNAcopy'],
            inputComponentType: "Selector"
        },
        {
            key: "yAxisValueType",
            value: dataSettingManager.dataSetting.yAxisValueType,
            setValue: dataSettingManager.handleYAxisValueTypeChange,
            title: 'YAxis Value Type:',
            valueList: ['G-score', 'q-value'],
            inputComponentType: "Selector"
        }
    ]

    return (
        <ListCollapsePanel
            defaultOpenState={true}
            icon={<PieChart/>}
            title={'Data Setting'}
            showDivider={true}
        >
            <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
                {
                    settingItems.map((setting, index) => (
                        <Fragment key={setting.key}>
                            {
                                setting.inputComponentType === 'Selector' ? (
                                    <SettingSelector
                                        value={setting.value}
                                        setValue={setting.setValue}
                                        title={setting.title}
                                        valueList={setting.valueList}
                                    />
                                ) : (
                                    <SettingInput
                                        value={setting.value}
                                        handleValueChange={setting.setValue}
                                        valueName={setting.name}
                                        id={setting.id}
                                        type={setting.type}
                                        title={setting.title}
                                        step={1}
                                    />
                                )
                            }

                            {index < settingItems.length - 1 && <Divider/>}
                        </Fragment>
                    ))
                }
            </Stack>
            <Stack spacing={1} sx={{ mt: 2, mb: 2, px: '6px' }}>
                <Button
                    style={{
                        backgroundColor: '#41B3A2',
                        color: '#FFFFFF',
                        borderColor: '#41B3A2'
                    }}
                    onClick={renderRecurrentRegionsAreaPlot}
                >
                    Render
                </Button>
            </Stack>
        </ListCollapsePanel>
    )
}

export const DisplaySettingPanel = () => {
    const setting = useRecurrentRegionsAreaPlotStore((state) => state.displaySetting)
    const setChartSetting = useRecurrentRegionsAreaPlotStore((state) => state.setChartSetting)

    const handleChartSettingChange = (event) => {
        setChartSetting(event, 'displaySetting')
    }

    const settingItems = [
        {
            key: "chromosome",
            name: 'chromosome',
            value: setting.chromosome,
            title: "Chromosome:",
            valueList: ['All', ...Object.keys(hg38ChromosomeInfo)],
            inputComponentType: "Selector"
        },
        {
            id: 'recurrentRegionDisplayMode',
            name: 'mode',
            value: setting.mode,
            title: 'Y Axis Max Mode',
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
            inputComponentType: 'Radio'
        }
    ]

    if (setting.mode === 'Fixed') {
        settingItems.push(
            ...[
                {
                    id: 'ampYAxisMax',
                    name: 'ampYAxisMax',
                    value: setting.ampYAxisMax,
                    type: "number",
                    title: "Amp Y Axis Max:",
                    inputComponentType: "TextField"
                },
                {
                    id: 'delYAxisMax',
                    name: 'delYAxisMax',
                    value: setting.delYAxisMax,
                    type: "number",
                    title: "Del Y Axis Max:",
                    inputComponentType: "TextField"
                }
            ]
        )
    }

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Display Setting'}
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
                        setting.inputComponentType === "Selector" ? (
                            <SettingSelectorRaw
                                value={setting.value}
                                name={setting.name}
                                setValue={onSettingChange}
                                title={setting.title}
                                valueList={setting.valueList}
                            />
                        ) : (
                            setting.inputComponentType === "TextField" ? (
                                <SettingInput
                                    value={setting.value}
                                    handleValueChange={onSettingChange}
                                    valueName={setting.name}
                                    id={setting.id}
                                    type={setting.type}
                                    title={setting.title}
                                    step={1}
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
                        )
                    }
                    {index < settings.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    </ListCollapsePanel>
)
