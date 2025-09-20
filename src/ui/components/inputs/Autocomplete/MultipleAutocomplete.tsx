import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconArrowDown, IconArrowUp, IconClose } from "src/ui/assets/icons";
import { AutocompleteOption, AutocompleteSize } from "./Autocomplete.types.ts";
import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Autocomplete.module.scss";
import { MultipleDropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { MultipleDropdownList } from "src/ui/components/solutions/DropdownList/MultipleDropdownList.tsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { TextMeasurer } from "src/shared/utils/TextMeasurer.ts";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { TipPosition } from "src/ui/components/solutions/PopoverBase/PopoverBase.types.ts";
import { clsx } from "clsx";

export interface MultipleAutocompleteProps {
    options: AutocompleteOption[];
    values: string[];
    onValuesChange: (values: string[]) => void;
    onOptionsChange?: (options: AutocompleteOption[]) => void;
    iconBefore?: ReactNode;
    formName?: string;
    formNotification?: string;
    placeholder?: string;
    size?: AutocompleteSize;
    multiple: true;
    error?: boolean;
    required?: boolean;
    style?: CSSProperties;
    endIcon?: ReactNode;
    clearInputValueOnChange?: boolean;
    brand?: boolean;
    fullWidth?: boolean;
    tipPosition?: TipPosition;
}

export const MultipleAutocomplete = (props: MultipleAutocompleteProps) => {
    const {
        options,
        values,
        onValuesChange,
        onOptionsChange,
        iconBefore,
        formName,
        formNotification,
        placeholder,
        size = "medium",
        error,
        required,
        brand,
        fullWidth = true,
        tipPosition,
    }: MultipleAutocompleteProps = props;
    const [hover, setHover] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [init, setInit] = useState(false);

    const filteredOptions = useMemo(() => {
        return options.filter((option) =>
            option.name.toLowerCase().includes(inputValue.toLowerCase()),
        );
    }, [inputValue, options.length, options.map((option) => option.icon).filter(Boolean).length]);

    const selectedOptions = options.filter((option) => values.includes(option.value));

    useEffect(() => {
        setInit(true);
    }, []);

    const displayedOptionsCount = useMemo(() => {
        if (!inputRef.current) {
            return 0;
        }
        const inputWidth = inputRef.current.clientWidth;
        const optionNames: string[] = [];
        for (const option of selectedOptions) {
            optionNames.push(option.name);
            const totalWidth = TextMeasurer.getTextWidth(
                optionNames.join(", ").concat(" ... "),
                inputRef.current,
            );
            if (totalWidth > inputWidth) {
                break;
            }
        }
        return Math.min(optionNames.length, 1);
    }, [selectedOptions.length, inputRef.current, init]);

    const handleChange = (options: MultipleDropdownListOption<string>[]) => {
        onValuesChange(options.map((option) => option.value));
        onOptionsChange?.(options as SelectOption<string>[]);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleShowDropdown = (show: boolean) => {
        setShowDropdown(show);
        if (!show) {
            if (document.activeElement !== inputRef.current) {
                setInputValue("");
            }
        }
    };

    const renderFooter = () => {
        if (filteredOptions.length === 0) {
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
        <MultipleDropdownList
            options={filteredOptions}
            values={values}
            onChange={handleChange}
            fullWidth={fullWidth}
            mode="neutral"
            setShow={handleShowDropdown}
            show={showDropdown}
            size={size}
            hideTip={true}
            multiple={true}
            footer={renderFooter()}
            closeOnSecondClick={false}
            tipPosition={tipPosition}
        >
            <Input
                inputRef={inputRef}
                formName={formName}
                placeholder={placeholder ?? ""}
                formText={formNotification}
                value={
                    !showDropdown
                        ? selectedOptions
                              .slice(0, 1)
                              .map((option) => option.name)
                              .join(", ") + (selectedOptions.length > 1 ? ", ..." : "")
                        : inputValue
                }
                tooltipHeader={
                    selectedOptions.length > 1 && !showDropdown
                        ? selectedOptions.map((option) => option.name).join(", ")
                        : undefined
                }
                hasTooltip={true}
                onChange={handleInputChange}
                size={size}
                required={required}
                startIcon={iconBefore}
                brand={brand}
                onBlur={() => {
                    if (!showDropdown) {
                        setInputValue("");
                    }
                }}
                endActions={
                    props.endIcon ?? (
                        <div className={styles.inputEndActions}>
                            {values.length > 0 && hover && (
                                <Tooltip header={"Очистить"} delay={500}>
                                    <ButtonIcon
                                        mode="neutral"
                                        size={size === "large" ? "medium" : "small"}
                                        pale={true}
                                        onClick={() => handleChange([])}
                                    >
                                        <IconClose />
                                    </ButtonIcon>
                                </Tooltip>
                            )}
                            {values.length > 1 &&
                                !showDropdown &&
                                values.length > displayedOptionsCount && (
                                    <Tooltip
                                        header={
                                            selectedOptions.length > 1 && !showDropdown
                                                ? selectedOptions
                                                      .map((option) => option.name)
                                                      .join(", ")
                                                : undefined
                                        }
                                    >
                                        <Counter
                                            value={values.length}
                                            maxValue={
                                                !showDropdown
                                                    ? values.length - displayedOptionsCount
                                                    : values.length
                                            }
                                            mode={"neutral"}
                                            size={size}
                                        />
                                    </Tooltip>
                                )}
                            <ButtonIcon
                                mode="neutral"
                                size={size === "large" ? "medium" : "small"}
                                pale={true}
                                onClick={() => {
                                    if (showDropdown) {
                                        setTimeout(() => {
                                            setShowDropdown(false);
                                            inputRef.current?.blur();
                                        });
                                    }
                                }}
                            >
                                <IconArrowDown
                                    className={clsx(styles.iconArrow, {
                                        [styles.showDropdown]: showDropdown,
                                    })}
                                />
                            </ButtonIcon>
                        </div>
                    )
                }
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                    setHover(false);
                }}
                className={styles.Input}
                isFocused={showDropdown}
                error={error}
                style={props.style}
            />
        </MultipleDropdownList>
    );
};
