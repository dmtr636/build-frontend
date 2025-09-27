import styles from "./DatePicker.module.scss";
import { CSSProperties, useEffect, useMemo, useState } from "react";

import { PopoverBase } from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import {
    Calendar,
    CalendarChangeReason,
    CalendarProps,
} from "src/ui/components/solutions/Calendar/Calendar.tsx";
import { Input, InputProps } from "src/ui/components/inputs/Input/Input.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconCalendar, IconClose } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

export interface DatePickerProps
    extends CalendarProps,
        Pick<
            InputProps,
            | "formName"
            | "placeholder"
            | "formText"
            | "startIcon"
            | "size"
            | "required"
            | "showBacklight"
        > {
    value: string | null;
    brand?: boolean;
    manualInput?: boolean;
    disableClear?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    width?: CSSProperties["width"];
    zIndex?: number;
}

export const DatePicker = (props: DatePickerProps) => {
    const {
        value,
        formName,
        formText,
        placeholder,
        startIcon,
        size = "medium",
        onChange,
        brand,
        required,
        disableTime,
        manualInput,
        disableClear,
        readonly,
        zIndex,
        disabled,
    }: DatePickerProps = props;
    const [showCalendar, setShowCalendar] = useState(false);
    const [hover, setHover] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const date = useMemo(() => {
        if (value) {
            return new Date(value);
        }
    }, [value]);

    useEffect(() => {
        if (date) {
            setInputValue(date.toLocaleDateString());
        } else {
            setInputValue("");
        }
    }, [date]);

    const handleChange = (dateValue: string | null, reason?: CalendarChangeReason) => {
        onChange(dateValue);
        if (reason === "clickDay") {
            if (disableTime) {
                setShowCalendar(false);
            }
        }
    };

    const getInputValue = (date?: Date) => {
        if (manualInput) {
            return inputValue;
        }
        if (date) {
            if (disableTime) {
                return date.toLocaleDateString();
            }
            return `${date.toLocaleDateString()} / ${date.toLocaleTimeString([], { timeStyle: "short" })}`;
        }
        return "";
    };

    const getDefaultPlaceholder = () => {
        if (manualInput) {
            return "ДД.ММ.ГГГГ";
        }
        return !disableTime ? "Выберите дату и время" : "Выберите дату";
    };

    const isValidFullDate = (value: string) => {
        const fulldateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
        if (!fulldateRegex.test(value)) {
            return false;
        }
        const [day, month, year] = value.split(".");
        const isValidDay = parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31;
        const isValidMonth = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;
        const isValidYear = parseInt(year, 10) >= 1900 && parseInt(year, 10) <= 2100;
        return isValidDay && isValidMonth && isValidYear;
    };

    return (
        <PopoverBase
            mode={"contrast"}
            zIndex={zIndex}
            triggerEvent={manualInput || readonly || disabled ? "none" : "click"}
            content={
                <Calendar
                    {...props}
                    onChange={handleChange}
                    disableTime={manualInput ? true : disableTime}
                    mode={brand ? "brand" : "accent"}
                />
            }
            show={showCalendar}
            setShow={setShowCalendar}
            tipPosition={"top-left"}
            hideTip={true}
        >
            <Input
                formName={formName}
                placeholder={placeholder ?? getDefaultPlaceholder()}
                formText={formText}
                value={getInputValue(date)}
                onChange={(event) => {
                    if (manualInput) {
                        setInputValue(event.target.value);
                        if (isValidFullDate(event.target.value)) {
                            const [day, month, year] = event.target.value.split(".");
                            handleChange(
                                new Date(Number(year), Number(month) - 1, Number(day))
                                    .toISOString()
                                    .replace(/\.\d{3}Z$/, "Z"),
                            );
                        }
                    }
                }}
                size={size}
                required={required}
                brand={brand}
                readonly={readonly}
                disabled={disabled}
                startIcon={startIcon}
                endActions={
                    !readonly && (
                        <div className={styles.inputEndActions}>
                            {value && hover && !disableClear && (
                                <Tooltip header={"Очистить"} delay={500}>
                                    <ButtonIcon
                                        mode="neutral"
                                        size={size === "large" ? "medium" : "small"}
                                        pale={true}
                                        onClick={() => handleChange(null)}
                                    >
                                        <IconClose />
                                    </ButtonIcon>
                                </Tooltip>
                            )}
                            <ButtonIcon
                                mode="neutral"
                                size={size === "large" ? "medium" : "small"}
                                pale={true}
                                disabled={disabled}
                                onClick={() => {
                                    if (manualInput) {
                                        setShowCalendar(!showCalendar);
                                    }
                                }}
                            >
                                <IconCalendar />
                            </ButtonIcon>
                        </div>
                    )
                }
                onMouseEnter={() => setHover(true)}
                onMouseLeave={(event) => {
                    const selection = document.getSelection();
                    if (!selection?.toString()) {
                        setHover(false);
                    } else {
                        const range = selection.getRangeAt(0);
                        const element = event.target as HTMLElement;
                        const isSelectionInside =
                            (element.contains(range.startContainer) &&
                                element.contains(range.endContainer)) ||
                            range.startContainer.contains(element) ||
                            range.endContainer.contains(element);
                        if (!isSelectionInside) {
                            setHover(false);
                        }
                    }
                }}
                className={clsx(styles.Input, {
                    [styles.manualInput]: manualInput,
                    [styles.disabled]: disabled,
                })}
                isFocused={showCalendar}
                style={{ width: props.width ?? 320 }}
                maskType={manualInput ? "fulldate" : undefined}
                onBlur={() => {
                    if (manualInput) {
                        if (!isValidFullDate(inputValue)) {
                            setInputValue("");
                            handleChange(null);
                        }
                    }
                    setHover(false);
                }}
                showBacklight={props.showBacklight}
            />
        </PopoverBase>
    );
};
