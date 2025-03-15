import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import MuiNextLink from "components/Link";
import Navbar from "components/Navbar";
import SideDrawer from "components/SideDrawer";
import HideOnScroll from "components/HideOnScroll";
import Image from "next/image";

export const navLinks = [
    { title: "Home", path: "/" },
    { title: "Dataset", path: "/view" },
    { title: "Publication", path: "/" },
    { title: "Analysis", path: "/" },
    { title: "Tutorial", path: "/" },
    { title: "About", path: "/" },
]

const Header = () => {
    return (
        <>
            <>
                <AppBar position="fixed" elevation={0}
                        sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            // backgroundBlendMode: "blur",
                            borderBottomStyle: "solid",
                            borderBottomWidth: "1px",
                            backdropFilter: "blur(8px)",
                            borderBottomColor: "#d3d3d3"
                        }}>
                    <Toolbar>
                        <Container
                            maxWidth={'xl'}
                            sx={{ display: `flex`, justifyContent: `space-between` }}
                        >
                            {/*<IconButton edge="start" aria-label="home">*/}
                            <MuiNextLink activeClassName="active" href="/" sx={{ mt: 1 }}>
                                <Image src="/AQUILA-LOGO.svg" width="113" height="45" aria-label="Home" alt="Logo"/>
                            </MuiNextLink>

                            {/*</IconButton>*/}
                            <Navbar navLinks={navLinks}/>
                            <SideDrawer navLinks={navLinks}/>
                        </Container>
                    </Toolbar>
                </AppBar>
            </>
        </>
    );
};

export default Header;
