import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import styles from "./style.module.scss";
import axios from "axios";
import { FormEvent, useState } from "react";
import { IconClose, IconError } from "src/ui/assets/icons";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { domain } from "src/shared/config/domain.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import useWindowDimensions from "src/shared/utils/useWindowDimensions.ts";

export const SendEmail = ({
    setStep,
    email,
    setEmail,
    setDelay,
}: {
    setStep: (num: number) => void;
    email: string;
    setEmail: (email: string) => void;
    onClickRecover: () => void;
    setDelay: (num: number) => void;
}) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValid = emailRegex.test(email);
    const SEND_EMAIL_ENDPOINT = `${domain}/api/auth/recovery/sendCode`;
    const data = {
        email: email,
    };
    const onClick = () => {
        axios
            .post(SEND_EMAIL_ENDPOINT, data, { withCredentials: true })
            .then(() => {
                /*
                setEmail("");
*/
                setShowError(false);
                setStep(1);
            })
            .catch((error) => {
                if (error.response.data.error.code === `ThrottledException`) {
                    if (error.response.data.error.data.retryDelaySeconds < 61) {
                        setDelay(error.response.data.error.data.retryDelaySeconds);
                        setStep(1);
                    }
                }
                setShowError(true);
            });
    };

    const [showError, setShowError] = useState(false);
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (isValid) {
            onClick();
        }
    };
    const { width, height } = useWindowDimensions();
    return (
        <>
            <ButtonIcon
                size={width > 767 ? "large" : "medium"}
                onClick={() => (location.pathname = "/auth/login")}
                mode={"neutral"}
                type={"outlined"}
            >
                <IconClose />
            </ButtonIcon>
            <div className={styles.header}>
                <Typo variant={`h4`}>Восстановление пароля</Typo>
            </div>
            <div className={styles.text}>
                <Typo type={`secondary`} variant={`bodyXL`}>
                    На указанную почту будет отправлен код для восстановления
                </Typo>
            </div>
            <form onSubmit={handleSubmit}>
                <EmailInput
                    brand={true}
                    autofocus={true}
                    value={email}
                    onChange={setEmail}
                    showName={false}
                />
            </form>
            {showError && (
                <div className={styles.alert}>
                    <Alert
                        mode="negative"
                        title={`Почта не зарегистрирована`}
                        icon={<IconError />}
                    />
                </div>
            )}
            <div className={styles.buttonBlock}>
                <Button
                    mode={`brand`}
                    fullWidth={true}
                    onClick={onClick}
                    disabled={!isValid}
                    size="large"
                >
                    Далее
                </Button>

                {/* <Button
                    onClick={() => (location.pathname = "/auth/login")}
                    mode="neutral"
                    type="tertiary"
                    size="large"
                >
                    Отмена
                </Button>*/}
            </div>
        </>
    );
};
