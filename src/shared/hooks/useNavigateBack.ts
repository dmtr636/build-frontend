import { useLocation, useNavigate } from "react-router-dom";

export const useNavigateBack = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (options?: { default: string }) => {
        if (location.key === "default") {
            navigate(options?.default ?? removeLastSegment(location.pathname), { replace: true });
        } else {
            navigate(-1);
        }
    };
};

function removeLastSegment(url: string): string {
    const segments = url.split("/");
    if (segments.length > 1) {
        segments.pop();
    }
    return segments.join("/");
}
