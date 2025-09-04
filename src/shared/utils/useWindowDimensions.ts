import { useLayoutEffect, useState } from "react";
import { throttle } from "src/shared/utils/throttle.ts";

export function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height, outerWidth } = window;
    return {
        width: Math.min(width, outerWidth),
        height,
    };
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useLayoutEffect(() => {
        const handleResize = throttle(() => {
            setWindowDimensions(getWindowDimensions());
        }, 50);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
}
