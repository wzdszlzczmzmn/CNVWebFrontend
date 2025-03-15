import { useRef, useState } from "react"

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
        handleGroupingStrategyChange,
        handleGroupNumberChange,
        handleClusterMethodChange,
        handleClusterMetricChange
    }
}

export const useCanvasContext = () => {
    const canvasRef = useRef(document.createElement('canvas'))
    const context = canvasRef.current.getContext('2d')
    context.font = '14px sans-serif'

    return context
}

export const useDisplaySetting = () => {
    const [chromosome, setChromosome] = useState('All')
    const [CNVMin, setCNVMin] = useState(0)
    const [CNVMax, setCNVMax] = useState(10)

    const handleChromosomeChange = (newChromosome) => {
        setChromosome(newChromosome)
    }

    const handleCNVMinChange = (event) => {
        setCNVMin(Number.parseFloat(event.target.value))
    }

    const handleCNVMaxChange = (event) => {
        setCNVMax(Number.parseFloat(event.target.value))
    }

    return {
        chromosome,
        CNVMin,
        setCNVMin,
        CNVMax,
        setCNVMax,
        handleChromosomeChange,
        handleCNVMinChange,
        handleCNVMaxChange
    }
}
