import useSWR from "swr";
import {fetcher, getOneRecordURL} from "data/get";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link"
import Chip from "@mui/material/Chip";
import {InfoRow, TitleCol} from "./utils";
import IconButton from "@mui/material/IconButton";
import {ImDownload} from "react-icons/im";
import {DiseaseTypeChipWithTooltip, PrimarySiteChipWithTooltip, ExperimentalStrategyChip} from './Cards'
import Grid from "@mui/material/Grid"
import LinkIcon from '@mui/icons-material/Link'

const RecordDetailsTable = ({dataID}) => {

    const {data, error} = useSWR(`${getOneRecordURL}/${dataID}`, fetcher);

    if (data === undefined) {
        return <></>
    } else {
        return (
            <TableContainer component={Paper} sx={{boxShadow: 0, width: "100%"}}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TitleCol>Project ID</TitleCol>
                            <TableCell>
                                <Link href={'https://portal.gdc.cancer.gov/projects/' + data.project_id}
                                      target="_blank" rel="noreferrer"
                                      sx={{
                                          '&:hover': {
                                              color: "primary.main"
                                          },
                                          textDecoration: "none",
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5
                                      }}>
                                    <Typography variant={"body2"}>
                                        {data.project_id}
                                    </Typography>
                                    <LinkIcon fontSize="small" />
                                </Link>
                            </TableCell>
                        </TableRow>
                        <InfoRow title='Program' info={data.program}/>
                        <InfoRow title='Project Name' info={data.project_name}/>
                        <InfoRow title='Case Number' info={data.case_num}/>
                        <TableRow>
                            <TitleCol>Primary Sites</TitleCol>
                            <TableCell>
                                <PrimarySiteChipWithTooltip primarySites={data.primary_sites} tooltipPlacement={'bottom'}/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TitleCol>Disease Types</TitleCol>
                            <TableCell>
                                <DiseaseTypeChipWithTooltip diseaseTypes={data.disease_types} tooltipPlacement={'bottom'}/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TitleCol>Experimental Strategy</TitleCol>
                            <TableCell>
                                <Grid container direction="row" spacing={2} alignItems="center">
                                    {data.experimental_strategies.map((experimentalStrategy, index) => (
                                        <Grid item key={index}>
                                            <ExperimentalStrategyChip experimentalStrategy={experimentalStrategy}/>
                                        </Grid>
                                    ))}
                                </Grid>
                            </TableCell>
                        </TableRow>
                        <InfoRow title='Allele-Specific CNV File Number' info={data.allele_specific_cnv_file_num}/>
                        <InfoRow title='Copy Number Segment File Number' info={data.copy_number_segment_file_num}/>
                        <InfoRow title='Gene Level CNV File Number' info={data.gene_level_copy_number_file_num}/>
                        <InfoRow title='Masked CNV File Number' info={data.masked_copy_number_segment_file_num}/>
                        <InfoRow title='Sample Number' info={data.sample_num}/>
                        <InfoRow title='Portion Number' info={data.portion_num}/>
                        <InfoRow title='Analyte Number' info={data.analyte_num}/>
                        <InfoRow title='Aliquot Number' info={data.aliquot_num}/>
                        <InfoRow title='Slide Number' info={data.slide_num}/>
                        <TableRow>
                            <TitleCol>Download</TitleCol>
                            <TableCell>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    href={`https://api.aquila.cheunglab.org/static/${data.project_id}.zip`}
                                >
                                    <ImDownload/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }
}

export default RecordDetailsTable;
