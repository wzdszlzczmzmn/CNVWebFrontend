import { Splitter } from "antd"
import Box from "@mui/material/Box"

const SplitterLayout = ({
    leftPanel,
    rightPanel,
    leftPanelDefaultSize = '30%',
    leftPanelMin = '20%',
    leftPanelMax = '50%'
}) => {
    return (
        <Splitter>
            <Splitter.Panel defaultSize={leftPanelDefaultSize} min={leftPanelMin} max={leftPanelMax}>
                <Box sx={{ px: '16px', py: '12px' }}>
                    {leftPanel}
                </Box>
            </Splitter.Panel>
            <Splitter.Panel>
                <Box sx={{ px: '16px', py: '12px' }}>
                    {rightPanel}
                </Box>
            </Splitter.Panel>
        </Splitter>
    )
}

export default SplitterLayout
