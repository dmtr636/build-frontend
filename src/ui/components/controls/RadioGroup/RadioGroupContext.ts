import { createContext } from "react";

export const RadioGroupContext = createContext<{
    value: string | null;
    onChange: (value: string) => void;
} | null>(null);
