import { useRouter } from 'next/router'
import Head from "next/head"
import { Container } from "@mui/material"
import CaseSummary from "../../components/app/Cases/Summary/CaseSummary"
import useSWR from "swr"
import { fetcher, getCaseSummaryDetailURL } from "../../data/get"
import LoadingView from "../../components/StateViews/LoadingView"
import ErrorView from "../../components/StateViews/ErrorView"
import Stack from "@mui/material/Stack"
import CaseClinicalWrapper from "../../components/app/Cases/Clinical/CaseClinicalWrapper"
import CaseBiospecimenWrapper from "../../components/app/Cases/Biospecimen/CaseBiospecimenWrapper"
import CaseCNVFileWrapper from "../../components/app/Cases/CNVFile/CaseCNVFileWrapper"

const CaseDetail = () => {
    const router = useRouter()

    const {
        data,
        isLoading,
        error
    } = useSWR(
        router.query.id ? `${getCaseSummaryDetailURL}?caseId=${router.query.id}` : null,
        fetcher
    )

    if (isLoading || !router.isReady) {
        return <LoadingView/>
    }

    if (error) {
        return <ErrorView/>
    }

    console.log(data)

    return (
        <>
            <Head>
                <title>Case Detail</title>
            </Head>
            <Container maxWidth={'xl'} sx={{ mb: 4 }}>
                <Stack spacing={2}>
                    <CaseSummary data={data}/>
                    <CaseClinicalWrapper data={data}/>
                    <CaseBiospecimenWrapper data={data} />
                    <CaseCNVFileWrapper data={data}/>
                </Stack>
            </Container>
        </>
    )
}

export default CaseDetail
