import { create } from 'zustand'
import { produce } from 'immer'

export const useRecurrentEventsStore = create((set) => ({
    globalSetting: {
        marginX: 30,
        marginY: 20
    },
    titleSetting: {
        marginTop: 0,
        marginBottom: 15,
        fontSize: 24
    },
    labelSetting: {
        width: 70,
        fontSize: 10
    },
    samplePloidyStairstepSetting: {
        chartGap: 0,
        marginX: 10
    },
    metaMatrixSetting: {
        marginTop: 20,
        height: 20
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
