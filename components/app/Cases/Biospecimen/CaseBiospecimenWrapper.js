import Box from "@mui/material/Box"
import { MainTitle } from "../Shared/Titles"
import CaseBiospecimen from "./CaseBiospecimen"

const CaseBiospecimenWrapper = ({ data }) => (
    <Box>
        <MainTitle>
            BIOSPECIMEN
        </MainTitle>
        <CaseBiospecimen data={data}/>
    </Box>
)

export default CaseBiospecimenWrapper
