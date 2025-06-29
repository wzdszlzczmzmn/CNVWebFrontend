import { Container } from "@mui/material";
import Introduction from "../components/app/Home/Introduction"
import Features from "../components/app/Home/Features"
import { Hr } from "../components/styledComponents/styledHTMLTags"
import Stack from "@mui/material/Stack"
import Statistic from "../components/app/Home/Statistic"

const Home = () => {
    return (
        <Container component="section" maxWidth="xl">
            <Stack>
                <Introduction/>
                <Hr/>
                <Features/>
                <Statistic/>
            </Stack>
        </Container>
    )
}

export default Home;
