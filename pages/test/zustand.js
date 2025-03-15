import { create } from 'zustand'

const useTestStore = create((set) => ({
    count: 0,
    increaseCount: () => set((state) => ({ count: state.count + 1 })),
}))

const Parent = () => {
    const increaseCount = useTestStore((state) => state.increaseCount)

    return (
        <div>
            <button onClick={increaseCount}>Add</button>
            <Son/>
        </div>
    )
}

const Son = () => {
    const count = useTestStore((state) => state.count)

    return (
        <div>
            Son: {count}
        </div>
    )
}

export default Parent
