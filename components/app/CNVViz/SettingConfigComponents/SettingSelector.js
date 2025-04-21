import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import React from "react"

// This component provides a build-in handler for value changes.
// Just pass a function to update the state.
export const SettingSelector = ({value, setValue, title, valueList}) => {
    const handleValueChange = (event) => {
        setValue(event.target.value)
    }

    return (
        <Box sx={{width: '100%'}}>
            <Typography sx={{fontWeight: '500', mb: 1}}>{title}</Typography>
            <FormControl size='small' fullWidth>
                <Select
                    value={value}
                    onChange={handleValueChange}
                >
                    {
                        valueList.map((item, index) => (
                            <MenuItem value={item} key={index}>{item}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </Box>
    )
}

// This component does not provide a built-in handler for value changes.
// Please pass a handler that processes the event and updates state.
export const SettingSelectorRaw = ({value, name, setValue, title, valueList}) => (
    <Box sx={{width: '100%'}}>
        <Typography sx={{fontWeight: '500', mb: 1}}>{title}</Typography>
        <FormControl size='small' fullWidth>
            <Select
                value={value}
                name={name}
                onChange={setValue}
            >
                {
                    valueList.map((item, index) => (
                        <MenuItem value={item} key={index}>{item}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    </Box>
)
