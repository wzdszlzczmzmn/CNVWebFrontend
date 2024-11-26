import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { TabPanel } from './TabPanel'
import Typography from "@mui/material/Typography"

import HeatMapPanel from './Layout/HeatMapPanel'
import useSWR from "swr";

import { getProjectCNVTypeInfoURL, fetcher } from '/data/get'
import CircularProgress from "@mui/material/CircularProgress";

const CNVHeatMaps = ({ projectId }) => {
    const [value, setValue] = useState(0);

    const handleChange = (e, v) => setValue(v);

    const {
        data: cnvTypes,
        error: cnvTypesError,
        isLoading: isLoading
    } = useSWR(`${getProjectCNVTypeInfoURL}?projectId=${projectId}`, fetcher)

    if (cnvTypesError) {
        return (
            <Box sx={{
                width: '100%',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant='h4'>😭 Fail To Load Data</Typography>
            </Box>
        )
    }

    if (isLoading) {
        return (
            <Box sx={{
                width: '100%',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress size={60}/>
                <Typography
                    variant='h5'
                    sx={{ ml: 3 }}>
                    Loading ProjectMeta..., please wait for a moment.</Typography>
            </Box>
        )
    }

    return (
        <>
            <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h5" sx={{ ml: 3, mb: 2 }}>CNV HeatMap</Typography>
                <Box sx={{ border: 1, borderColor: 'divider' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            {
                                cnvTypes
                                .filter(cnvType => cnvType !== 'Gene Level Copy Number')
                                .map((cnvType, index) => (
                                    <Tab label={cnvType} key={index} sx={{ textTransform: 'none' }}/>
                                ))
                            }
                            <Tab label="Gene Level Copy Number" sx={{ textTransform: 'none' }}/>
                        </Tabs>
                    </Box>
                    {
                        cnvTypes
                        .map((cnvType, index) => (
                            <TabPanel value={value} index={index} key={index} sx={{ height: '85vh' }}>
                                <HeatMapPanel projectId={projectId} cnvType={cnvType}/>
                            </TabPanel>
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}

export default CNVHeatMaps
