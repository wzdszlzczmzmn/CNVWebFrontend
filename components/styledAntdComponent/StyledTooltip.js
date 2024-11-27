import { Tooltip } from 'antd'

export const StyledTooltipFontSize12 = ({ children, ...props }) => (
    <Tooltip
        overlayStyle={{
            fontSize: '12px'
        }}
        {...props}
    >
        {children}
    </Tooltip>
)
