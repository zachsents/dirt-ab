import { useDebouncedValue } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { create } from "zustand"


export function plural(word, q, includeNumber = false) {
    return `${includeNumber ? `${q} ` : ""}${word}${q == 1 ? "" : "s"}`
}


export const useActiveUpdateStore = create((set, get) => ({
    activeUpdates: 0,
    trackUpdate: (promise) => {
        set(s => ({ activeUpdates: s.activeUpdates + 1 }))
        promise.finally(() => set(s => ({ activeUpdates: s.activeUpdates - 1 })))
    },
    isUpdating: () => get().activeUpdates > 0,
}))


export function useRemoteValue(remoteValue, updateFunc, debounce = 700) {

    const [current, setCurrent] = useState(remoteValue)

    const trackUpdate = useActiveUpdateStore(s => s.trackUpdate)

    useEffect(() => {
        setCurrent(remoteValue)
    }, [remoteValue])

    const [debouncedValue] = useDebouncedValue(current, debounce)

    useEffect(() => {
        if (debouncedValue !== remoteValue)
            trackUpdate(updateFunc(debouncedValue))
    }, [debouncedValue])

    return [current, setCurrent]
}

export function sortFromEntries([, a], [, b]) {
    return a?.createdAt?.toMillis() - b?.createdAt?.toMillis()
}
