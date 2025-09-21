import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { registryStore } from "src/app/AppStore.ts";

export const Works = observer(() => {
    useEffect(() => {
        if (!registryStore.documents.length) {
            registryStore.fetchAllWorks();
        }
    }, []);

    return <div>123</div>;
});
