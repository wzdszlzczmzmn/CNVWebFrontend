import {
    fetcher,
    getOneRecordURL,
    useDataInfo,
    getCNVProjectIdURL, getProjectCNVInfoURL,
} from "data/get";
import { Container } from "@mui/material";
import React, { useState } from "react";
import RecordDetailsTable from "components/DataTable/RecordDetailsTable";
import Typography from "@mui/material/Typography";
import Head from 'next/head';
import Stack from "@mui/material/Stack";
import ContentBox from "../../components/Layout/ContentBox";
import DataStatisticChart from "components/Viz/DataStatisticChart"
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import { StatisticSelectButton } from "components/app/Statistic/Buttons"
import { StatisticSelections } from "components/app/Statistic/StatisticSelections"
import MemoCasesDataTable from 'components/DataTable/CasesDataTable'
import MemoChromosomeLevelCNVHeatMaps
    from "../../components/app/CNVViz/CNVHeatMap/ChromosomeLevelCNVHeatMap/ChromosomeLevelCNVHeatMaps"
import MemoGeneLevelCNVHeatMaps from "../../components/app/CNVViz/CNVHeatMap/GeneLevelCNVHeatMap/GeneLevelCNVHeatMaps"
import MemoPloidyStairstepContainer from "../../components/app/CNVViz/PloidyStairstep/PloidyStairstepContainer"
import MemoEmbeddingAnalyseContainer from "../../components/app/CNVViz/EmbeddingAnalyse/EmbeddingAnalyseContainer"
import useSWR from "swr"
import ErrorView from "../../components/StateViews/ErrorView"
import LoadingView from "../../components/StateViews/LoadingView"
import MemoRecurrentEventsContainer from "../../components/app/CNVViz/RecurrentEvents/RecurrentEventsContainer"
import MemoRecurrentRegionsContainer from "../../components/app/CNVViz/RecurrentRegions/RecurrentRegionsContainer"


const DetailsPage = ({ id, initROI, initROIMeta, initRecordData }) => {
    const [statisticsDataType, setStatisticsDataType] = useState("Disease Attribute")
    const [selectedItem, setSelectedItem] = useState('Disease Type');

    const { data: recordData } = useDataInfo(id, initRecordData);

    const {
        data: projectCNVInfo,
        error: projectCNVInfoError,
        isLoading: isLoading
    } = useSWR(`${getProjectCNVInfoURL}?projectId=${id}`, fetcher)

    if (projectCNVInfoError) {
        return <ErrorView/>
    }

    if (isLoading) {
        return <LoadingView/>
    }

    const { cnvTypes, isGISTIC } = projectCNVInfo

    const handleDataTypeChange = (event) => {
        setStatisticsDataType(event.target.value)
        setSelectedItem(StatisticSelections[event.target.value][0])
    }

    const selectedItemClickHandler = (selectedItem) => {
        setSelectedItem(selectedItem)
    }

    return (
        <>
            <Head>
                <title>Aquila | Data</title>
            </Head>
            <Container maxWidth={"xl"} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="flex-start" spacing={4} sx={{ mt: 4 }}>
                    <ContentBox>
                        <Typography variant={"h5"} sx={{ mb: 2, mt: 1 }}>Data Summary</Typography>
                        <RecordDetailsTable dataID={id}/>
                    </ContentBox>
                    <ContentBox>
                        <Stack direction="row" spacing={8} justifyContent="space-between">
                            <Typography variant="h5" sx={{ mb: 2, mt: 1 }}>Statistic Visualization</Typography>
                            <Box sx={{ pt: 0.5, pb: 1 }}>
                                <FormControl size="small" sx={{ width: 200 }}>
                                    <InputLabel id="statistic-data-type-label">Statistic Data Type</InputLabel>
                                    <Select
                                        labelId="statistic-data-type-label"
                                        id="statistic-data-type"
                                        value={statisticsDataType}
                                        label="StatisticDataType"
                                        onChange={handleDataTypeChange}
                                    >
                                        <MenuItem value="Disease Attribute">Disease Attribute</MenuItem>
                                        <MenuItem value="Demographic">Demographic</MenuItem>
                                        <MenuItem value="Diagnosis">Diagnosis</MenuItem>
                                        <MenuItem value="CNVFiles">CNVFiles</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>
                        <Stack direction='row' spacing={2} sx={{ mb: 2, ml: 0.5 }}>
                            {StatisticSelections[statisticsDataType].map((item, index) => {
                                return <StatisticSelectButton
                                    buttonText={item} key={item}
                                    selected={selectedItem === item}
                                    clickHandler={() => selectedItemClickHandler(item)}/>
                            })}
                        </Stack>
                        <Box sx={{ width: '100%', height: '90%', display: 'flex' }}>
                            <DataStatisticChart projectId={id} dataType={statisticsDataType}
                                                selectedItem={selectedItem}/>
                        </Box>
                    </ContentBox>
                </Stack>

                <Stack>
                    <Typography variant="h5" sx={{ mb: 2, mt: 4, ml: 1 }}>Cases</Typography>
                    <MemoCasesDataTable projectId={id}/>
                </Stack>

                <Stack>
                    <Typography variant="h5" sx={{ ml: 1, mb: 2 }}>Chromosome Level CNV HeatMap</Typography>
                    <MemoChromosomeLevelCNVHeatMaps projectId={id} cnvTypes={cnvTypes}/>
                </Stack>

                <Stack sx={{ mt: 4 }}>
                    <Typography variant="h5" sx={{ ml: 1, mb: 2 }}>Gene Level CNV HeatMap</Typography>
                    <MemoGeneLevelCNVHeatMaps projectId={id}/>
                </Stack>

                <Stack sx={{ mt: 4 }}>
                    <Typography variant="h5" sx={{ ml: 1, mb: 2 }}>Embedding Analyse Visualization</Typography>
                    <MemoEmbeddingAnalyseContainer projectId={id} cnvTypes={cnvTypes}/>
                </Stack>

                <Stack sx={{ mt: 4 }}>
                    <Typography variant="h5" sx={{ ml: 1, mb: 2 }}>Ploidy Stairstep</Typography>
                    <MemoPloidyStairstepContainer projectId={id} cnvTypes={cnvTypes}/>
                </Stack>

                {
                    isGISTIC ? (
                        <>
                            <Stack sx={{ mt: 4 }}>
                                <Typography variant='h5' sx={{ ml: 1, mb: 2 }}>Recurrent Events</Typography>
                                <MemoRecurrentEventsContainer projectId={id} cnvTypes={cnvTypes}/>
                            </Stack>

                            <Stack sx={{ mt: 4 }}>
                                <Typography variant='h5' sx={{ ml: 1, mb: 2 }}>Recurrent Regions</Typography>
                                <MemoRecurrentRegionsContainer projectId={id} cnvTypes={cnvTypes}/>
                            </Stack>
                        </>
                    ) : (
                        <></>
                    )
                }

            </Container>
        </>
    )
}

export async function getStaticPaths() {
    const data_ids = await fetcher(getCNVProjectIdURL);
    const allIDs = data_ids.map(data_id => {
        return {
            params: {
                id: data_id
            }
        }
    })
    return {
        paths: allIDs,
        fallback: false,
    }
}

export async function getStaticProps({ params }) {
    const RecordURL = `${getOneRecordURL}/${params.id}`;

    const recordData = await fetcher(RecordURL);

    return {
        props: {
            id: params.id,
            initRecordData: recordData,
        },
    }
}

export default DetailsPage;
