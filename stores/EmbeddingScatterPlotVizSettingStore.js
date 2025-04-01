import { create } from 'zustand'

export const useEmbeddingScatterPlotVizSettingStore = create((set) => ({
    globalSetting: {
        margin: 30,
        axisWidth: 50
    },
    titleSetting: {
        marginTop: 20,
        marginBottom: 20,
        fontSize: 24
    },
    legendSetting: {
        width: 120,
        height: 20,
        itemVerticalGap: 5,
        itemHorizontalGap: 5,
        marginLeft: 30
    },
    scatterSetting: {
        radius: 4
    }
}))
