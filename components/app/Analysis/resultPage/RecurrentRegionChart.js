import React, {Fragment, useEffect, useRef, useState} from "react"
import {Button, message} from "antd"
import axios from "axios"
import {getGISTICRecurrentRegionsURL, getRecurrentRegionsAreaPlotRenderURL} from "../../../../data/get"
import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from "../../CNVViz/Layout/HeatMapLeftPanel"
import {List} from "@mui/material"
import {DisplaySettingPanel} from "../../CNVViz/RecurrentRegions/RecurrentRegionsVizConfigComponents"
import HeatMapMainPanel from "../../CNVViz/Layout/HeatMapMainPanel"
import LoadingView from "../../../StateViews/LoadingView"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import MemoRecurrentRegionsAreaPlot from "../../../Viz/RecurrentRegionsAreaPlot/RecurrentRegionsAreaPlot"
import {ListCollapsePanel} from "../../../Layout/ListCollapsePanel"
import {PieChart} from "@mui/icons-material"
import {SettingSelector} from "../../CNVViz/SettingConfigComponents/SettingSelector"
import {SettingInput} from "../../CNVViz/SettingConfigComponents/SettingInput"
import Divider from "@mui/material/Divider"

const RecurrentRegionChart = ({ id }) => {

    return (
        <Stack spacing={2}>
            <Typography variant="h4" gutterBottom align="center">
                Recurrent Region Chart
            </Typography>
            <Box sx={{ border: '1px, solid, rgba(0, 0, 0, 0.12)' }}>
                <RecurrentRegionsContent taskId={id}/>
            </Box>
        </Stack>
    )
}

const RecurrentRegionsContent = ({ taskId }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [renderData, setRenderData] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()
    const dataSettingManager = useDataSetting()

    const containerRef = useRef(null)

    const svgWidth = sideBarOpen ? dimensions.width - 285 : dimensions.width

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const renderRecurrentRegionsAreaPlot = () => {
        setProcessing(true)
        axios.get(getGISTICRecurrentRegionsURL, {
            params: {
                projectId: taskId
            }
        }).then(response => {
            if (response.data) {
                console.log(response.data.scoresGISTIC)
                setRenderData({
                    ampRegions: response.data.ampRegions,
                    delRegions: response.data.delRegions,
                    scoresGISTIC: parseScoresGISTIC(response.data.scoresGISTIC)
                })
            } else {
                setRenderData([])
            }
        }).catch(error => {
            setRenderData(null)
            messageApi.error(error.response.data.errorMessage)
        }).finally(() => {
            setProcessing(false)
        })
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                })
            }
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <>
            <Stack ref={containerRef}  direction='row' sx={{ height: '80vh' }}>
                {
                    sideBarOpen ? (
                        <HeatMapLeftPanel sx={{ px: 1, minWidth: '285px' }}>
                            <List>
                                <DataSettingPanel
                                    dataSettingManager={dataSettingManager}
                                    renderRecurrentRegionsAreaPlot={renderRecurrentRegionsAreaPlot}
                                />
                                <DisplaySettingPanel/>
                            </List>
                        </HeatMapLeftPanel>
                    ) : (
                        <></>
                    )
                }
                <HeatMapMainPanel
                    sideBarOpen={sideBarOpen}
                    handleSideBarChange={handleSideBarChange}
                >
                    {
                        processing ? (
                            <LoadingView
                                sx={{ height: '100%', border: 0 }}
                                loadingPrompt="Processing Data..., please wait for a moment."
                            />
                        ) : !renderData ? (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: '20px'
                            }}>
                                <Typography variant='h4'>
                                    Adjust the data settings, then click ‘Render’ to generate the visualization.
                                </Typography>
                            </Box>
                        ) : renderData === [] ? (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: '20px'
                            }}>
                                <Typography variant='h4'>
                                    GISTIC analysis cannot be performed because only one CNV sample meets the criteria
                                    for project {taskId}, disease type {dataSettingManager.dataSetting.diseaseType},
                                    and primary site {dataSettingManager.dataSetting.primarySite}.
                                </Typography>
                            </Box>
                        ) : (
                            <MemoRecurrentRegionsAreaPlot
                                width={svgWidth}
                                height={dimensions.height}
                                ampRegions={renderData?.ampRegions}
                                delRegions={renderData?.delRegions}
                                scoresGISTIC={renderData?.scoresGISTIC}
                                yAxisValueType={dataSettingManager.dataSetting.yAxisValueType}
                            />
                        )
                    }
                </HeatMapMainPanel>
            </Stack>
            {contextHolder}
        </>
    )
}

export const useDataSetting = () => {
    const [dataSetting, setDataSetting] = useState({
        yAxisValueType: 'G-score'
    })

    const handleYAxisValueTypeChange = (newYAxisValueType) => {
        setDataSetting((prev) => ({
            ...prev,
            yAxisValueType: newYAxisValueType,
        }))
    }

    return {
        dataSetting,
        handleYAxisValueTypeChange
    }
}

const DataSettingPanel = ({
                              dataSettingManager,
                              renderRecurrentRegionsAreaPlot
                          }) => {
    const settingItems = [
        {
            key: "yAxisValueType",
            value: dataSettingManager.dataSetting.yAxisValueType,
            setValue: dataSettingManager.handleYAxisValueTypeChange,
            title: 'YAxis Value Type:',
            valueList: ['G-score', 'q-value'],
            inputComponentType: "Selector"
        }
    ]

    return (
        <ListCollapsePanel
            defaultOpenState={true}
            icon={<PieChart/>}
            title={'Data Setting'}
            showDivider={true}
        >
            <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
                {
                    settingItems.map((setting, index) => (
                        <Fragment key={setting.key}>
                            {
                                setting.inputComponentType === 'Selector' ? (
                                    <SettingSelector
                                        value={setting.value}
                                        setValue={setting.setValue}
                                        title={setting.title}
                                        valueList={setting.valueList}
                                    />
                                ) : (
                                    <SettingInput
                                        value={setting.value}
                                        handleValueChange={setting.setValue}
                                        valueName={setting.name}
                                        id={setting.id}
                                        type={setting.type}
                                        title={setting.title}
                                        step={1}
                                    />
                                )
                            }

                            {index < settingItems.length - 1 && <Divider/>}
                        </Fragment>
                    ))
                }
            </Stack>
            <Stack spacing={1} sx={{ mt: 2, mb: 2, px: '6px' }}>
                <Button
                    style={{
                        backgroundColor: '#41B3A2',
                        color: '#FFFFFF',
                        borderColor: '#41B3A2'
                    }}
                    onClick={renderRecurrentRegionsAreaPlot}
                >
                    Render
                </Button>
            </Stack>
        </ListCollapsePanel>
    )
}

const parseScoresGISTIC = (scoresGISTIC) => {
    return scoresGISTIC.map(scoreGISTIC => ({
        'type': scoreGISTIC["Type"],
        'chromosome': 'chr' + scoreGISTIC["Chromosome"].trim(),
        'start': +scoreGISTIC["Start"],
        'end': +scoreGISTIC["End"],
        'q-value': +scoreGISTIC["-log10(q-value)"],
        'G-score': +scoreGISTIC["G-score"],
        'average amplitude': +scoreGISTIC["average amplitude"],
        'frequency': +scoreGISTIC["frequency"]
    }))
}


export default RecurrentRegionChart