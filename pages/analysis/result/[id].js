import {useRouter} from "next/router";
import LoadingView from "../../../components/StateViews/LoadingView";

const AnalysisResultPage = ({  }) => {
    const router = useRouter()
    const { id } = router.query

    if (!id) {
        return <LoadingView sx={{ height: '60vh' }}/>
    }

    return <div>ID from router: {id}</div>;
}

export default AnalysisResultPage