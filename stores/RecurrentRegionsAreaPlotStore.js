import { create } from 'zustand'
import { produce } from "immer"

export const useRecurrentRegionsAreaPlotStore = create((set) => ({
    globalSetting: {
        marginX: 30,
        marginY: 20
    },
    titleSetting: {
        marginTop: 5,
        marginBottom: 5,
        fontSize: 24
    },
    legendSetting: {
        width: 90,
        height: 20,
        itemGap: 5,
        marginTop: 10,
        marginBottom: 0,
        symbolWidth: 30,
        fontSize: 14
    },
    labelSetting: {
        fontSize: 10,
        height: 70
    },
    chromosomeAxisSetting: {
        height: 20
    },
    displaySetting: {
        chromosome: 'All',
        mode: 'Adaptive',
        ampYAxisMax: 3,
        delYAxisMax: 3
    },
    setChartSetting: (event, key) => {
        let { name, value, type } = event.target

        if (type === 'number') {
            value = parseFloat(value)
        }

        set((state) =>
            produce(state, (draft) => {
                draft[key][name] = value
            })
        )
    }
}))
