import { create } from 'zustand'
import { produce } from 'immer'

export const usePloidyStairstepVizSettingStore = create((set) => ({
    globalSettings: {
        width: 1080,
        height: 540,
        marginTop: 20,
        marginBottom: 30,
        marginLeft: 30,
        marginRight: 20,
    },
    legendSettings: {
        width: 150,
        height: 20,
        itemHorizontalGap: 10,
        itemVerticalGap: 5,
    },
    titleSettings: {
        height: 45,
    }
}))
