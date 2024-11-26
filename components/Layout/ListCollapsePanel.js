import {Collapse, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {KeyboardArrowDown, KeyboardArrowRight} from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import React, {useState} from "react";

export const ListCollapsePanel = ({defaultOpenState, icon, title, showDivider, children}) => {
    const [open, setOpen] = useState(defaultOpenState)

    const handleOpenChange = () => {
        setOpen(!open)
    }

    return (
        <>
            <ListItemButton onClick={handleOpenChange}>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={title}/>
                {open ? <KeyboardArrowDown/> : <KeyboardArrowRight/>}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {showDivider ? <Divider/> : <></>}
                {children}
            </Collapse>
        </>
    )
}
