import axios from 'axios';
import useSWR from "swr";

export const fetcher = async url => {
    const res = await axios.get(url,{
        timeout: 60000,
    });
    return res.data;
}

export const fetcherCSV = async url => {
    const res = await axios.get(url, {
        headers: {
            'Content-Type': 'text/csv',
        }
    })

    return res.data
}

const root = process.env.NEXT_PUBLIC_API_URL;
export const getDbStatsURL = `${root}/cnvdata/dbstats`;
export const getDataIdbyMarkerURL = `${root}/data_ids/query_marker`;
export const getCNVProjectIdURL = `${root}/cnvdata/project_ids`
export const getOneRecordURL = `${root}/cnvdata/record`;
export const getRecordsURL = `${root}/cnvdata/records`;

export const getProjectCNVMatrixURL = `${root}/cnvdata/project_CNVMatrix`;
export const getCNVMatrixMetaURL = `${root}/cnvdata/CNVMatrix_meta`
export const getCNVMetaURL = `${root}/cnvdata/project_CNVMeta`
export const getCNVCutURL = `${root}/cnvdata/project_CNVCut`

export const getProjectMetaInfoURL = `${root}/cnvdata/project_meta_info`
export const getProjectGISTICMetaInfoURL = `${root}/cnvdata/project_gistic_meta_info`
export const getProjectCNVInfoURL = `${root}/cnvdata/project_CNV_info`
export const getCasesURL = `${root}/cnvdata/cases`
export const getCasesFilterInfoURL = `${root}/cnvdata/cases-filter-info`

export const getDiseaseAndSitesDataURL = `${root}/cnvdata/diseasesAndSites`
export const getProjectStatisticDataURL = `${root}/cnvdata/project_data_statistic`

export const getRecurrentRegionsAreaPlotRenderURL = `${root}/cnvdata/Recurrent-Regions-Area_Plot_render`
export const getRecurrentEventsRenderURL = `${root}/cnvdata/Recurrent-Events-render`
export const getRecurrentEventsEachPageRenderURL = `${root}/cnvdata/Recurrent-Events-each-page-render`

export const getCaseSummaryDetailURL = `${root}/cnvdata/case_detail`

export const getGISTICTaskURL = `${root}/analysis/gistic_task_query`
export const getGISTICDemoDataURL = `${root}/analysis/gistic_demo_data_download`
export const getGISTICRecurrentRegionsURL = `${root}/analysis/gistic_recurrent_region`
export const getGISTICRecurrentEventURL = `${root}/analysis/gistic_recurrent_event`

const DataInfoFallback = {
    data_uuid: "",
    technology: "",
    species: "",
    tissue: "",
    disease: "",
    molecule: "",
    markers: ["marker1", "marker2"],
    source_name: "",
    source_url: "",
    journal: "",
    year: "",
    cell_count: "",
    marker_count: "",
    roi_count: "",
    is_single_cell: false,
    has_cell_type: false,
    created_at: 123
}

export const useDataInfo = (dataID, fallback = DataInfoFallback) => {

    const {data, error} = useSWR(`${getOneRecordURL}/${dataID}`, fetcher)

    return {
        data: !data ? fallback : data,
        error: error,
    }
}
