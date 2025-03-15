import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { Radio } from "antd"
import React from "react"

export const SettingRadio = ({
    value,
    name,
    options,
    title,
    handleValueChange
}) => (
    <Box>
        <Typography sx={{fontWeight: 500, mb: 1}}>{title}</Typography>
        <Radio.Group
            block
            options={options}
            value={value}
            name={name}
            onChange={handleValueChange}
            optionType="button"
            buttonStyle="solid"
        />
    </Box>
)
