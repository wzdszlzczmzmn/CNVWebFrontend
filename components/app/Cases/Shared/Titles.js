import { H6 } from "../../../styledComponents/styledHTMLTags"

export const MainTitle = ({ sx, children }) => (
    <H6 sx={{ fontSize: 32, fontWeight: 600, marginTop: '16px', marginBottom: '8px', ...sx }}>
        {children}
    </H6>
)

export const SubTitle = ({ sx, children }) => (
    <H6 sx={{ fontSize: 24, fontWeight: 500, marginTop: '0px', marginBottom: '12px', ...sx }}>
        {children}
    </H6>
)
