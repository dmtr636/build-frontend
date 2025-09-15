import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconArrowDown, IconClose, IconPlus } from "src/ui/assets/icons";
import { AutocompleteOption, AutocompleteSize } from "./Autocomplete.types.ts";
import { CSSProperties, ReactNode, useLayoutEffect, useMemo, useState } from "react";
import styles from "./Autocomplete.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { clsx } from "clsx";
import { ListItem } from "src/ui/components/controls/ListItem/ListItem.tsx";
import { observer } from "mobx-react-lite";

export interface SingleAutocompleteProps<T> {
    options: AutocompleteOption<T>[];
    value: T | null;
    onValueChange: (value: T | null) => void;
    onOptionClick?: (value: T | null) => void;
    onOptionChange?: (option: AutocompleteOption<T> | null) => void;
    iconBefore?: ReactNode;
    formName?: string;
    formNotification?: ReactNode;
    placeholder?: string;
    size?: AutocompleteSize;
    multiple?: false;
    error?: boolean;
    brand?: boolean;
    required?: boolean;
    addButtonLabel?: string;
    onAddButtonClick?: (inputValue: string) => void;
    disabled?: boolean;
    style?: CSSProperties;
    endIcon?: ReactNode;
    clearInputValueOnChange?: boolean;
    disabledAddInputValues?: string[];
    showBacklight?: boolean;
    disableClear?: boolean;
    onEnterClick?: (inputValue: string) => void;
    zIndex?: number;
    disableChangeHandler?: boolean;
}

export const SingleAutocomplete = observer(<T = string,>(props: SingleAutocompleteProps<T>) => {
    const {
        options,
        value,
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
    }: SingleAutocompleteProps<T> = props;
    const [hover, setHover] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [dirty, setDirty] = useState(false);

    const selectedOption = useMemo(() => {
        return options.find((option) => option.value === value);
    }, [value, options.length]);

    useLayoutEffect(() => {
        setInputValue(selectedOption?.name ?? "");
    }, [value]);

    const filteredOptions = useMemo(() => {
        if (!dirty) {
            return options;
        }
        return options.filter((option) =>
            option.name.toLowerCase().startsWith(inputValue.toLowerCase()),
        );
    }, [
        inputValue,
        dirty,
        options.length,
        options.map((option) => option.icon).filter(Boolean).length,
    ]);

    const exactFilteredOptions = useMemo(() => {
        if (!dirty) {
            return options;
        }
        return options.filter((option) => option.name.toLowerCase() === inputValue.toLowerCase());
    }, [
        inputValue,
        dirty,
        options.length,
        options.map((option) => option.icon).filter(Boolean).length,
    ]);

    const handleChange = (option: DropdownListOption<T | null> | null) => {
        if (option?.value) {
            props.onOptionClick?.(option.value);
        }
        if (!props.disableChangeHandler) {
            setInputValue(option?.name?.toString() ?? "");
            onValueChange(option?.value ?? null);
            onOptionChange?.(option as AutocompleteOption<T>);
        }
        if (props.clearInputValueOnChange) {
            setInputValue("");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDirty(true);
        setInputValue(event.target.value);
        if (!event.target.value) {
            onValueChange(null);
            return;
        }
    };

    const handleShowDropdown = (show: boolean) => {
        setShowDropdown(show);
        if (!show) {
            setDirty(false);
            const option = options.find((option) => option.name === inputValue);
            if (option) {
                onValueChange(option.value);
                onOptionChange?.(option);
            } else {
                if (selectedOption?.name !== inputValue) {
                    setInputValue(selectedOption?.name ?? "");
                }
            }
        }
    };

    const renderHeader = () => {
        if (exactFilteredOptions.length === 0) {
            if (props.addButtonLabel && inputValue) {
                return (
                    <ListItem
                        size={size}
                        mode={brand ? "brand" : "accent"}
                        iconBefore={<IconPlus />}
                        onClick={() => {
                            props.onAddButtonClick?.(inputValue);
                            setTimeout(() => {
                                setShowDropdown(false);
                            }, 10);
                        }}
                        disabled={props.disabledAddInputValues?.includes(inputValue)}
                    >
                        {props.addButtonLabel}
                        {`\xa0«${inputValue}»`}
                    </ListItem>
                );
            }
        }
    };

    const renderFooter = () => {
        if (filteredOptions.length === 0 && !(props.addButtonLabel && inputValue)) {
            return (
                <Typo
                    variant={size === "large" ? "actionXL" : "actionL"}
                    className={styles.footerText}
                >
                    Ничего не найдено
                </Typo>
            );
        }
    };

    return (
        <SingleDropdownList<T | null>
            options={filteredOptions}
            value={value}
            onChange={handleChange}
            fullWidth={true}
            mode="neutral"
            show={showDropdown}
            setShow={handleShowDropdown}
            size={size}
            hideTip={true}
            footer={renderFooter()}
            header={renderHeader()}
            headerNoPadding={!!props.addButtonLabel && !!inputValue}
            footerNoPadding={!!props.addButtonLabel && !!inputValue}
            zIndex={props.zIndex}
        >
            <Input
                required={required}
                formName={formName}
                placeholder={placeholder ?? ""}
                formText={formNotification}
                value={inputValue}
                onChange={handleInputChange}
                size={size}
                startIcon={iconBefore}
                customStartIcon={selectedOption?.icon}
                brand={brand}
                disabled={props.disabled}
                showBacklight={props.showBacklight}
                endActions={
                    props.endIcon ??
                    (!props.disabled && (
                        <div className={styles.inputEndActions}>
                            {inputValue && hover && !props.disableClear && (
                                <ButtonIcon
                                    mode="neutral"
                                    size={size === "large" ? "medium" : "small"}
                                    pale={true}
                                    onClick={() => handleChange(null)}
                                >
                                    <IconClose />
                                </ButtonIcon>
                            )}
                            <ButtonIcon
                                mode="neutral"
                                size={size === "large" ? "medium" : "small"}
                                pale={true}
                            >
                                <IconArrowDown
                                    className={clsx(styles.iconArrow, {
                                        [styles.showDropdown]: showDropdown,
                                    })}
                                />
                            </ButtonIcon>
                        </div>
                    ))
                }
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={styles.Input}
                isFocused={showDropdown}
                error={error}
                style={props.style}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        props.onEnterClick?.(inputValue);
                        setShowDropdown(false);
                    }
                }}
            />
        </SingleDropdownList>
    );
});
