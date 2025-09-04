import { useState } from "react";
import styles from "./style.module.scss";
import { SendEmail } from "./SendEmail/SendEmail.tsx";
import { CheckCode } from "./CheckCode/CheckCode.tsx";
import { CreatePass } from "./CreatePass/CreatePass.tsx";

export const RecoveryForm = ({
    onClickRecover,
    passIsChange,
}: {
    onClickRecover: () => void;
    passIsChange: () => void;
}) => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [delay, setDelay] = useState(60);
    return (
        <div className={styles.container}>
            {step === 0 && (
                <SendEmail
                    onClickRecover={onClickRecover}
                    email={email}
                    setDelay={setDelay}
                    setEmail={setEmail}
                    setStep={setStep}
                />
            )}
            {step === 1 && (
                <CheckCode delay={delay} email={email} setCode={setCode} setStep={setStep} />
            )}
            {step === 2 && (
                <CreatePass
                    email={email}
                    passIsChange={passIsChange}
                    onClickRecover={onClickRecover}
                    code={code}
                />
            )}
        </div>
    );
};
