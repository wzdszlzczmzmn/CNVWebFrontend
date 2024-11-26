import {startTransition, useState} from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import SortIcon from '@mui/icons-material/Sort';
import Tooltip from "@mui/material/Tooltip";
import {object} from "yup";


const sortMethods = [
    'Sort by Project ID',
    'Sort by Cases',
    'Sort by CNV Files',
    'Sort by CNV Records',
    'Sort by Primary Sites Number',
    'Sort by Disease Types Number',
    'Sort by Experimental Strategies Number'
]


const sortData = (data, method, order) => {
    if (method === 'Sort by Project ID') {
        return (order) ?
            data.sort((a, b) => b.project_id.localeCompare(a.project_id)) :
            data.sort((a, b) => a.project_id.localeCompare(b.project_id))
    } else if(method === 'Sort by Cases') {
        return (order) ?
            data.sort((a, b) => a.case_num - b.case_num) :
            data.sort((a, b) => b.case_num - a.case_num)
    } else if (method === 'Sort by CNV Files') {
        return (order) ?
            data.sort((a, b) => a.cnv_files - b.cnv_files) :
            data.sort((a, b) => b.cnv_files - a.cnv_files)
    } else if (method === 'Sort by CNV Records') {
        return (order) ?
            data.sort((a, b) => a.cnv_num - b.cnv_num) :
            data.sort((a, b) => b.cnv_num - a.cnv_num)
    } else if (method === 'Sort by Primary Sites Number') {
        return (order) ?
            data.sort((a, b) => a.primary_sites.length - b.primary_sites.length) :
            data.sort((a, b) => b.primary_sites.length - a.primary_sites.length)
    } else if (method === 'Sort by Disease Types Number') {
        return (order) ?
            data.sort((a, b) => a.disease_types.length -b.disease_types.length) :
            data.sort((a, b) => b.disease_types.length - a.disease_types.length)
    } else if (method === 'Sort by Experimental Strategies Number') {
        return (order) ?
            data.sort((a, b) => a.experimental_strategies.length - b.experimental_strategies.length) :
            data.sort((a, b) => b.experimental_strategies.length - a.experimental_strategies.length)
    }
}


const SortButton = ({displayData, updateDataFn}) => {

    const [sortMethod, setSortMethod] = useState('Sort by Cases');
    const [anchorEl, setAnchorEl] = useState(null);
    const [order, setOrder] = useState(false);

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOrderClick = () => {
        setOrder(!order)
        startTransition(() => {
            updateDataFn([...displayData.reverse()])
        })
    }

    return (
        <Stack direction="row" alignItems="center" sx={{minWidth: "180px", md: {mb: 2}}}>

            <Button
                size="large"
                startIcon={<SortIcon/>}
                onClick={handleClick}
                color="secondary"
                sx={{textTransform: 'none'}}
            >
                {sortMethod}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                {
                    sortMethods.map((m, i) => (
                        <MenuItem onClick={() => {
                            setAnchorEl(null);
                            setSortMethod(m)
                            startTransition(() => {
                                const sortedData = sortData(displayData, m, order);
                                updateDataFn([...sortedData])
                            })
                        }} key={i}>{m}</MenuItem>
                    ))
                }
            </Menu>

            <Tooltip title={order ? 'Current: Ascending' : 'Current: Descending'}>
                <IconButton
                    size="large"
                    color="secondary"
                    onClick={handleOrderClick}
                >
                    {order ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                </IconButton>
            </Tooltip>
        </Stack>
    )
}

export default SortButton;
