import AnalysisTaskQuery from "../Analysis/AnalysisTaskQuery"
import { Card, Typography } from "antd"
import Stack from "@mui/material/Stack"

const { Title, Paragraph } = Typography

const WorkspaceContent = ({}) => {

    return (
        <Stack alignItems="center">
            <AnalysisTaskQuery/>
        </Stack>
    )
}

export default WorkspaceContent
