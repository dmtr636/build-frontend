import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { registryStore } from "src/app/AppStore.ts";

export const Violations = observer(() => {
    useEffect(() => {
        if (!registryStore.documents.length) {
            registryStore.fetchAllViolations();
        }
    }, []);

    return <div>123</div>;
});
