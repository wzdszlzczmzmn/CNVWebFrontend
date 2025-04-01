import Box from "@mui/material/Box";
import {MenuOpen} from "@mui/icons-material";
import {Tooltip} from "@mui/material";

const defaultSX = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'hidden',
}

const HeatMapMainPanel = ({sx, children, handleSideBarChange, sideBarOpen}) => {
    const toolTipTitle = sideBarOpen ? 'Close Menu' : 'Open Menu'

    return (
        <Box sx={{...defaultSX, ...sx}}>
            <Box sx={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '30px',
                height: '30px',
                zIndex: 2,
                backgroundColor: 'rgba(28, 149, 233, 0.16)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} onClick={handleSideBarChange}>
                <Tooltip title={toolTipTitle}>
                    <MenuOpen sx={{color: '#00b5f2'}}/>
                </Tooltip>
            </Box>
            {children}
        </Box>
    )
}

export default HeatMapMainPanel
