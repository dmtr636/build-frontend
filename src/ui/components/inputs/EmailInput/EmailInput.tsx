import React, { ChangeEvent, ReactNode, useState } from "react";
import { IconEmail } from "src/ui/assets/icons";
import { Input } from "../Input/Input";
import { InputSize } from "../Input/Input.types";

export const EmailInput = ({
    value,
    onChange,
    disabled,
    error,
    size = "large",
    showName = true,
    showIcon = true,
    formText,
    formName = "Почта",
    brand,
    setValid,
    required,
    placeholder,
    readonly,
    setError,
    autofocus,
    onClear,
    showBacklight,
}: {
    value: string;
    onChange: (email: string) => void;
    disabled?: boolean;
    error?: boolean;
    size?: InputSize;
    showName?: boolean;
    showIcon?: boolean;
    formText?: ReactNode;
    brand?: boolean;
    formName?: string | ReactNode;
    setValid?: (boolean: boolean) => void;
    required?: boolean;
    placeholder?: string;
    readonly?: boolean;
    setError?: (error: boolean) => void;
    autofocus?: boolean;
    onClear?: () => void;
    showBacklight?: boolean;
}) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [emailIsValid, setEmailIsValid] = React.useState(true);
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onChange(event.target.value);
        const isValid = emailRegex.test(event.target.value);
        setEmailIsValid(isValid);
        if (setValid) {
            setValid(isValid);
        }
        if (setError) {
            setError(false);
        }
    };

    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleInputFocus = (): void => {
        setIsInputFocused(true);
    };
    const handleInputBlur = (): void => {
        setIsInputFocused(false);
    };
    const showError = !emailIsValid && !isInputFocused && !(value.trim() === "");
    return (
        <>
            <Input
                autoFocus={autofocus}
                types="email"
                size={size}
                error={showError || error}
                onChange={handleInputChange}
                value={value}
                placeholder={placeholder ?? "Введите почту"}
                formName={showName ? formName : ""}
                formText={showError ? "Нужна почта в формате example@email.com" : formText}
                isFocused={isInputFocused}
                startIcon={showIcon && <IconEmail />}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                disabled={disabled}
                brand={brand}
                required={required}
                readonly={readonly}
                onClear={onClear}
                showBacklight={showBacklight}
            />
        </>
    );
};
