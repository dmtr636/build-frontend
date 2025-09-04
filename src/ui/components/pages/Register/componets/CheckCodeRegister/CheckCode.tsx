import { CSSProperties, ReactNode, useEffect, useState } from "react";

import axios from "axios";
import styles from "./style.module.scss";
import { IconClose, IconEmail, IconError } from "src/ui/assets/icons";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import {
    REGISTER_CHECK_CODE_ENDPOINT,
    REGISTER_SEND_EMAIL_ENDPOINT,
} from "src/shared/api/endpoints.ts";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import Code from "src/ui/components/inputs/Code/Code.tsx";
import { telegramContactLink } from "src/ui/components/pages/ErrorPage/ErrorPage.tsx";

export const CheckCodeRegister = ({
    setStep,
    email,
    setCode,
    delay,
    renderButtonBlock,
    renderWriteToUsButtonBlock,
    containerStyle,
    textAfterSend,
    hideHeader,
}: {
    setStep: (arg: number) => void;
    setCode: (arg: string) => void;
    email: string;
    delay: number;
    code: string;
    renderButtonBlock?: (
        onActionButtonClick: () => void,
        actionButtonDisabled: boolean,
    ) => ReactNode;
    renderWriteToUsButtonBlock?: () => ReactNode;
    containerStyle?: CSSProperties;
    textAfterSend?: ReactNode;
    hideHeader?: boolean;
}) => {
    const [isError, setIsError] = useState(false);
    const [errorCount, setErrorCount] = useState(3);
    const [count, setCount] = useState(0);

    const [value, setValue] = useState("");
    const [showError, setShowError] = useState(false);
    const [writeToUs, setWriteToUs] = useState(false);
    const [expire, setExpire] = useState(false);
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

    const SEND_EMAIL_ENDPOINT = REGISTER_SEND_EMAIL_ENDPOINT;
    const SEND_CODE_ENDPOINT = REGISTER_CHECK_CODE_ENDPOINT;
    const sendEmail = () => {
        setExpire(false);
        setShowError(false);
        setIsError(false);
        axios
            .post(SEND_EMAIL_ENDPOINT, { email: email }, { withCredentials: true })
            .then(() => {})
            .catch(() => setCount(count + 1));
    };
    useEffect(() => {
        setExpire(false);
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
    const sendCode = () => {
        axios
            .post(SEND_CODE_ENDPOINT, { code: value }, { withCredentials: true })
            .then(() => {
                setStep(2);
            })
            .catch((error) => {
                setShowError(true);
                setValue("");
                setIsError(true);
                setCount(count + 1);
                console.log(error.response.data.error.code);
                if (error.response.data.error?.data?.enterAttemptsLeft) {
                    setErrorCount(error.response.data.error.data.enterAttemptsLeft);
                    if (error.response.data.error.data.enterAttemptsLeft === 0) {
                        setWriteToUs(true);
                    }
                } else if (error.response.data.error.code === "ExpiredException") {
                    setExpire(true);
                } else {
                    setWriteToUs(true);
                }
            });
    };
    return (
        <>
            {!writeToUs ? (
                <div className={styles.container} style={containerStyle}>
                    {!hideHeader && (
                        <div className={styles.head}>
                            <ButtonIcon
                                onClick={() => setStep(0)}
                                mode={"neutral"}
                                type={"outlined"}
                            >
                                <IconClose />
                            </ButtonIcon>

                            <Status iconBefore={<IconEmail />}>{email}</Status>
                        </div>
                    )}
                    {!hideHeader && <div className={styles.header}>Введите код</div>}

                    <div
                        className={styles.text}
                        style={{
                            marginTop: hideHeader ? 4 : undefined,
                        }}
                    >
                        {writeToUs ? (
                            <>Для решения проблемы с авторизацией необходимо связаться с нами</>
                        ) : (
                            <>
                                {textAfterSend ?? (
                                    <>
                                        Мы отправили код на указанную почту. Проверьте папку спам,
                                        если сообщение
                                        <br /> не пришло
                                    </>
                                )}
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
                            className={styles.code}
                            key={count}
                            disabled={expire}
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
                                title={expire ? "Срок действия кода истёк." : titleAlertText()}
                                subtitle={expire ? "Необходимо получить новый." : alertText()}
                                icon={<IconError />}
                            />
                        </div>
                    )}
                    {renderButtonBlock ? (
                        renderButtonBlock(sendCode, value.length !== 4 || expire)
                    ) : (
                        <div className={styles.buttonBlock}>
                            <Button
                                mode={`brand`}
                                size={"large"}
                                fullWidth={true}
                                onClick={sendCode}
                                disabled={value.length !== 4 || expire}
                            >
                                Далее
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={styles.container}
                    style={{
                        height: "100dvh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        ...containerStyle,
                    }}
                >
                    <Typo style={{ marginBottom: 12 }} variant={"h4"}>
                        Не смогли подтвердить почту
                    </Typo>
                    <Typo style={{ width: 314 }} variant={"bodyXL"}>
                        Для решения проблемы с регистрацией необходимо связаться с нами
                    </Typo>
                    {renderWriteToUsButtonBlock ? (
                        renderWriteToUsButtonBlock()
                    ) : (
                        <div className={styles.buttonBlock}>
                            <div className={styles.writetoUse}>
                                <Button
                                    mode={`brand`}
                                    fullWidth={true}
                                    size={"large"}
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
                                    type={`tertiary`}
                                    onClick={() => setStep(0)}
                                    size={`large`}
                                >
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
