import { useEffect, useState } from "react";

export const useIsTouch = () => {
    const [isTouch, setIsTouch] = useState(false);
    useEffect(() => {
        const mq = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)");
        setIsTouch(!!(mq && mq?.matches) || "ontouchstart" in window);
    }, []);
    return isTouch;
};
