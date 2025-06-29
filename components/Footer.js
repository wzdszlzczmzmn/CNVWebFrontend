import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Email from "@mui/icons-material/Email";
import Science from "@mui/icons-material/Science";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { Tooltip } from "@mui/material";


const Footer = () => {

    const IconButtonStyle = {
        borderRadius: "50%",
        color: "white",
    }

    return <Box component="footer" sx={{
        py: 3,
        textAlign: "center",
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        backdropFilter: "blur(8px)",
        borderTopColor: "#d3d3d3"
    }}>
        <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            sx={{ my: 2 }}
        >
            <Tooltip title="Email us">
                <IconButton
                    sx={{
                        bgcolor: "#0D5661",
                        '&:hover': { bgcolor: "#0089A7" },
                        ...IconButtonStyle
                    }}
                >
                    <Email/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Lab page">
                <IconButton
                    sx={{
                        bgcolor: "#CC543A",
                        '&:hover': { bgcolor: "#ED784A" },
                        ...IconButtonStyle
                    }}>
                    <Science/>
                </IconButton>
            </Tooltip>
        </Stack>

        <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <Grid item>
                <Typography align="right" color={"black"} fontFamily={"Outfit"}>
                    ©{new Date().getFullYear()}
                    {' '}Fengs Lab, Northwestern Polytechnical University
                </Typography>
            </Grid>
        </Grid>
    </Box>;
};

export default Footer;
