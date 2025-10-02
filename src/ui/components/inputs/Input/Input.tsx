import styles from "./Input.module.scss";
import {
    ChangeEvent,
    CSSProperties,
    forwardRef,
    ReactNode,
    RefObject,
    useEffect,
    useRef,
    useState,
} from "react";
import { clsx } from "clsx";
import { InputSize, InputType } from "src/ui/components/inputs/Input/Input.types.ts";
import ReactInputMask from "react-input-mask";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconClose, IconInvalide, IconValide } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { Backlight } from "src/ui/components/controls/Backlight/Backlight.tsx";

export interface InputProps {
    placeholder?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    types?: InputType;
    size?: InputSize;
    startIcon?: ReactNode;
    customStartIcon?: ReactNode;
    endIcon?: ReactNode;
    endActions?: ReactNode;
    counterValue?: number;
    className?: string;
    style?: CSSProperties | undefined;
    inputStyle?: CSSProperties | undefined;
    inputContentStyle?: CSSProperties | undefined;
    inputBorderStyle?: CSSProperties | undefined;
    value: any;
    error?: boolean;
    formName?: string | ReactNode;
    formText?: string | ReactNode;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    disabled?: boolean;
    outlined?: boolean;
    autoFocus?: boolean;
    number?: boolean;
    inputRef?: RefObject<HTMLInputElement>;
    maskType?: "phone" | "date" | "fulldate" | "time" | "year" | "promoCode" | "monthAndYear";
    centered?: boolean;
    brand?: boolean;
    required?: boolean;
    showTooltip?: boolean;
    id?: string;
    readonly?: boolean;
    onClear?: () => void;
    showBacklight?: boolean;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    validate?: boolean;
    inputReadonly?: boolean;
    tooltipHeader?: string;
    hasTooltip?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        placeholder,
        onChange,
        size = "medium",
        customStartIcon,
        startIcon,
        endIcon,
        endActions,
        className,
        formName = "",
        value,
        types = "text",
        error = false,
        formText = "",
        isFocused: propIsFocused,
        onFocus: propOnFocus,
        onBlur: propOnBlur,
        onMouseEnter,
        onMouseLeave,
        disabled,
        style,
        inputStyle,
        inputContentStyle,
        outlined = false,
        autoFocus,
        number,
        maskType,
        centered,
        brand,
        required,
        validate,

