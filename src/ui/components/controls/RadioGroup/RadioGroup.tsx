import { ReactNode } from "react";
import { RadioGroupContext } from "./RadioGroupContext.ts";

interface RadioGroupProps {
    value: string | null;
    onChange: (value: string) => void;
    children: ReactNode;
}

export const RadioGroup = (props: RadioGroupProps) => {
    const { value, onChange, children }: RadioGroupProps = props;

    return (
        <RadioGroupContext.Provider value={{ value, onChange }}>
            {children}
        </RadioGroupContext.Provider>
    );
};
