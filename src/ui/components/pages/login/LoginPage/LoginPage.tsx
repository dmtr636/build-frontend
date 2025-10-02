import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { LoginForm } from "src/ui/components/pages/login/LoginForm/LoginForm.tsx";
import axios from "axios";
import { RecoveryForm } from "src/ui/components/pages/recovery/RecoveryForm/RecoveryForm.tsx";
/* import { useNavigate } from "react-router-dom";
 */
import { LOGIN_ENDPOINT } from "src/shared/api/endpoints.ts";
import { IconBack, IconLogoLarge } from "src/ui/assets/icons";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import logoimg from "./logo.png";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
    onLogin?: () => void;
    recover?: boolean;
}

export const LoginPage = (props: LoginPageProps) => {
    const [emailValue, setEmailValue] = useState("");
    const [passValue, setPassValue] = useState("");
    const [isChecked, setIsChecked] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [errorCount, setErrorCount] = useState(6);
    const [blockTimeCount, setblockTimeCount] = useState();
    const [blockButton, setBlockbutton] = useState(false);
    const [error, setError] = useState(false);
    const [user, setUser] = useState({});
    const [showRecover, setShowRecover] = useState(false);
    const [passIsChange, setPassIsChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function getMinutesWord(minutes: number) {
        const lastDigit = minutes % 10;
        const lastTwoDigits = minutes % 100;

        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return "минута";
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return "минуты";
        } else {
            return "минут";
        }
    }

    const alertText = () => {
        if (blockTimeCount) {
            return `Блокировка: ${Math.trunc(blockTimeCount / 60)} ${getMinutesWord(Math.trunc(blockTimeCount / 60))}`;
        }
        if (errorCount <= 3) {
            return `Осталось ${errorCount} ${errorCount == 1 ? `попытка` : `попытки`}`;
        }
        return "";
    };
    const titleAlertText = () => {
        if (blockTimeCount) {
            return `Попробуйте повторить позже`;
        } else return "Неправильные почта или пароль";
    };

    const data = {
        login: emailValue?.trim(),
        password: passValue,
        rememberMe: true,
    };
    const blockButtonTimeout = (blockTimeCount: number) => {
        setBlockbutton(true);
        setTimeout(() => {
            setBlockbutton(false);
            setErrorCount(6);
        }, blockTimeCount * 1000);
    };

    const onClickEnter = () => {
        setError(false);
        setPassIsChange(false);
        setIsLoading(true);
        axios
            .post(LOGIN_ENDPOINT, data, { withCredentials: true })
            .then((response) => {
                setError(false);
                setShowAlert(false);
                setPassIsChange(false);
                setUser(response.data);
                setErrorCount(6);
                setIsLoading(false);
                props.onLogin?.();
            })
            .catch((error) => {
                setPassValue(``);
                setShowAlert(true);
                setError(true);
                setIsLoading(false);
                setErrorCount(error.response.data.error.data.remainingAttempts);
                if (error.response.data.error.data?.retryDelaySeconds) {
                    setblockTimeCount(error.response.data.error.data?.retryDelaySeconds);
                    blockButtonTimeout(error.response.data.error.data?.retryDelaySeconds);
                }
                alertText();
            });
    };

    const onClickRecover = () => {
        setShowAlert(false);
        setPassIsChange(false);
        setShowRecover(true);
    };
    useEffect(() => {
        if (passIsChange) setShowAlert(true);
    }, [passIsChange]);
    useEffect(() => {
        if (passValue.length > 0) setError(false);
    }, [passValue, emailValue]);
    useEffect(() => {
        setError(false);
    }, [emailValue]);

    return (
        <>
            <div className={styles.body}>
                <div className={styles.leftside}>
                    <img src={logoimg} className={styles.logoImgExp} />
                </div>
                <div className={styles.rightside}>
                    {showRecover ? (
                        <RecoveryForm
                            passIsChange={() => setPassIsChange(true)}
                            onClickRecover={() => setShowRecover(false)}
                        />
                    ) : (
                        <LoginForm
                            brand={true}
                            email={emailValue}
                            password={passValue}
                            onChangeChecked={setIsChecked}
                            isChecked={isChecked}
                            showAlert={showAlert}
                            onChangeEmail={setEmailValue}
                            onChangePassword={setPassValue}
                            logo={""}
                            error={error}
                            recover={/*props.recover ?? */ false}
                            blockButton={blockButton}
                            subtitleAlertext={alertText}
                            onClickEnter={onClickEnter}
                            onClickRecover={onClickRecover}
                            titleAlertText={titleAlertText}
                            passIsChange={passIsChange}
                            isLoading={isLoading}
                            fullwidthButton={true}
                        />
                    )}
                    {/*{!showRecover && (
                        <div className={styles.backButton}>
                            <ButtonIcon
                                onClick={() => navigate("/")}
                                mode={"neutral"}
                                type={"outlined"}
                            >
                                <IconBack />
                            </ButtonIcon>
                        </div>
                    )}*/}
                </div>
            </div>
            <SnackbarProvider />
        </>
    );
};
