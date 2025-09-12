import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconArrowDown, IconClose } from "src/ui/assets/icons";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Select.module.scss";
import { TextMeasurer } from "src/shared/utils/TextMeasurer.ts";
import { clsx } from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { SelectOption, SelectSize } from "src/ui/components/inputs/Select/Select.types.ts";
import { MultipleDropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { MultipleDropdownList } from "src/ui/components/solutions/DropdownList/MultipleDropdownList.tsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

export interface MultipleSelectProps<T> {
    options: SelectOption<T>[];
    values: T[];
    onValuesChange: (values: T[]) => void;
    onOptionsChange?: (options: SelectOption<T>[]) => void;
    iconBefore?: ReactNode;
    formName?: string;
    formNotification?: ReactNode;
    placeholder?: string;
    size?: SelectSize;
    multiple: true;
    error?: boolean;
    disableClear?: boolean;
    brand?: boolean;
}

export const MultipleSelect = <T = string,>(props: MultipleSelectProps<T>) => {
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
        disableClear,
    }: MultipleSelectProps<T> = props;
    const [hover, setHover] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [init, setInit] = useState(false);

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

    const handleChange = (options: MultipleDropdownListOption<T>[]) => {
        onValuesChange(options.map((option) => option.value));
        onOptionsChange?.(options as SelectOption<T>[]);
    };

    return (
        <MultipleDropdownList<T>
            options={options}
            values={values}
            onChange={handleChange}
            fullWidth={true}
            mode="neutral"
            setShow={setShowDropdown}
            size={size}
            hideTip={true}
            multiple={true}
        >
            <Input
                formName={formName}
                placeholder={placeholder ?? ""}
                formText={formNotification}
                value={
                    selectedOptions
                        .slice(0, 1)
                        .map((option) => option.name)
                        .join(", ") + (selectedOptions.length > 1 ? ", ..." : "")
                }
                onChange={() => {}}
                size={size}
                startIcon={iconBefore}
                brand={props.brand}
                endActions={
                    <div className={clsx(styles.inputEndActions, styles[size])}>
                        {hover && !disableClear && !!values.length && (
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
                        {values.length > 1 && values.length > displayedOptionsCount && (
                            <Counter
                                value={values.length}
                                maxValue={values.length - displayedOptionsCount}
                                mode={"neutral"}
                                size={size}
                            />
                        )}
                        <ButtonIcon
                            mode="neutral"
                            size={size === "large" ? "medium" : "small"}
                            hover={values.length === 0 && hover}
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
                className={styles.Input}
                isFocused={showDropdown}
                error={error}
                inputRef={inputRef}
                inputReadonly={true}
            />
        </MultipleDropdownList>
    );
};