        id,
        readonly,
        onClear,
        showBacklight,
        inputReadonly,
        tooltipHeader,
        hasTooltip,
    }: InputProps = props;

    const [isInputFocused, setIsInputFocused] = useState(false);

    const inputClassName = clsx(
        styles.inputContainer,
        styles[size],
        {
            [styles.outlined]: outlined,
            [styles.disabled]: disabled,
            [styles.focus]: isInputFocused,
            [styles.readonly]: readonly,
        },
        className,
    );
    const handleInputFocus = (): void => {
        setIsInputFocused(true);
        propOnFocus && propOnFocus();
    };
    const handleInputBlur = (): void => {
        setIsInputFocused(false);
        propOnBlur && propOnBlur();
    };
    useEffect(() => {
        if (propIsFocused !== undefined) {
            setIsInputFocused(propIsFocused);
        }
    }, [propIsFocused]);
    const masks = [
        { mask: "+7 (999) 999-99-99", placeholder: "+7 (XXX) XXX-XX-XX" },
        { mask: "99.99.9999", placeholder: "ДД.ММ.ГГГГ" },

        { mask: "99.99", placeholder: "ДД.ММ" },
        { mask: "99:99", placeholder: "ММ:ЧЧ" },
        { mask: "9999", placeholder: "____" },
        { mask: "****-****-****", placeholder: "____-____-____" },
        { mask: "99.9999", placeholder: "ММ.ГГГГ" },
    ];

    let currentMask: any;
    let currentPlaceholder: any;
    if (maskType) {
        switch (maskType) {
            case "phone":
                currentMask = masks[0].mask;
                currentPlaceholder = masks[0].placeholder;
                break;
            case "fulldate":
                currentMask = masks[1].mask;
                currentPlaceholder = masks[1].placeholder;
                break;
            case "date":
                currentMask = masks[2].mask;
                currentPlaceholder = masks[2].placeholder;
                break;
            case "time":
                currentMask = masks[3].mask;
                currentPlaceholder = masks[3].placeholder;
                break;
            case "year":
                currentMask = masks[4].mask;
                currentPlaceholder = masks[4].placeholder;
                break;
            case "promoCode":
                currentMask = masks[5].mask;
                currentPlaceholder = masks[5].placeholder;
                break;
            case "monthAndYear":
                currentMask = masks[6].mask;
                currentPlaceholder = masks[5].placeholder;
                break;
            default:
                currentMask = "/*";
        }
    }

    const formNameText = required ? (
        <>
            {formName}
            <span className={clsx(styles.required, { [styles.requiredError]: error })}>*</span>
        </>
    ) : (
        formName
    );
    const inputRef = props.inputRef ?? useRef<HTMLInputElement>(null);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const getEndIcon = () => {
        if (endIcon) {
            return endIcon;
        }

        if (onClear && isInputFocused && value) {
            return (
                <Tooltip text={"Очистить"} mode={"neutral"}>
                    <ButtonIcon
                        mode={"neutral"}
                        size={size === "large" ? "medium" : "small"}
                        onMouseDown={onClear}
                        pale={true}
                        tabIndex={-1}
                    >
                        <IconClose />
                    </ButtonIcon>
                </Tooltip>
            );
        }
        if (validate !== undefined && value && !isInputFocused && !readonly) {
            return (
                <div onClick={(event) => event.stopPropagation()}>
                    {validate ? <IconValide /> : <IconInvalide />}
                </div>
            );
        }
    };

    const onMouseEnterEvent = () => {
        if (onMouseEnter) {
            onMouseEnter();
        }
    };
    const onMouseLeaveEvent = (event: React.MouseEvent) => {
        if (onMouseLeave) {
            onMouseLeave(event);
        }
    };

    const renderInput = () => {
        const inputComponent = (
            <input
                id={id}
                ref={inputRef}
                type={number ? "number" : types}
                value={value}
                className={clsx(styles.input, styles[size], {
                    [styles.focus]: isInputFocused,
                    [styles.disabled]: disabled,
                    [styles.password]: types === "password" && value.length > 0,
                    [styles.outlined]: outlined,
                    [styles.centered]: centered,
                })}
                onChange={onChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={maskType && !placeholder ? currentPlaceholder : placeholder}
                disabled={disabled || readonly}
                autoFocus={autoFocus}
                autoComplete={types === `password` ? `password` : ``}
                style={inputStyle}
                readOnly={inputReadonly}
                title={tooltipHeader && hasTooltip ? undefined : value}
            />
        );

        return (
            <div
                className={inputClassName}
                style={{ ...style }}
                ref={ref}
                onClick={() => {
                    focusInput();
                }}
                onMouseEnter={onMouseEnterEvent}
                onMouseLeave={onMouseLeaveEvent}
                onKeyDown={props.onKeyDown}
            >
                <div
                    className={clsx(styles.inputBorder, {
                        [styles.active]: isInputFocused,
                        [styles.error]: error,
                        [styles.disabled]: disabled,
                        [styles.outlined]: outlined,
                        [styles.brand]: brand,
                        [styles.readonly]: readonly,
                        [styles.inputAfterFocus]: value?.length > 0,
                    })}
                    style={props.inputBorderStyle}
                />
                <div
                    className={clsx(styles.inputContent, styles[size], {
                        [styles.outlined]: outlined,
                        [styles.disabled]: disabled,
                    })}
                    style={inputContentStyle}
                >
                    {startIcon && (
                        <div
                            className={clsx(styles.icon, styles.iconBlock, styles[size], {
                                [styles.focus]: isInputFocused /*|| value*/,
                                [styles.readonly]: readonly,
                            })}
                        >
                            {startIcon}
                        </div>
                    )}

                    {customStartIcon && (
                        <div className={clsx(styles.customStartIcon, styles[size])}>
                            {customStartIcon}
                        </div>
                    )}

                    {maskType ? (
                        <ReactInputMask
                            id={id}
                            inputRef={(ref) => ((inputRef as any).current = ref)}
                            type={number ? "number" : types}
                            value={value}
                            mask={currentMask}
                            className={clsx(styles.input, styles[size], {
                                [styles.focus]: isInputFocused,
                                [styles.disabled]: disabled,
                                [styles.password]: types === "password" && value.length > 0,
                                [styles.outlined]: outlined,
                                [styles.centered]: centered,
                            })}
                            onChange={onChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder={
                                maskType && !placeholder ? currentPlaceholder : placeholder
                            }
                            disabled={disabled || readonly}
                            autoFocus={autoFocus}
                            autoComplete={types === "password" ? "new-password" : ""}
                            maskChar={maskType === "promoCode" ? null : undefined}
                            style={inputStyle}
                            readOnly={inputReadonly}
                        />
                    ) : hasTooltip ? (
                        <Tooltip header={tooltipHeader} alwaysMount={true}>
                            <span style={{ flexGrow: 1, height: "100%", width: "100%" }}>
                                {inputComponent}
                            </span>
                        </Tooltip>
                    ) : (
                        inputComponent
                    )}

                    {(getEndIcon() || validate !== undefined) && (
                        <div className={clsx(styles.iconBlock, styles[size])}>{getEndIcon()}</div>
                    )}

                    {endActions}
                </div>

                {showBacklight && !isInputFocused && <Backlight />}
            </div>
        );
    };
    return (
        <div>
            {formName && (
                <div className={clsx(styles.formName, styles[size], { [styles.error]: error })}>
                    {formNameText}
                </div>
            )}
            {renderInput()}
            {formText && (
                <div className={clsx(styles.formText, styles[size], { [styles.error]: error })}>
                    {formText}
                </div>
            )}
        </div>
    );
});
Input.displayName = "Input";
