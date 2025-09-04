import { useState } from "react";
import { PasswordInput } from "src/ui/components/inputs/PasswordInput/PasswordInput.tsx";
import styles from "./style.module.scss";
import { IconAttention, IconCheckmark, IconClose, IconEmail } from "src/ui/assets/icons";
import classNames from "classnames";
import axios from "axios";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { domain } from "src/shared/config/domain.ts";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";
import useWindowDimensions from "src/shared/utils/useWindowDimensions.ts";

export const CreatePass = ({
    code,
    passIsChange,
    email,
    onClickRecover,
}: {
    code: string;
    email: string;
    passIsChange: () => void;
    onClickRecover: () => void;
}) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState(false);
    const haveANumberRegex = /\d/;
    const haveANumber = haveANumberRegex.test(value);

    const haveAbigCharrRegex = /[A-Z]/;
    const haveAbigChar = haveAbigCharrRegex.test(value);

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
        setValue(generatedPassword);
    };

    const SEND_PASS_ENDPOINT = `${domain}/api/auth/recovery/changePassword`;
    const data = {
        code: code,
        newPassword: value,
    };
    const onClick = () => {
        axios
            .post(SEND_PASS_ENDPOINT, data, { withCredentials: true })
            .then(() => {
                passIsChange();
                onClickRecover();
            })
            .catch(() => setError(true));
    };
    const { width, height } = useWindowDimensions();
    return (
        <>
            <div className={styles.head}>
                <ButtonIcon onClick={() => onClickRecover} mode={"neutral"} type={"outlined"}>
                    <IconClose />
                </ButtonIcon>

                <Status iconBefore={<IconEmail />}>{email}</Status>
            </div>

            <PasswordInput
                placeholder={"Придумайте пароль"}
                brand={true}
                value={value}
                onChange={setValue}
                showName={false}
            />
            <div className={styles.checkBlock}>
                <div
                    className={classNames(styles.checkBlockItem, {
                        [styles.active]: value.length >= 8,
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

            <div>
                <Button fullWidth={true} onClick={generatePassword} mode="neutral" type="secondary">
                    Сгенерировать автоматически
                </Button>
            </div>
            {error && (
                <div style={{ marginTop: width > 767 ? 20 : 16 }}>
                    {" "}
                    <Alert
                        mode="negative"
                        title={"Что-то пошло не так!"}
                        subtitle="Попробуйте повторить позднее"
                        icon={<IconAttention />}
                    />
                </div>
            )}
            <div className={styles.buttonBlock}>
                <Button
                    fullWidth={true}
                    mode={`brand`}
                    onClick={onClick}
                    disabled={!(value.length >= 8 && haveAbigChar && haveANumber)}
                    size="large"
                >
                    Установить пароль
                </Button>
            </div>
        </>
    );
};
