import Box from "@mui/material/Box"
import { Container } from "@mui/material"
import AnalysisContainer from "../../components/app/Analysis/AnalysisContainer"

const Analysis = ({  }) => {
    return (
        <Container maxWidth="xl" sx={{ py: '16px' }}>
            <Box>
                <AnalysisContainer/>
            </Box>
        </Container>
    )
}

export default Analysis
