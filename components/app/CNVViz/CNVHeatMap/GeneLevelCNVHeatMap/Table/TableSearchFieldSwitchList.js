import { Flex, Switch } from "antd"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import React from "react"

const TableSearchFieldSwitchList = ({ fields, handleSwitchChange }) => {
    return (
        <Flex
            vertical
            gap={1}
        >
            <Box sx={{ margin: '4px 4px 0px 4px' }}>
                <Typography sx={{ fontWeight: 500 }}>Search Fields:</Typography>
            </Box>
            <Divider sx={{ margin: '4px' }}/>
            {
                fields.map(
                    field => (
                        <Flex
                            key={field.value}
                            justify="space-between"
                            align="center"
                            gap={24}
                            style={{
                                padding: '2px 6px'
                            }}
                        >
                            <Typography sx={{ fontSize: '14px' }}>{field.text}</Typography>
                            <Switch
                                size="small"
                                checked={field.checked}
                                onChange={() => handleSwitchChange(field.value)}
                            />
                        </Flex>
                    )
                )
            }
        </Flex>
    )
}

export default TableSearchFieldSwitchList
