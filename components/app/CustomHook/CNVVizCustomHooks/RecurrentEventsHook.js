import { useState } from "react"
import { getRecurrentInitDataSetting } from "./Utils/InitUtils"


export const useDataSetting = (metaInfo) => {
    const { diseaseType, primarySite, workflowType } = getRecurrentInitDataSetting(metaInfo)
    const [dataSetting, setDataSetting] = useState({
        diseaseType: diseaseType,
        primarySite: primarySite,
        workflowType: workflowType,
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

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange
    }
}
