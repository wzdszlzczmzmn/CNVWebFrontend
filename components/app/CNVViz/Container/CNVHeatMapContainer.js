import useSWR from "swr";
import {
    fetcher,
    fetcherCSV,
    getCNVCutURL,
    getCNVMatrixMetaURL,
    getCNVMetaURL,
    getProjectCNVMatrixURL
} from "../../../../data/get";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import React, {memo} from "react";
import {CNVHeatMap} from "/components/Viz/HeatMap/CNVHeatMap";

const CNVHeatMapContainer = (
    {
        projectId,
        CNVBaseline,
        vizSetting,
        dataSetting,
        cnvType,
    }
) => {
    const {
        data: CNVMatrixMeta,
        error: CNVMatrixMetaError,
        isLoading: isLoadingCNVMatrixMeta
    } = useSWR(`${getCNVMatrixMetaURL}?binStep=3000000`, fetcher)

    const getMatrixParams = new URLSearchParams({
        projectId: projectId,
        diseaseType: dataSetting.diseaseType,
        primarySite: dataSetting.primarySite,
        workflowType: dataSetting.workflowType,
        cnvType: cnvType,
        ...(dataSetting.valueType !== undefined && { valueType: dataSetting.valueType })
    })

    const {
        data: CNVMatrix,
        error: CNVMatrixError,
        isLoading: isLoadingCNVMatrix
    } = useSWR(`${getProjectCNVMatrixURL}?${getMatrixParams.toString()}`, fetcherCSV)

    const getCNVMetaParams = new URLSearchParams({
        projectId: projectId,
        diseaseType: dataSetting.diseaseType,
        primarySite: dataSetting.primarySite,
        workflowType: dataSetting.workflowType,
        cnvType: cnvType,
        cluster: dataSetting.cluster,
        ...(dataSetting.valueType !== undefined && { valueType: dataSetting.valueType })
    })

    const {
        data: CNVMeta,
        error: CNVMetaError,
        isLoading: isLoadingCNVMeta
    } = useSWR(`${getCNVMetaURL}?${getCNVMetaParams.toString()}`, fetcherCSV)

    const getCNVCutParams = new URLSearchParams({
        projectId: projectId,
        diseaseType: dataSetting.diseaseType,
        primarySite: dataSetting.primarySite,
        workflowType: dataSetting.workflowType,
        cnvType: cnvType,
        cluster: dataSetting.cluster,
        ...(dataSetting.valueType !== undefined && { valueType: dataSetting.valueType })
    })

    const {
        data: CNVCut,
        error: CNVCutError,
        isLoading: isLoadingCNVCut
    } = useSWR(`${getCNVCutURL}?${getCNVCutParams.toString()}`, fetcher)

    if (CNVMatrixError || CNVMatrixMetaError || CNVMetaError || CNVCutError) {
        return (
            <Box sx={{width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant='h4'>😭 Fail To Load Data</Typography>
            </Box>
        )
    }

    if (isLoadingCNVMatrix || isLoadingCNVMatrixMeta || isLoadingCNVMeta || isLoadingCNVCut) {
        return (
            <Box sx={{width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <CircularProgress size={60}/>
                <Typography
                    variant='h5'
                    sx={{ml: 3}}>
                    Loading {
                    isLoadingCNVMatrixMeta ?
                        'CNV Matrix Meta Data' : isLoadingCNVMatrix ?
                            'CNV Matrix' : isLoadingCNVMeta ?
                                'CNV Meta Data' : isLoadingCNVCut ?
                                    'CNV Phylogenetic Tree Data' : ''}..., please wait for a moment.</Typography>
            </Box>
        )
    }

    return (
        <CNVHeatMap
            CNVMatrixMeta={CNVMatrixMeta}
            CNVMatrix={CNVMatrix}
            CNVMeta={CNVMeta}
            CNVCut={CNVCut}
            CNVBaseline={CNVBaseline}
            vizSetting={vizSetting}
        />
    )
}

export const MemoCNVHeatMapContainer = memo(CNVHeatMapContainer)
