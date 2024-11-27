import Stack from "@mui/material/Stack";

const innerSX = {
    px: 3,
    pb: 3,
    borderRight: 1,
    borderColor: 'divider',
    width: '350px',
    maxHeight: '100%',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
}

const HeatMapLeftPanel = ({sx, children}) => (
    <Stack sx={{...innerSX, ...sx}}>
        {children}
    </Stack>
)

export default HeatMapLeftPanel
