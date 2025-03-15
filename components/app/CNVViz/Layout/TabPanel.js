import Box from '@mui/material/Box'

export const TabPanel = ({ children, value, index, sx }) => (
    <Box
        role="tabpanel"
        style={{
            display: value === index ? "block" : "none",
            flexGrow: 2,
        }}
        sx={{ ...sx }}
    >
        {value === index && (
            <Box sx={{ height: '100%' }}>
                {children}
            </Box>
        )}
    </Box>
)
