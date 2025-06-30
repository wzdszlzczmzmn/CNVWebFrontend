import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {InformationDescriptions} from "../AnalysisTaskQuery";
import useSWR from "swr";
import {fetcher, getGISTICTaskURL} from "../../../../data/get";
import ErrorView from "../../../StateViews/ErrorView";
import LoadingView from "../../../StateViews/LoadingView";

const TaskDescription = ({id}) => {
    const {
        data: taskInformation,
        isLoading,
        error
    } = useSWR(`${getGISTICTaskURL}?taskUUID=${id}`, fetcher)

    if (isLoading) {
        return <LoadingView/>
    }

    if (error) {
        return <ErrorView/>
    }

    return (
        <Stack spacing={2}>
            <Typography variant="h4" gutterBottom align="center">
                Task Detail
            </Typography>
            <InformationDescriptions taskInformation={taskInformation}/>
        </Stack>
    )
}

export default TaskDescription