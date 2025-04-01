import { create } from 'zustand'

export const useRecurrentRegionsAreaPlotStore = create((set) => ({
    globalSetting: {
        margin: 30,
    },
    titleSetting: {
        marginTop: 20,
        marginBottom: 20,
        fontSize: 24
    },
    legendSetting: {
        width: 120,
        height: 20,
        itemGap: 5,
        marginTop: 5,
        marginBottom: 5
    },
    chromosomeAxisSetting: {
        height: 20
    }
}))
