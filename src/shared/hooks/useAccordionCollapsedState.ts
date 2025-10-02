import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "src/shared/hooks/useDebouncedCallback.ts";

const keyPrefix = "build.accordionCollapsed";

export const useAccordionCollapsedState = (
    key: string,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
    const fullKey = `${keyPrefix}.${key}`;

    const [collapsed, setCollapsed] = useState(() =>
        key ? localStorage.getItem(fullKey) === "true" : false,
    );

    useEffect(() => {
        saveDebounced(key, fullKey, collapsed);
    }, [collapsed, fullKey]);

    const saveDebounced = useDebouncedCallback(
        (key: string, fullKey: string, collapsed: boolean) => {
            if (key) {
                localStorage.setItem(fullKey, collapsed ? "true" : "false");
            }
        },
        500,
        [],
    );

    return [collapsed, setCollapsed];
};
