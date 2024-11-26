import {fetcher, getRecordsURL} from "data/get";
import {Container} from "@mui/material";
import Head from 'next/head';
import RecordsPanel from "../../components/Intro/RecordsPanel";
import Typography from "@mui/material/Typography";

const ViewPage = ({ recordData }) => {

    return (
        <>
            <Head>
                <title>Aquila | Browse</title>
            </Head>
                <Container maxWidth={"xl"} sx={{my: 4, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h3" sx={{ mx: 2 }} fontFamily='Plus Jakarta Sans'>Datasets</Typography>
                </Container>
                <RecordsPanel data={recordData}/>
        </>

    )
}

export async function getStaticProps() {
    const data = await fetcher(getRecordsURL);

    return {
        props: {
            recordData: data.sort((a, b) => parseInt(b.case_num) - parseInt(a.case_num))
        }
    }
}

export default ViewPage;
