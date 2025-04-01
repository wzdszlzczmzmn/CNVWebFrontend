import { memo } from "react"
import { useRecurrentRegionsAreaPlotStore } from "../../../stores/RecurrentRegionsAreaPlotStore"
import { initFigureConfig, preprocessData } from "./preprocess"

const RecurrentRegionsAreaPlot = ({
    width,
    height,
    ampRegions,
    delRegions,
    scoresGISTIC,
    yAxisValueType
}) => {
    const globalSetting = useRecurrentRegionsAreaPlotStore((state) => state.globalSetting)
    const titleSetting = useRecurrentRegionsAreaPlotStore((state) => state.titleSetting)
    const legendSetting = useRecurrentRegionsAreaPlotStore((state) => state.legendSetting)
    const chromosomeAxisSetting = useRecurrentRegionsAreaPlotStore((state) => state.chromosomeAxisSetting)

    preprocessData(ampRegions, delRegions, scoresGISTIC, yAxisValueType)

    const result = initFigureConfig(width, height, globalSetting, legendSetting, titleSetting, chromosomeAxisSetting)


    return (
        <svg width={width} height={height}>
            <rect width={width} height={height} fill='blue'></rect>
        </svg>
    )
}

const MemoRecurrentRegionsAreaPlot = memo(RecurrentRegionsAreaPlot)

export default MemoRecurrentRegionsAreaPlot
