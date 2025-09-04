import { useCallback } from "react";
import { throttle } from "src/shared/utils/throttle.ts";

export const useThrottledCallback = (
    callback: (...args: any[]) => void,
    delay: number,
    deps: any[] = [],
) => {
    return useCallback(throttle(callback, delay), deps);
};
