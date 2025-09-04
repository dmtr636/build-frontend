import { useCallback } from "react";
import { debounce } from "src/shared/utils/throttle.ts";

export const useDebouncedCallback = (
    callback: (...args: any[]) => void,
    delay: number,
    deps: any[] = [],
) => {
    return useCallback(debounce(callback, delay), deps);
};
