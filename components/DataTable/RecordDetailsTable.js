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
import Grid from "@mui/material/Grid";

const LinkPool = {
    MIBI: "https://www.ionpath.com/",
    IMC: "https://www.fluidigm.com/applications/imaging-mass-cytometry",
    CODEX: "https://www.akoyabio.com/codex/",
    CyCIF: "https://www.cycif.org/",

    Visium: "https://www.10xgenomics.com/products/spatial-gene-expression",
    seqFISH: "https://www.seqfish.com/",
    osmFISH: "https://linnarssonlab.org/osmFISH/",
    MERFISH: "http://zhuang.harvard.edu/merfish.html",
    'seq-scope': "https://lee.lab.medicine.umich.edu/seq-scope",
    STARmap: "https://www.starmapresources.org/",
    'sci-Space': "https://www.science.org/doi/10.1126/science.abb9536",
    'DBiT-seq': "https://www.sciencedirect.com/science/article/pii/S2666166721002392",
    'pciSeq': "https://www.nature.com/articles/s41592-019-0631-4",
    'Steoro-seq': "https://www.sciencedirect.com/science/article/pii/S0092867422003993",
};

const TechChip = ({name}) => {
    return (
        <a href={LinkPool[name]} target="_blank" rel="noreferrer noopener" style={{textDecoration: "none"}}>
            <Chip
                variant="outlined"
                label={name}
                color="primary"
                size="small"
                sx={{
                    cursor: "pointer",
                }}
            />
        </a>
    )
}


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
                                          color: "text.primary",
                                          '&:hover': {
                                              color: "primary.main"
                                          },
                                          textDecoration: "none"
                                      }}>
                                    <Typography variant={"body2"}>
                                        {data.project_id}🔗
                                    </Typography>
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
                        <InfoRow title='Allele-Specific CNV Record Number' info={data.allele_specific_cnv_record_num}/>
                        <InfoRow title='Copy Number Segment File Number' info={data.copy_number_segment_file_num}/>
                        <InfoRow title='Copy Number Segment Record Number' info={data.copy_number_segment_record_num}/>
                        <InfoRow title='Gene Level CNV File Number' info={data.gene_level_copy_number_file_num}/>
                        <InfoRow title='Gene Level CNV Record Number' info={data.gene_level_copy_number_record_num}/>
                        <InfoRow title='Masked CNV File Number' info={data.masked_copy_number_segment_file_num}/>
                        <InfoRow title='Masked CNV Record Number' info={data.masked_copy_number_segment_record_num}/>
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
