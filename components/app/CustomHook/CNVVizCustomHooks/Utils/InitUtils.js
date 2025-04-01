export const getInitDataSetting = (metaInfo) => {
    const diseaseType = Object.keys(metaInfo)[0]
    const primarySite = Object.keys(metaInfo[diseaseType])[0]
    const workflowType = metaInfo[diseaseType][primarySite][0]

    return {
        diseaseType,
        primarySite,
        workflowType
    }
}

export const getRecurrentInitDataSetting = (metaInfo) => {
    const diseaseType = metaInfo[0].diseaseType
    const primarySite = metaInfo[0].primarySites[0]
    const workflowType = 'DNAcopy'

    return {
        diseaseType,
        primarySite,
        workflowType
    }
}
