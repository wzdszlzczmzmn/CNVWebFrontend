import { Typography } from "antd"
import { ExportOutlined } from "@ant-design/icons"
import Stack from "@mui/material/Stack"

export const DescriptionLabel = ({ text }) => (
    <Typography.Text strong>
        {text}
    </Typography.Text>
)

export const TextWithLinkIcon = ({ text, href }) => (
    <Stack direction="row" spacing={1}>
        <ExportOutlined />
        <Typography.Link href={href} target='_blank'>
            {text}
        </Typography.Link>
    </Stack>
)

export const formatDays = (days) => {
    if (days === 0) {
        return "0 days"
    }

    const isPast = days < 0
    const absDays = Math.abs(days)

    const years = Math.floor(absDays / 365)
    const remainingDays = absDays % 365

    let parts = []
    if (years > 0) {
        parts.push(`${years} year${years > 1 ? 's' : ''}`)
    }
    if (remainingDays > 0) {
        parts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`)
    }

    const result = parts.join(' ')

    return isPast ? `${result} ago` : result
}
