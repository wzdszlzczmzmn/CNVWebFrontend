import Stack from "@mui/material/Stack"
import React, { Fragment } from "react"
import { SettingSelector } from "../SettingConfigComponents/SettingSelector"
import Divider from "@mui/material/Divider"
import { SettingInput } from "../SettingConfigComponents/SettingInput"
import { PieChart, Settings } from "@mui/icons-material"
import { ListCollapsePanel } from "../../../Layout/ListCollapsePanel"
import { Button } from "antd"
import { hg38ChromosomeInfo } from "../../../../const/ChromosomeInfo"

export const DataSettingPanel = ({
    metaInfo,
    dataSettingManager,
    renderPloidyStairstep,
    isShowValueTypeSelector
}) => {
    const settingItems = [
        {
            key: "diseaseType",
            value: dataSettingManager.dataSetting.diseaseType,
            setValue: dataSettingManager.handleDiseaseTypeChange,
            title: "Disease Type:",
            valueList: Object.keys(metaInfo),
            inputComponentType: "Selector"
        },
        {
            key: "primarySite",
            value: dataSettingManager.dataSetting.primarySite,
            setValue: dataSettingManager.handlePrimarySiteChange,
            title: "Primary Site:",
            valueList: Object.keys(metaInfo[dataSettingManager.dataSetting.diseaseType]),
            inputComponentType: "Selector"
        },
        {
            key: "workflowType",
            value: dataSettingManager.dataSetting.workflowType,
            setValue: dataSettingManager.handleWorkflowTypeChange,
            title: "Workflow Type:",
            valueList: metaInfo[dataSettingManager.dataSetting.diseaseType][dataSettingManager.dataSetting.primarySite],
            inputComponentType: "Selector"
        },
        {
            key: "groupingStrategy",
            value: dataSettingManager.dataSetting.groupingStrategy,
            setValue: dataSettingManager.handleGroupingStrategyChange,
            title: "Cluster Strategy:",
            valueList: ["Hierarchical Clustering"],
            inputComponentType: "Selector"
        },
        {
            key: "groupNumber",
            name: "groupNumber",
            value: dataSettingManager.dataSetting.groupNumber,
            setValue: dataSettingManager.handleGroupNumberChange,
            type: "number",
            title: "Cluster Number:",
            inputComponentType: "TextField"
        }
    ]

    if (dataSettingManager.dataSetting.groupingStrategy === 'Hierarchical Clustering') {
        settingItems.push(...[
            {
                key: 'clusterMethod',
                value: dataSettingManager.dataSetting.clusterMethod,
                setValue: dataSettingManager.handleClusterMethodChange,
                title: 'Cluster Method:',
                valueList: dataSettingManager.dataSetting.clusterMetric === 'euclidean' ? ['single', 'complete', 'average', 'weighted', 'centroid', 'median', 'ward'] : ['single', 'complete', 'average', 'weighted'],
                inputComponentType: "Selector"
            },
            {
                key: 'clusterMetric',
                value: dataSettingManager.dataSetting.clusterMetric,
                setValue: dataSettingManager.handleClusterMetricChange,
                title: 'Cluster Metric:',
                valueList: ['euclidean', 'cityblock', 'correlation', 'cosine', 'braycurtis', 'canberra'],
                inputComponentType: 'Selector'
            }
        ])
    }

    if (isShowValueTypeSelector) {
        settingItems.push(
            {
                key: "valueType",
                value: dataSettingManager.dataSetting.valueType,
                setValue: dataSettingManager.handleValueTypeChange,
                title: "Value Type:",
                valueList: ["Total", "Major", "Minor"],
                inputComponentType: "Selector"
            },
        )
    }

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
                    onClick={renderPloidyStairstep}
                >
                    Render
                </Button>
            </Stack>
        </ListCollapsePanel>
    )
}

export const DisplaySettingPanel = ({
    displaySettingManager
}) => {
    const settingItems = [
        {
            key: "chromosome",
            value: displaySettingManager.chromosome,
            setValue: displaySettingManager.handleChromosomeChange,
            title: "Chromosome:",
            valueList: ['All', ...Object.keys(hg38ChromosomeInfo)],
            inputComponentType: "Selector"
        },
        {
            key: "CNVMin",
            name: "CNVMin",
            value: displaySettingManager.CNVMin,
            setValue: displaySettingManager.handleCNVMinChange,
            type: "number",
            title: "CNV Min:",
            inputComponentType: "TextField"
        },
        {
            key: "CNVMax",
            name: "CNVMax",
            value: displaySettingManager.CNVMax,
            setValue: displaySettingManager.handleCNVMaxChange,
            type: "number",
            title: "CNV Max:",
            inputComponentType: "TextField"
        }
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Display Setting'}
            settings={settingItems}
        />
    )
}


const ChartSettingPanel = ({
    defaultOpenState = false,
    icon,
    title,
    showDivider = true,
    settings
}) => (
    <ListCollapsePanel
        defaultOpenState={defaultOpenState}
        icon={icon}
        title={title}
        showDivider={showDivider}
    >
        <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
            {settings.map((setting, index) => (
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

                    {index < settings.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    </ListCollapsePanel>
)
