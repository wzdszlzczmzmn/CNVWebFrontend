import { getRecurrentInitDataSetting } from "./Utils/InitUtils"
import { useState } from "react"

export const useDataSetting = (metaInfo) => {
    const { diseaseType, primarySite, workflowType } = getRecurrentInitDataSetting(metaInfo)
    const [dataSetting, setDataSetting] = useState({
        diseaseType: diseaseType,
        primarySite: primarySite,
        workflowType: workflowType,
        yAxisValueType: 'G-score'
    })

    const handleDiseaseTypeChange = (newDiseaseType) => {
        const newPrimarySite = metaInfo.find(meta => meta.diseaseType === newDiseaseType).primarySites[0]

        setDataSetting((prev) => ({
            ...prev,
            diseaseType: newDiseaseType,
            primarySite: newPrimarySite
        }))
    }

    const handlePrimarySiteChange =(newPrimarySite) => {
        setDataSetting((prev) => ({
            ...prev,
            primarySite: newPrimarySite
        }))
    }

    const handleWorkflowTypeChange = (newWorkflowType) => {
        setDataSetting((prev) => ({
            ...prev,
            workflowType: newWorkflowType,
        }))
    }

    const handleYAxisValueTypeChange = (newYAxisValueType) => {
        setDataSetting((prev) => ({
            ...prev,
            yAxisValueType: newYAxisValueType,
        }))
    }

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleYAxisValueTypeChange
    }
}
