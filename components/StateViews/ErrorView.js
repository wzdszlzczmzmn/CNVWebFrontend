import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const innerSX = {
    width: '100%',
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 1,
    borderColor: "divider"
}

const ErrorView = ({
    errorMessage = '😭 An Error Occurred While Requesting Data',
    sx,
    children
}) => (
    <Box sx={{ ...innerSX, ...sx }}>
        {
            children ? (
                children
            ) : (
                <Typography variant='h4'>{errorMessage}</Typography>
            )
        }
    </Box>
);

export default ErrorView;
