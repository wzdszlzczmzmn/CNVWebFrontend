import { useMemo, useState } from "react"

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

export const useDataSetting = (metaInfo) => {
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

export const useChartDynamicSetting = (initialState, customHandler) => {
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
