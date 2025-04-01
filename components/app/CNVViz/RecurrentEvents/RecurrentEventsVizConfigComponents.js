import { PieChart } from "@mui/icons-material"
import Stack from "@mui/material/Stack"
import React, { Fragment } from "react"
import { SettingSelector } from "../SettingConfigComponents/SettingSelector"
import { SettingInput } from "../SettingConfigComponents/SettingInput"
import Divider from "@mui/material/Divider"
import { Button } from "antd"
import { ListCollapsePanel } from "../../../Layout/ListCollapsePanel"

export const DataSettingPanel = ({
    metaInfo,
    dataSettingManager
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
                    // onClick={renderEmbeddingAnalyse}
                >
                    Render
                </Button>
            </Stack>
        </ListCollapsePanel>
    )
}
