import { useEffect, useState } from "react";

import axios from "axios";
import styles from "./style.module.scss";
import { IconAttention, IconClose, IconEmail } from "src/ui/assets/icons";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { domain } from "src/shared/config/domain.ts";
import Code from "src/ui/components/inputs/Code/Code.tsx";
import { telegramContactLink } from "src/ui/components/pages/ErrorPage/ErrorPage.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";

export const CheckCode = ({
    setStep,
    email,
    setCode,
    delay,
}: {
    setStep: (arg: number) => void;
    setCode: (arg: string) => void;
    email: string;
    delay: number;
}) => {
    const [isError, setIsError] = useState(false);
    const [errorCount, setErrorCount] = useState(3);
    /*   const [disabledButton, setDisabledButton] = useState(true);
     */
    const [value, setValue] = useState("");
    const [showError, setShowError] = useState(false);
    const [writeToUs, setWriteToUs] = useState(false);

    const handleOutputString = (string: string) => {
        setValue(string);
        setCode(string);
        setIsError(false);
    };
    const [countdownValue, setCountdownValue] = useState(60);
    const [timer, setTimer] = useState<number | NodeJS.Timeout>();

    const startCountdown = () => {
        const newTimer = setInterval(() => {
            setCountdownValue((prevCountdownValue) => {
                if (prevCountdownValue > 1) {
                    return prevCountdownValue - 1;
                } else {
                    clearInterval(newTimer);
                    return 0;
                }
            });
        }, 1000);
        setTimer(newTimer);
    };
    const alertText = () => {
        return `Осталось ${errorCount} ${errorCount == 1 ? `попытка` : `попытки`}`;

        return "";
    };
    const titleAlertText = () => {
        return "Неправильный код";
    };

    const SEND_EMAIL_ENDPOINT = `${domain}/api/auth/recovery/sendCode`;
    const SEND_CODE_ENDPOINT = `${domain}/api/auth/recovery/checkCode`;
    const sendEmail = () => {
        axios
            .post(SEND_EMAIL_ENDPOINT, { email: email }, { withCredentials: true })
            .then(() => {})
            .catch((error) => console.error(error));
    };
    useEffect(() => {
        setCountdownValue(delay);
        startCountdown();
        return () => clearInterval(timer);
    }, []);

    const handleRestart = () => {
        sendEmail();
        clearInterval(timer);
        setCountdownValue(60);
        startCountdown();
    };

    const [count, setCount] = useState(0);
    const sendCode = () => {
        axios
            .post(SEND_CODE_ENDPOINT, { code: value }, { withCredentials: true })
            .then(() => {
                setStep(2);
            })
            .catch((error) => {
                setCount(count + 1);
                setValue(``);
                setShowError(true);
                setIsError(true);
                if (error.response.data.error.data?.enterAttemptsLeft === 0) {
                    setWriteToUs(true);
                }
                if (error.response.data.error.data?.enterAttemptsLeft) {
                    setErrorCount(error.response.data.error.data?.enterAttemptsLeft);
                } else if (error.response.data.error.message) {
                    setWriteToUs(true);
                } else console.error(error);
            });
    };

    return (
        <>
            {!writeToUs ? (
                <>
                    <div className={styles.head}>
                        <ButtonIcon onClick={() => setStep(0)} mode={"neutral"} type={"outlined"}>
                            <IconClose />
                        </ButtonIcon>

                        <Status iconBefore={<IconEmail />}>{email}</Status>
                    </div>
                    <div className={styles.header}>Восстановление пароля</div>

                    <div className={styles.text}>
                        {writeToUs ? (
                            <>Для решения проблемы с авторизацией необходимо связаться с нами</>
                        ) : (
                            <>
                                Мы отправили код на указанную почту. Проверьте папку спам, если
                                сообщение
                                <br /> не пришло
                            </>
                        )}
                    </div>
                    <div
                        className={styles.inputContainer}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                            if (event.key === "Enter") {
                                if (value.length === 4) {
                                    sendCode();
                                }
                            }
                        }}
                    >
                        <Code
                            className={styles.codes}
                            key={count}
                            inputRegExp={/^[0-9]$/}
                            error={isError}
                            autoFocus={true}
                            amount={4}
                            value={value}
                            setValue={handleOutputString}
                        />
                    </div>
                    {!writeToUs && (
                        <div className={styles.sendAgain}>
                            <Button
                                fullWidth={true}
                                disabledCounter={false}
                                counter={countdownValue > 0 ? countdownValue : undefined}
                                disabled={Boolean(countdownValue)}
                                onClick={handleRestart}
                                mode="neutral"
                                type="secondary"
                            >
                                Отправить ещё раз
                            </Button>
                        </div>
                    )}
                    {showError && (
                        <div className={styles.alert}>
                            <Alert
                                mode="negative"
                                title={titleAlertText()}
                                subtitle={alertText()}
                                icon={<IconAttention />}
                            />
                        </div>
                    )}
                    <div className={styles.buttonBlock}>
                        {writeToUs ? (
                            <Button href={telegramContactLink} target={"_blank"}>
                                Написать нам
                            </Button>
                        ) : (
                            <Button
                                fullWidth={true}
                                size={`large`}
                                mode={`brand`}
                                onClick={sendCode}
                                disabled={value.length !== 4}
                            >
                                Далее
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.writeToUsConteiner}>
                    <div className={styles.header}>Восстановление пароля</div>
                    <div style={{ marginBottom: -4 }} className={styles.text}>
                        Для решения проблемы с авторизацией необходимо связаться с нами
                    </div>
                    <div className={styles.buttonBlock}>
                        <div className={styles.writetoUse}>
                            <Button
                                mode={`brand`}
                                fullWidth={true}
                                size={`large`}
                                href={telegramContactLink}
                                target={"_blank"}
                            >
                                Написать нам
                            </Button>
                        </div>
                        <div className={styles.writetoUseEsc}>
                            <Button
                                fullWidth={true}
                                mode={`neutral`}
                                size={`large`}
                                onClick={() => setStep(0)}
                                type="tertiary"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
