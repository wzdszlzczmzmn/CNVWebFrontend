import Stack from "@mui/material/Stack";
import TaskDescription from "./TaskDescription";
import RecurrentRegionChart from "./RecurrentRegionChart";
import RecurrentEventsChart from "./RecurrentEventsChart";

const ResultContent = ({id}) => {

    return (
        <Stack spacing={6}>
            <TaskDescription id={id}/>
            <RecurrentRegionChart id={id}/>
            <RecurrentEventsChart id={id}/>
        </Stack>
    )
}

export default ResultContent