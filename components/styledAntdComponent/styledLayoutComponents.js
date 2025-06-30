import { Layout, Menu } from "antd"
import { styled } from "@mui/material/styles"

export const CustomHeader = styled(Layout.Header)({
    backgroundColor: '#FFFFFFE6',
    borderBottom: '0.8px solid #D3D3D3',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    height: '64px'
})

export const CustomContent = styled(Layout.Content)`
    background-color: rgba(255, 255, 255, 0.90);
    min-height: calc(100vh - 148px);
`

export const CustomFooter = styled(Layout.Footer)({
    backgroundColor: '#FFFFFFE6',
})

export const CustomHeaderMenu = styled(Menu)({
    borderBottom: '0.8px solid #D3D3D3',
    justifyContent: 'end',
    fontWeight: '500',
    fontSize: '16px'
})
