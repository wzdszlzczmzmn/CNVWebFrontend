import Stack from "@mui/material/Stack";
import {List, ListItem} from "@mui/material";
import Box from "@mui/material/Box";
import {useState} from "react";
import Button from "@mui/material/Button";

export const TestPanel = () => {
    const [open, setOpen] = useState(true)

    const handlerChange = () => {
        setOpen(!open)
    }

    return (
        <Stack direction="row">
            {open ? <Stack sx={{
                px: 3,
                pb: 3,
                borderRight: 1,
                borderColor: 'divider',
                minWidth: "280px",
                minHeight: '100%'
            }}>
                <List>
                    <ListItem>
                        Test1
                    </ListItem>
                    <ListItem>
                        Test2
                    </ListItem>
                </List>
            </Stack>
            :
            <></>}

            <Box>
                Main Field.
                <Button onClick={handlerChange}>Change SideBar.</Button>
            </Box>
        </Stack>
    )
}
