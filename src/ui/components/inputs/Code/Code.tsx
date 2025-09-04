import React from "react";
import classNames from "classnames";
import RICIBs from "react-individual-character-input-boxes";
import styles from "./Code.module.scss";

const Code = ({
    setValue,
    error = false,
    isPassword = false,
    disabled = false,
    amount = 4,
    autoFocus = true,
    brand,
    className,
    inputRegExp,
}: {
    value?: string;
    setValue: (v: string) => void;
    error?: boolean;
    isPassword?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    amount?: number;
    brand?: boolean;
    inputRegExp?: RegExp;
    className?: string;
}) => {
    const inputProps = [
        {
            placeholder: " ",
            className: classNames(
                styles.firstInput,
                {
                    [styles.password]: isPassword,
                    [styles.error]: error,
                    [styles.disabled]: disabled,
                    [styles.brand]: brand,
                },
                className,
            ),
            inputMode: "numeric",
        },
        ...Array.from({ length: amount - 1 }).map((_v) => ({
            placeholder: " ",
            className: classNames(
                styles.input,
                {
                    [styles.password]: isPassword,
                    [styles.brand]: brand,
                    [styles.error]: error,
                    [styles.disabled]: disabled,
                },
                className,
            ),
            inputMode: "numeric",
        })),
    ];
    return (
        <>
            <RICIBs
                amount={amount}
                handleOutputString={setValue}
                inputRegExp={inputRegExp ? inputRegExp : /^[0-9]$/}
                autoFocus={autoFocus}
                inputProps={inputProps}
            />
        </>
    );
};

export default Code;
