import {useRouter} from "next/router";
import LoadingView from "../../../components/StateViews/LoadingView";
import {Container} from "@mui/material";
import ResultContent from "../../../components/app/Analysis/resultPage/ResultContent";

const AnalysisResultPage = ({  }) => {
    const router = useRouter()
    const { id } = router.query

    if (!id) {
        return <LoadingView sx={{ height: '60vh' }}/>
    }

    return (
        <Container maxWidth="xl" sx={{ py: '16px' }}>
            <ResultContent id={id}/>
        </Container>
    )
}

export default AnalysisResultPage