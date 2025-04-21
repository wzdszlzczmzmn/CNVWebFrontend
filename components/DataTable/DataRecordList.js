import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {memo, startTransition, useState} from "react";
import Link from "../Link";
import IconButton from "@mui/material/IconButton";
import {
    StatsText,
    ProgramChip,
    ExperimentalStrategyChip,
    ProjectText,
    PrimarySiteChipWithTooltip,
    DiseaseTypeChipWithTooltip
} from "./Cards";
import Tooltip from "@mui/material/Tooltip";
import {ImDownload} from 'react-icons/im';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';


const DataRecordCard = ({record}) => {
    return <Grid item xs={4} md={6}>
        <Container maxWidth="400px">
            <Paper square elevation={0} sx={{
                my: 2,
                pt: 2,
                pb: 1,
                px: 4,
                border: 1,
                borderRadius: '8px',
                borderColor: 'divider',
                '&:hover': {
                    backgroundColor: 'rgba(255,204,128,0.05)',
                    transition: 'background 0.3s'
                }
            }}>
                <Grid container direction="row" spacing={2} justifyContent="flex-start">
                    <Grid item>
                        <ProgramChip program={record.program}/>
                    </Grid>
                    <Grid item>
                        <PrimarySiteChipWithTooltip primarySites={record.primary_sites} tooltipPlacement={'top'}/>
                    </Grid>
                    <Grid item>
                        <DiseaseTypeChipWithTooltip diseaseTypes={record.disease_types} tooltipPlacement={'top'}/>
                    </Grid>
                </Grid>

                <Stack direction="row" justifyContent="space-between" spacing={4} sx={{my: 2}}>
                    <StatsText count={record.case_num} unit={'Cases'}/>
                    <StatsText count={record.cnv_files} unit={'CNV Files'}/>
                    <StatsText count={record.cnv_num} unit={'CNV Records'}/>
                </Stack>

                <Grid container direction="row" spacing={2} alignItems="center">
                    {record.experimental_strategies.map((experimentalStrategy, index) => (
                        <Grid item key={index}>
                            <ExperimentalStrategyChip experimentalStrategy={experimentalStrategy}/>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{my: 1}}/>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>

                        <Link href={`/view/${record.project_id}`}>
                            <Button
                                size="small"
                                startIcon={<PageviewOutlinedIcon/>}
                                color="primary"
                            >
                                View
                            </Button>
                        </Link>

                        <Tooltip title={"Download"}>
                            <IconButton
                                size="small"
                                color="primary"
                            >
                                <ImDownload/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <ProjectText record={record}/>

                </Stack>
            </Paper>
        </Container>
    </Grid>
}

const MemoDataRecordCard = memo(DataRecordCard);

const DataRecordList = memo(function DataRecordList({data}) {

    const [downloadList, setDownloadList] = useState([]);

    const addDownloadList = (id) => {
        startTransition(() => {
            let newList = new Set([...downloadList, id])
            setDownloadList([...newList])
        })
    }

    const removeDownloadList = (id) => {
        startTransition(() => {
            let newList = downloadList.filter((i) => i !== id)
            setDownloadList(newList)
        })
    }

    return <Container maxWidth={'xl'} sx={{minHeight: '1vh'}}>

        {
            (data.length === 0) ?
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 6,
                    mt: 4,
                    height: '300px'
                }}>
                    <Typography variant="h5">😥 No Dataset Found</Typography>
                </Box>

                :
                <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 4, md: 12}}>
                    {data.map((r) => (
                        <MemoDataRecordCard record={r}
                                            addDownloadList={addDownloadList}
                                            removeDownloadList={removeDownloadList}
                                            key={r.project_id}/>
                    ))}
                </Grid>
        }
    </Container>
})

export default DataRecordList;
