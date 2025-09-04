import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RedirectWithQueryProps {
    to: string;
}

export const RedirectWithQuery = ({ to }: RedirectWithQueryProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(`${to}${location.search}`, { replace: true });
    }, [to, location.search, navigate]);

    return null;
};
