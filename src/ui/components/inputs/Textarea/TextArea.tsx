import React, { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.scss";
import { InputSize } from "src/ui/components/inputs/Input/Input.types";
import { Backlight } from "src/ui/components/controls/Backlight/Backlight.tsx";
import { observer } from "mobx-react-lite";

interface TextAreaProps {
    formName?: string | React.ReactNode;
    formText?: string | React.ReactNode;
    value: any;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    readonly?: boolean;
    height?: number;
    size?: InputSize;
    brand?: boolean;
    type?: `secondary`;
    appendTextToValue?: string;
    children?: React.ReactNode;
    rows?: number;
    showBacklight?: boolean;
    textareaStyle?: CSSProperties;
    required?: boolean;
}

const TextArea: React.FC<TextAreaProps> = observer(
    ({
        value,
        onChange,
        placeholder,
        formText,
        formName,
        size = "medium",
        height: propHeight,
        readonly,
        brand,
        type,
        appendTextToValue,
        children,
        rows,
        showBacklight,
        textareaStyle,
        required,
    }) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const handleResize = () => {
            if (!propHeight && textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };
        const [isInputFocused, setIsInputFocused] = useState(false);

        const handleInputFocus = (): void => {
            setIsInputFocused(true);
        };
        const handleInputBlur = (): void => {
            setIsInputFocused(false);
        };

        useEffect(() => {
            handleResize();
        }, [propHeight, value]);

        const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
            handleResize();
            if (onChange) {
                onChange(event);
            }
        };

        const formNameText = required ? (
            <>
                {formName}
                <span className={clsx(styles.required)}>*</span>
            </>
        ) : (
            formName
        );

        return (
            <div className={styles.commentBlock}>
                {formName && (
                    <div className={clsx(styles.formName, styles[size])}>{formNameText}</div>
                )}
                <div style={{ borderRadius: 8, overflow: "hidden", position: "relative" }}>
                    <textarea
                        style={{
                            height: propHeight,
                            overflowY: propHeight ? "auto" : undefined,
                            ...textareaStyle,
                        }}
                        ref={textareaRef}
                        disabled={readonly}
                        className={clsx(styles.textarea, styles[size], {
                            [styles.readonly]: readonly,
                            [styles.brand]: brand,
                            [styles.secondary]: type === `secondary`,
                            [styles.textareaAfterFocus]: value?.length > 0,
                        })}
                        onChange={handleChange}
                        value={(value ?? "") + (appendTextToValue ?? "")}
                        placeholder={placeholder}
                        rows={rows}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    {isInputFocused && (
                        <div className={clsx(styles.focusedBorder, brand && styles.brand)} />
                    )}
                </div>
                {formText && <div className={clsx(styles.formText, styles[size])}>{formText}</div>}
                {children}
                {showBacklight && !isInputFocused && (
                    <Backlight style={{ top: formName ? 28 : 0 }} />
                )}
            </div>
        );
    },
);

export default TextArea;
