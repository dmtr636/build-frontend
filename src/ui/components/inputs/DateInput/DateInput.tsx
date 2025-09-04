import React, { ChangeEvent, CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Input } from "../Input/Input";
import { InputSize } from "../Input/Input.types";

export const DateInput = ({
    value,
    onChange,
    disabled,
    error,
    size = "large",
    dateType = "date",
    placeholder,
    formName,
    outlined,
    formText,
    centered,
    startIcon,
    brand,
    readonly,
    setIsValid,
    inputStyle,
    inputContentStyle,
    disableFullDateStrict,
}: {
    value: string;
    onChange: (date: string) => void;
    disabled?: boolean;
    error?: boolean;
    size?: InputSize;
    placeholder?: string;
    dateType?: "date" | "fulldate" | "time" | "year" | "monthAndYear";
    formName?: string;
    formText?: string | ReactNode;
    brand?: boolean;
    outlined?: boolean;
    centered?: boolean;
    startIcon?: ReactNode;
    readonly?: boolean;
    setIsValid?: (value: boolean) => void;
    inputStyle?: CSSProperties | undefined;
    inputContentStyle?: CSSProperties | undefined;
    disableFullDateStrict?: boolean;
}) => {
    const [dateIsValid, setDateIsValid] = React.useState(true);

    useEffect(() => {
        setIsValid?.(dateIsValid);
    }, [dateIsValid]);

    function isValidFullDate(value: string): boolean {
        const fulldateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
        if (!fulldateRegex.test(value)) {
            return false;
        }
        const [day, month, year] = value.split(".");
        const isValidDay = parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31;
        const isValidMonth = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;
        /*  const isValidYear = parseInt(year, 10) >= 1900 && parseInt(year, 10) <= 2100;*/
        return isValidDay && isValidMonth;
    }

    function isValidTime(value: string): boolean {
        const timeRegex = /^\d{2}:\d{2}$/;
        return timeRegex.test(value);
    }

    function isValidDate(value: string): boolean {
        const dateRegex = /^\d{2}\.\d{2}$/;
        if (!dateRegex.test(value)) {
            return false;
        }
        const [day, month] = value.split(".");
        const isValidDay = parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31;
        const isValidMonth = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;

        return isValidDay && isValidMonth;
    }

    function isValidMonthAndYearDate(value: string): boolean {
        const dateRegex = /^\d{2}\.\d{4}$/;
        if (!dateRegex.test(value)) {
            return false;
        }
        const [month, year] = value.split(".");
        const isValidMonth = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;

        return isValidMonth && isValidYear(year);
    }

    function isValidYear(value: string): boolean {
        const dateRegex = /\d{4}$/;
        if (!dateRegex.test(value)) {
            return false;
        }

        return true;
    }

    function dateValidate(value: string, dateType: string): boolean {
        switch (dateType) {
            case "fulldate":
                return isValidFullDate(value);

            case "time":
                return isValidTime(value);

            case "date":
                return isValidDate(value);
            case "year":
                return isValidYear(value);
            case "monthAndYear":
                return isValidMonthAndYearDate(value);
            default:
                return false;
        }
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        let newValue = event.target.value.replace(/_/g, "");

        if (dateType === "time") {
            const [hour, minute] = newValue.split(":");
            const input = event.target;
            const newPos = newValue.length;
            if (hour && parseInt(hour, 10) > 2 && hour.length === 1) {
                newValue = `0${hour}:${minute || ""}`;

                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (parseInt(hour, 10) === 24) {
                newValue = `00:${minute || ""}`;
                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (parseInt(hour, 10) > 24) {
                newValue = `0${hour[1]}:${minute || ""}`;
                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (minute && parseInt(minute, 10) > 5 && minute.length === 1) {
                newValue = `${hour || ""}:0${minute}`;

                setTimeout(() => input.setSelectionRange(newPos + 1, newPos + 1), 0);
            }
            if (minute && parseInt(minute, 10) > 59 && minute.length === 2) {
                newValue = `${hour || ""}:0${minute[1]}`;
                setTimeout(() => input.setSelectionRange(newPos + 1, newPos + 1), 0);
            }
        }
        if (dateType === "date" || (dateType === "fulldate" && !disableFullDateStrict)) {
            const [day, month, year] = newValue.split(".");
            const input = event.target;
            const newPos = newValue.length;
            if (day && parseInt(day, 10) > 3 && day.length === 1) {
                newValue = `0${day}/${month || ""}`;

                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (parseInt(day, 10) > 31) {
                newValue = `0${day[1]}.${month || ""}`;
            }
            if (day === "00" && day.length === 2) {
                newValue = `01.${month || ""}`;
            }
            if (month === "00" && day.length === 2) {
                newValue = `${day}.01`;
            }
            if (month && parseInt(month, 10) > 1 && month.length === 1) {
                newValue = `${day || ""}.0${month}`;

                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (parseInt(month, 10) > 12) {
                newValue = `${day || ""}.0${month[1]}`;
            }
        }
        if (dateType === "monthAndYear") {
            const [month, year] = newValue.split(".");
            const input = event.target;
            const newPos = newValue.length;
            if (month === "00") {
                newValue = `01`;
            }
            if (month && parseInt(month, 10) > 1 && month.length === 1) {
                newValue = `0${month}`;

                setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
            }
            if (parseInt(month, 10) > 12) {
                newValue = `0${month[1]}`;
            }
        }
        if (dateType === "fulldate" && disableFullDateStrict) {
            onChange(event.target.value);
        } else {
            onChange(newValue);
        }
        setDateIsValid(dateValidate(newValue, dateType));
    };

    const [isInputFocused, setIsInputFocused] = useState(false);
    const handleInputFocus = (): void => {
        setIsInputFocused(true);
    };
    const handleInputBlur = (): void => {
        setIsInputFocused(false);
        if (!dateValidate(value, dateType)) {
            setDateIsValid(false);
        }
    };

    const showError = !dateIsValid && !isInputFocused && !(value === "");
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Input
                ref={inputRef}
                types="text"
                size={size}
                error={showError || error}
                onChange={handleInputChange}
                value={value}
                placeholder={placeholder}
                formName={formName}
                formText={formText}
                isFocused={isInputFocused}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                disabled={disabled}
                maskType={dateType}
                outlined={outlined}
                startIcon={startIcon}
                centered={centered}
                brand={brand}
                readonly={readonly}
                inputStyle={inputStyle}
                inputContentStyle={inputContentStyle}
            />
        </>
    );
};
