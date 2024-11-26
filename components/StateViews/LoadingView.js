import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const innerSX = {
    width: '100%',
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 1,
    borderColor: "divider"
}

const innerCircularProgressSX = {
    mb: 4
}

const LoadingView = ({
    loadingPrompt = 'Loading..., please wait for a moment.',
    circularProgressSize = 80,
    sx,
    circularProgressSX,
    children
}) => (
    <Stack sx={{ ...innerSX, ...sx }}>
        {
            children ? (
                children
            ) : (
                <>
                    <CircularProgress
                        size={circularProgressSize}
                        sx={{ ...innerCircularProgressSX, ...circularProgressSX }}
                    />
                    <Typography variant='h4'>{loadingPrompt}</Typography>
                </>
            )
        }
    </Stack>
);

export default LoadingView;
