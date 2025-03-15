import { useState } from "react"

const getInitDataSetting = (metaInfo) => {
    const diseaseType = Object.keys(metaInfo)[0]
    const primarySite = Object.keys(metaInfo[diseaseType])[0]
    const workflowType = metaInfo[diseaseType][primarySite][0]

    return {
        diseaseType,
        primarySite,
        workflowType
    }
}

export const useDataSetting = (metaInfo) => {
    const {diseaseType, primarySite, workflowType} = getInitDataSetting(metaInfo)
    const [dataSetting, setDataSetting] = useState({
        diseaseType: diseaseType,
        primarySite: primarySite,
        workflowType: workflowType,
        valueType: "Total",
        embeddingMethod: 'All'
    })

    const handleDiseaseTypeChange = (newDiseaseType) => {
        const newPrimarySite = Object.keys(metaInfo[newDiseaseType])[0]
        const newWorkflowType = metaInfo[newDiseaseType][newPrimarySite][0]
        setDataSetting((prev) => ({
            ...prev,
            diseaseType: newDiseaseType,
            primarySite: newPrimarySite,
            workflowType: newWorkflowType,
        }))
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

    const handleEmbeddingMethodChange = (newEmbeddingMethod) => {
        setDataSetting((prev) => ({
            ...prev,
            embeddingMethod: newEmbeddingMethod
        }))
    }

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleEmbeddingMethodChange
    }
}
