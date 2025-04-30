import { Empty, Typography } from "antd"

export const EmptyState = ({ description }) => (
    <Empty
        description={
            <Typography.Text>
                {description}
            </Typography.Text>
        }
    />
)
