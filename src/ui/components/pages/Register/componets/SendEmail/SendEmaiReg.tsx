import React, { FormEvent, useEffect, useState } from "react";
import styles from "./sendEmail.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import axios from "axios";
import { DEMO_LOGIN_ENDPOINT, REGISTER_SEND_EMAIL_ENDPOINT } from "src/shared/api/endpoints.ts";
import { useNavigate } from "react-router-dom";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import useWindowDimensions from "src/shared/utils/useWindowDimensions.ts";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { useIsTgApp } from "src/shared/hooks/useIsTgApp.ts";

const SendEmaiReg = ({
    email,
    setEmail,
    setStep,
    setCount,
}: {
    email: string;
    setEmail: (email: string) => void;
    setStep: (n: number) => void;
    setCount: (n: number) => void;
}) => {
    const [error, setError] = React.useState<boolean>(false);
    const [alreadyExists, setAlreadyExists] = React.useState(false);
    const [acceptRules, setAcceptRules] = useState(false);
    const [acceptAdvertise, setAcceptAdvertise] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const disabledButton = !emailRegex.test(email.trim()) || !acceptRules;

    const isTgApp = useIsTgApp();

    useEffect(() => {
        if (email.length > 0) {
            setAlreadyExists(false);
            setError(false);
        }
    }, [email]);
    useEffect(() => {
        setEmail(``);
    }, []);

    useEffect(() => {
        localStorage.setItem("userAcceptAdvertising", JSON.stringify(acceptAdvertise));
    }, [acceptAdvertise]);

    const onClick = () => {
        axios
            .post(REGISTER_SEND_EMAIL_ENDPOINT, { email: email })
            .then(() => {
                setStep(1);
            })
            .catch((error) => {
                if (error.response.data.error.code === `AlreadyExistsException`) {
                    setError(true);
                    setAlreadyExists(true);
                }
                if (error.response.data.error.code === `ThrottledException`) {
                    if (error.response.data.error.data.retryDelaySeconds < 61) {
                        setCount(error.response.data.error.data.retryDelaySeconds);
                        setStep(1);
                    }
                }
            });
    };
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!disabledButton && !alreadyExists) {
            onClick();
        }
    };
    const navigate = useNavigate();
    const { width, height } = useWindowDimensions();

    return (
        <div className={styles.container}>
            <div className={styles.demoButton}>
                <Button
                    type={"secondary"}
                    mode={"brand"}
                    onClick={() => {
                        axios
                            .post(DEMO_LOGIN_ENDPOINT)
                            .then(() => {
                                (window as any).ym(
                                    99227134,
                                    "reachGoal",
                                    isTgApp
                                        ? "ym-goal-create-demo-tg-app"
                                        : "ym-goal-create-demo-web",
                                );
                                //TODO
                                //accountStore.setUser(response.data);
                                location.pathname = "/admin";
                            })
                            .catch((error) => {
                                snackbarStore.showNegativeSnackbar(
                                    "Не удалось создать демо-аккаунт",
                                );
                                console.error(error);
                            });
                    }}
                >
                    Попробовать без регистрации
                </Button>
            </div>
            <Typo
                className={styles.register}
                style={{ marginBottom: 8, textAlign: "center" }}
                variant={`h4`}
            >
                Регистрация
            </Typo>
            <Typo
                style={{ marginBottom: width < 767 ? 16 : 20, textAlign: "center" }}
                mode={"neutral"}
                type={"tertiary"}
                variant={`subheadL`}
            >
                Начните бесплатно — 14 дней
            </Typo>
            <form onSubmit={handleSubmit}>
                <EmailInput
                    autofocus={true}
                    formName={``}
                    brand={true}
                    formText={alreadyExists ? `Данная почта уже зарегистрирована` : ``}
                    error={error}
                    value={email}
                    onChange={setEmail}
                ></EmailInput>
            </form>
            <div className={styles.buttonBlock}>
                {alreadyExists && (
                    <Button
                        onClick={() => navigate(`/auth/login`)}
                        mode={`neutral`}
                        size={"large"}
                        type={`outlined`}
                    >
                        Использовать вход
                    </Button>
                )}
                <Button
                    mode={`brand`}
                    fullWidth={true}
                    disabled={disabledButton || alreadyExists}
                    onClick={onClick}
                    size={"large"}
                >
                    Далее
                </Button>
            </div>
            <div className={styles.dividerBlock}>
                <div className={styles.divider}></div>
                или <div className={styles.divider}></div>
            </div>
            <div className={styles.aceptRules}>
                <FlexColumn gap={12}>
                    <Flex align={"start"}>
                        <Checkbox
                            onChange={(checked) => setAcceptRules(checked)}
                            checked={acceptRules}
                        />
                        <Typo variant={"bodyS"} style={{ textAlign: "start" }}>
                            Я&nbsp;принимаю условия{" "}
                            <a
                                style={{ color: "#2053D5", cursor: "pointer" }}
                                href={"/documentation/user-agreement"}
                                target={"_blank"}
                                rel="noreferrer"
                            >
                                Пользовательского соглашения
                            </a>{" "}
                            и&nbsp;
                            <a
                                style={{ color: "#2053D5", cursor: "pointer" }}
                                href={"/documentation/privacy-policy"}
                                target={"_blank"}
                                rel="noreferrer"
                            >
                                Политики в&nbsp;отношении обработки персональных данных
                            </a>{" "}
                            и&nbsp;даю{" "}
                            <a
                                style={{ color: "#2053D5", cursor: "pointer" }}
                                href={"/documentation/personal-data"}
                                target={"_blank"}
                                rel="noreferrer"
                            >
                                согласие
                            </a>{" "}
                            на&nbsp;обработку моих персональных данных для целей регистрации
                            и&nbsp;использования сервиса.
                        </Typo>
                    </Flex>
                    <Flex align={"start"}>
                        <Checkbox
                            onChange={(checked) => setAcceptAdvertise(checked)}
                            checked={acceptAdvertise}
                        />
                        <Typo variant={"bodyS"} style={{ textAlign: "start" }}>
                            Даю согласие на&nbsp;получение рекламно-информационных материалов
                            на&nbsp;e-mail от&nbsp;expfolio.com и&nbsp;ознакомлен(а) с&nbsp;
                            <a
                                style={{ color: "#2053D5", cursor: "pointer" }}
                                href={"/documentation/advertising"}
                                target={"_blank"}
                                rel="noreferrer"
                            >
                                Согласием на&nbsp;получение рекламно-информационных материалов
                            </a>
                            .
                        </Typo>
                    </Flex>
                </FlexColumn>
            </div>
            <div className={styles.noAcc}>
                Есть аккаунт?{" "}
                <a className={styles.rega} href={`/auth/login`}>
                    &nbsp;Войти
                </a>
            </div>
        </div>
    );
};

export default SendEmaiReg;
