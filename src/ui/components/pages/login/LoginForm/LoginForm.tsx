import React, { FormEvent, ReactNode } from "react";
import styles from "./style.module.scss";
import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import { PasswordInput } from "src/ui/components/inputs/PasswordInput/PasswordInput.tsx";
import { IconAttention, IconSuccess } from "src/ui/assets/icons";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";

interface loginFormProps {
    logo: ReactNode | string;
    email: string;
    password: string;
    isChecked: boolean;
    onChangeEmail: (email: string) => void;
    onChangePassword: (pass: string) => void;
    onChangeChecked: (isChecked: boolean) => void;
    onClickEnter: () => void;
    recover?: boolean;
    onClickRecover?: () => void;
    showAlert: boolean;
    subtitleAlertext: () => string | string;
    titleAlertText: () => string | string;
    error: boolean;
    blockButton?: boolean;
    passIsChange: boolean;
    isLoading?: boolean;
    fullwidthButton?: boolean;
    brand?: boolean;
}

export const LoginForm = ({
    logo,
    email,
    password,
    onChangeEmail,
    onChangePassword,
    onClickEnter,
    onClickRecover,
    recover = true,
    subtitleAlertext,
    showAlert = false,
    error,
    blockButton,
    titleAlertText,
    passIsChange,
    isLoading = false,
    fullwidthButton,
}: loginFormProps) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const disabledButton = !(password && emailRegex.test(email.trim()));
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onClickEnter();
    };
    return (
        <div className={styles.container}>
            <div className={styles.logo}>{logo} </div>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputs} onSubmit={handleSubmit}>
                    <EmailInput
                        autofocus={true}
                        formName={``}
                        value={email}
                        onChange={onChangeEmail}
                        error={error}
                    />
                    <PasswordInput
                        showName={false}
                        value={password}
                        onChange={onChangePassword}
                        error={error}
                    />
                </div>
                {showAlert && (
                    <div className={styles.alert}>
                        {passIsChange ? (
                            <Alert
                                mode="positive"
                                title={"Новый пароль установлен"}
                                icon={<IconSuccess />}
                            />
                        ) : (
                            <Alert
                                mode="negative"
                                title={titleAlertText()}
                                subtitle={subtitleAlertext()}
                                icon={<IconAttention />}
                            />
                        )}
                    </div>
                )}
                <div className={styles.buttonsBLock}>
                    <div className={styles.enterButton}>
                        <Button
                            isSubmit={true}
                            loading={isLoading}
                            disabled={blockButton || disabledButton}
                            onClick={onClickEnter}
                            type="primary"
                            size="large"
                            mode={"accent"}
                            fullWidth={fullwidthButton}
                        >
                            Войти
                        </Button>
                    </div>
                    {recover && (
                        <div className={styles.recoverButton}>
                            <Button
                                onClick={onClickRecover}
                                type="tertiary"
                                pale={true}
                                size="large"
                                mode="neutral"
                                fullWidth={true}
                            >
                                Не помню пароль
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
