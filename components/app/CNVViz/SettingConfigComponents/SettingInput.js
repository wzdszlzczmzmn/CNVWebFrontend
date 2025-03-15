import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import React from "react"

export const SettingInput = ({ value, handleValueChange, valueName, id, type, title, step = 0.1 }) => (
    <Box>
        <Typography sx={{ fontWeight: 500, mb: 1 }}>{title}</Typography>
        <TextField
            id={id}
            name={valueName}
            type={type}
            size="small"
            value={value}
            onChange={handleValueChange}
            slotProps={{
                inputLabel: {
                    shrink: true,
                },
            }}
            inputProps={{
                step: step,
            }}
            fullWidth
        />
    </Box>
)
