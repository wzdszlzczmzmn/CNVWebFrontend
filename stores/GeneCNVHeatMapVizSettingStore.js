import { create } from 'zustand'
import { produce } from 'immer'

const useGeneCNVHeatMapVizSettingStore = create((set) => ({
    hierarchicalClusteringTreeSetting: {
        width: 300,
        nodeRadius: 4,
    },
    heatMapSetting: {
        mode: 'Fixed',
        CNVRectWidth: 16,
        metaRectWidth: 16,
        rectHeight: 10,
        height: 1000
    },
    nodeHistorySetting: {
        width: 35,
        height: 20,
    },
    gapSetting: {
        treeHeatMapGap: 30,
        colorLegendTreeGap: 50,
    },
    colorLegendSetting: {
        width: 250,
        height: 50,
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

export default useGeneCNVHeatMapVizSettingStore
