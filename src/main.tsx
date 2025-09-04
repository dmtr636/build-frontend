import ReactDOM from "react-dom/client";
import { App } from "src/app/App.tsx";
import axios from "axios";
import { configure } from "mobx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { isDevelopment } from "src/shared/config/domain.ts";

dayjs.extend(customParseFormat);

configure({
    enforceActions: "never",
});

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);

if (isDevelopment) {
    const consoleError = console.error;
    const SUPPRESSED_WARNINGS = [
        "Function components cannot be given refs",
        "cannot appear as a descendant of",
        "findDOMNode is deprecated",
    ];

    console.error = function filterWarnings(msg, ...args) {
        if (typeof msg !== "string") {
            consoleError(msg, ...args);
            return;
        }
        if (!SUPPRESSED_WARNINGS.some((entry) => msg.includes(entry))) {
            consoleError(msg, ...args);
        }
    };
}
