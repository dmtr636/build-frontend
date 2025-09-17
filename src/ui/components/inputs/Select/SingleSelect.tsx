import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconArrowDown, IconClose } from "src/ui/assets/icons";
import { ReactNode, useMemo, useState } from "react";
import styles from "./Select.module.scss";
import { SelectOption, SelectSize } from "src/ui/components/inputs/Select/Select.types.ts";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { clsx } from "clsx";

export interface SingleSelectProps<T> {
    options: SelectOption<T>[];
    value: T | null;
    defaultValue?: T;
    onValueChange: (value: T | null) => void;
    onOptionChange?: (option: SelectOption<T> | null) => void;
    iconBefore?: ReactNode;
    formName?: string;
    formNotification?: ReactNode;
    placeholder?: string;
    size?: SelectSize;
    multiple?: false;
    error?: boolean;
    brand?: boolean;
    disableClear?: boolean;
    required?: boolean;
    appendTextToValue?: string;
    disabled?: boolean;
    maxHeight?: number;
    zIndex?: number;
}

export const SingleSelect = <T = string,>(props: SingleSelectProps<T>) => {
    const {
        options,
        value,
        defaultValue,
        onValueChange,
        onOptionChange,
        iconBefore,
        formName,
        formNotification,
        placeholder,
        size = "medium",
        error,
        brand,
        required,
        disableClear,
        disabled,
        maxHeight,
    }: SingleSelectProps<T> = props;
    const [hover, setHover] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options.length, value],
    );

    const handleChange = (option: DropdownListOption<T | null> | null) => {
        if (option === null && defaultValue) {
            option = options.find((option) => option.value === defaultValue) ?? null;
        }
        onValueChange(option?.value ?? null);
        onOptionChange?.(option as SelectOption<T>);
    };

    return (
        <SingleDropdownList<T | null>
            options={options}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            fullWidth={true}
            mode="neutral"
            setShow={setShowDropdown}
            size={size}
            hideTip={true}
            disableSelectedItem={!props.appendTextToValue}
            maxHeight={maxHeight}
            zIndex={props.zIndex}
        >
            <Input
                formName={formName}
                placeholder={placeholder ?? ""}
                formText={formNotification}
                value={(selectedOption?.name ?? "") + (props.appendTextToValue ?? "")}
                onChange={() => {}}
                size={size}
                disabled={disabled}
                customStartIcon={selectedOption?.icon}
                startIcon={iconBefore ?? selectedOption?.listItemIcon}
                brand={brand}
                required={required}
                endActions={
                    <div className={styles.inputEndActions}>
                        {value && hover && value !== defaultValue && !disableClear && (
                            <ButtonIcon
                                mode="neutral"
                                disabled={disabled}
                                size={size === "large" ? "medium" : "small"}
                                pale={true}
                                onClick={() => handleChange(null)}
                            >
                                <IconClose />
                            </ButtonIcon>
                        )}
                        <ButtonIcon
                            mode="neutral"
                            disabled={disabled}
                            size={size === "large" ? "medium" : "small"}
                            hover={!value && hover}
                            pale={true}
                        >
                            <IconArrowDown
                                className={clsx(styles.iconArrow, {
                                    [styles.showDropdown]: showDropdown,
                                })}
                            />
                        </ButtonIcon>
                    </div>
                }
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={clsx(styles.Input, styles[size])}
                isFocused={showDropdown}
                error={error}
                inputReadonly={true}
            />
        </SingleDropdownList>
    );
};
