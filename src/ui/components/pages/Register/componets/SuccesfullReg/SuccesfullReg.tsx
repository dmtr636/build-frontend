import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SuccesfullReg.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { IconSuccess } from "src/ui/assets/icons";
import axios from "axios";
import { LOGIN_ENDPOINT } from "src/shared/api/endpoints.ts";

const SuccesfullReg = ({ email, password }: { email: string; password: string }) => {
    const navigate = useNavigate();
    useEffect(() => {
        axios.post(LOGIN_ENDPOINT, { email, password, rememberMe: true }).then(() => {});
        const timer = setTimeout(() => {
            axios.post(LOGIN_ENDPOINT, { email, password, rememberMe: true }).then(() => {
                location.pathname = "/admin";
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className={styles.container}>
            <Typo variant={`h4`}>Уже загружаем...</Typo>
            <Typo className={styles.text} variant={`bodyXL`}>
                Пожалуйста, подождите
            </Typo>
            <div className={styles.alert}>
                <Alert
                    icon={<IconSuccess />}
                    mode={`positive`}
                    title={`Успешная регистрация`}
                ></Alert>
            </div>
        </div>
    );
};

export default SuccesfullReg;
