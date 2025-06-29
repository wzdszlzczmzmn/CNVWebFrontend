import { Container } from "@mui/material"
import Box from "@mui/material/Box"
import WorkspaceContent from "../../components/app/workspace/WorkspaceContent"

const Workspace = ({}) => {
    return (
        <Container maxWidth="xl" sx={{ py: '16px' }}>
            <Box>
                <WorkspaceContent/>
            </Box>
        </Container>
    )
}

export default Workspace
