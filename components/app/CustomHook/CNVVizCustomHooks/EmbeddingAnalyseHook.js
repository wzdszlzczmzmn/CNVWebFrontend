import { useState } from "react"
import { getInitDataSetting } from "./Utils/InitUtils"

export const useDataSetting = (metaInfo) => {
    const {diseaseType, primarySite, workflowType} = getInitDataSetting(metaInfo)
    const [dataSetting, setDataSetting] = useState({
        diseaseType: diseaseType,
        primarySite: primarySite,
        workflowType: workflowType,
        valueType: "Total",
        embeddingMethod: 'PCA',
        groupingStrategy: "Hierarchical Clustering",
        groupNumber: 5,
        clusterMethod: 'weighted',
        clusterMetric: 'euclidean'
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
    const handleGroupingStrategyChange = (newGroupingStrategy) => {
        setDataSetting((prev) => ({
            ...prev,
            groupingStrategy: newGroupingStrategy
        }))
    }

    const handleGroupNumberChange = (event) => {
        const { value } = event.target

        setDataSetting((prev) => ({
            ...prev,
            groupNumber: value
        }))
    }

    const handleClusterMethodChange = (newClusterMethod) => {
        setDataSetting((prev) => ({
            ...prev,
            clusterMethod: newClusterMethod,
        }))
    }

    const handleClusterMetricChange = (newClusterMetric) => {
        setDataSetting((prev) => ({
            ...prev,
            clusterMetric: newClusterMetric
        }))
    }

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleEmbeddingMethodChange,
        handleGroupingStrategyChange,
        handleGroupNumberChange,
        handleClusterMethodChange,
        handleClusterMetricChange
    }
}
