import React, { ChangeEvent, useState } from "react";
import { Input } from "../Input/Input";
import { IconDontShowPass, IconPassword, IconShowPass } from "src/ui/assets/icons";
import { InputSize } from "../Input/Input.types";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import useWindowDimensions from "src/shared/utils/useWindowDimensions.ts";

export const PasswordInput = ({
    value,
    onChange,
    disabled,
    error,
    size = "large",
    showName = true,
    brand,
    readonly,
    autoFocus,
    placeholder,
}: {
    value: string;
    onChange: (pass: string) => void;
    disabled?: boolean;
    error?: boolean;
    size?: InputSize;
    showName?: boolean;
    brand?: boolean;
    readonly?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
}) => {
    const [showPass, setShowPass] = React.useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleInputFocus = (): void => {
        setIsInputFocused(true);
    };
    const handleInputBlur = (): void => {
        setIsInputFocused(false);
    };
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onChange(event.target.value);
    };
    const buttonSize = size === "large" ? "medium" : "small";
    const { width, height } = useWindowDimensions();
    return (
        <>
            <Input
                autoFocus={autoFocus}
                placeholder={placeholder ? placeholder : "Введите пароль"}
                size={size}
                types={showPass ? "text" : "password"}
                value={value}
                onChange={handleInputChange}
                formName={showName ? "Пароль" : ""}
                startIcon={<IconPassword />}
                error={error}
                disabled={disabled}
                isFocused={isInputFocused}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                showTooltip={showPass}
                brand={brand}
                readonly={readonly}
                endIcon={
                    showPass ? (
                        <Tooltip
                            hide={width < 767}
                            tipPosition={"left-center"}
                            mode={`neutral`}
                            text={`Скрыть пароль`}
                        >
                            <ButtonIcon
                                size={buttonSize}
                                disabled={disabled}
                                type="tertiary"
                                mode="neutral"
                                pale={true}
                                onClick={() => setShowPass(!showPass)}
                            >
                                <IconShowPass />
                            </ButtonIcon>
                        </Tooltip>
                    ) : (
                        <Tooltip
                            hide={width < 767}
                            tipPosition={"left-center"}
                            mode={`neutral`}
                            text={`Показать пароль`}
                        >
                            <ButtonIcon
                                pale={true}
                                size={buttonSize}
                                disabled={disabled}
                                type="tertiary"
                                mode="neutral"
                                onClick={() => setShowPass(!showPass)}
                            >
                                <IconDontShowPass />
                            </ButtonIcon>
                        </Tooltip>
                    )
                }
            />
        </>
    );
};
