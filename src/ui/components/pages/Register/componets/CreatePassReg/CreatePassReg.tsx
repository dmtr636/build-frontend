import { FormEvent, useEffect } from "react";
import { PasswordInput } from "src/ui/components/inputs/PasswordInput/PasswordInput.tsx";
import styles from "./styles.module.scss";
import { IconCheckmark, IconClose, IconEmail } from "src/ui/assets/icons";
import classNames from "classnames";

import { Button } from "src/ui/components/controls/Button/Button.tsx";

import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";
import axios from "axios";
import { REGISTER_SET_PASSWORD_ENDPOINT } from "src/shared/api/endpoints.ts";

export const CreatePassReg = ({
    setStep,
    email,
    code,
    password,
    setPassword,
}: {
    code: string;
    email: string;
    setStep: (step: number) => void;
    password: string;
    setPassword: (step: string) => void;
    /*onClickRecover: () => void;*/
}) => {
    const haveANumberRegex = /\d/;
    const haveANumber = haveANumberRegex.test(password);

    const haveAbigCharrRegex = /[A-Z]/;
    const haveAbigChar = haveAbigCharrRegex.test(password);
    /*
    const latinRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;
*/
    const generatePassword = () => {
        const lowercaseLetters = "abcdefghijkmnpqrstuvwxyz";
        const uppercaseLetters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const numbers = "123456789";

        const getRandomCharacter = (characters: string) => {
            const values = new Uint32Array(1);
            crypto.getRandomValues(values);
            const randomIndex = values[0] % characters.length;
            return characters[randomIndex];
        };

        const shuffleString = (str: string) => {
            const shuffledArray = Array.from(str);
            for (let i = shuffledArray.length - 1; i > 0; i--) {
                const jValues = new Uint32Array(1);
                crypto.getRandomValues(jValues);
                const j = jValues[0] % (i + 1);
                [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
            }
            return shuffledArray.join("");
        };

        let generatedPassword = "";
        generatedPassword += getRandomCharacter(lowercaseLetters);
        generatedPassword += getRandomCharacter(uppercaseLetters);
        generatedPassword += getRandomCharacter(numbers);

        const remainingLength = 10 - generatedPassword.length;
        const allCharacters = lowercaseLetters + uppercaseLetters + numbers;
        for (let i = 0; i < remainingLength; i++) {
            generatedPassword += getRandomCharacter(allCharacters);
        }

        generatedPassword = shuffleString(generatedPassword);
        setPassword(generatedPassword);
    };

    useEffect(() => {
        setPassword(``);
    }, []);
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (password.length >= 8 && haveAbigChar && haveANumber) {
            setStep(5);
        }
    };
    const onClick = () => {
        axios
            .post(REGISTER_SET_PASSWORD_ENDPOINT, { code: code, newPassword: password })
            .then(() => {
                setStep(3);
            });
    };
    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <div className={styles.head}>
                <ButtonIcon onClick={() => setStep(0)} mode={"neutral"} type={"outlined"}>
                    <IconClose />
                </ButtonIcon>

                <Status iconBefore={<IconEmail />}>{email}</Status>
            </div>

            <div className={styles.input}>
                <PasswordInput
                    brand={true}
                    autoFocus={true}
                    placeholder="Придумайте пароль"
                    value={password}
                    onChange={setPassword}
                    showName={false}
                />
            </div>

            <div className={styles.checkBlock}>
                <div
                    className={classNames(styles.checkBlockItem, {
                        [styles.active]: password.length >= 8,
                    })}
                >
                    <IconCheckmark />
                    Содержит 8 символов
                </div>
                <div
                    className={classNames(styles.checkBlockItem, {
                        [styles.active]: haveAbigChar,
                    })}
                >
                    <IconCheckmark />
                    Есть заглавная буква
                </div>

                <div
                    className={classNames(styles.checkBlockItem, {
                        [styles.active]: haveANumber,
                    })}
                >
                    <IconCheckmark />
                    Имеется одна цифра
                </div>
            </div>

            <Button fullWidth={true} onClick={generatePassword} mode="neutral" type="secondary">
                Сгенерировать автоматически
            </Button>

            <div className={styles.buttonBlock}>
                <Button
                    mode={`brand`}
                    fullWidth={true}
                    onClick={onClick}
                    disabled={
                        !(
                            (password.length >= 8 && haveAbigChar && haveANumber) /*&&
                                latinRegex.test(password)*/
                        )
                    }
                    size="large"
                >
                    Зарегистрироваться
                </Button>
            </div>
        </form>
    );
};
