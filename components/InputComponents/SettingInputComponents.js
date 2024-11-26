import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import React, {useState} from "react";
import TextField from "@mui/material/TextField";

export const DataSelector = ({value, setValue, title, valueList}) => {
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

export const SettingInput = ({value, handleValueChange, valueName, id, type, title}) => (
    <Box>
        <Typography sx={{fontWeight: 500, mb: 1}}>{title}</Typography>
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
                step: 0.1,
            }}
        />
    </Box>
)

