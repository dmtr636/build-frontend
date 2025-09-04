import styles from "./style.module.scss";
import { IconCheckmark } from "src/ui/assets/icons";
import { clsx } from "clsx";

interface Props {
    title?: string | React.ReactNode;
    subtitle?: string;
    onClick?: () => void;
    valid?: boolean;
    completed?: boolean;
}

const Stepper = ({
    StepsArray,
    currentStep = -1,
    mode = "accent",
}: {
    StepsArray: Props[];
    currentStep?: number;
    mode?: "accent" | "brand";
}) => {
    return (
        <div className={styles.steppersContainer}>
            {StepsArray.map((step, i) => (
                <div style={{ cursor: "default" }} key={i} className={styles.container}>
                    <button
                        onClick={step.onClick}
                        disabled={!step.valid}
                        className={clsx(styles.Stepcontainer, {
                            [styles.active]: currentStep === i || step.completed,
                            [styles.disabled]: i > currentStep && !step.valid,
                        })}
                    >
                        <div
                            className={clsx(
                                styles.content,
                                {
                                    [styles.active]: currentStep === i || step.completed,
                                    [styles.disabled]: i > currentStep && !step.valid,
                                },
                                styles[mode],
                            )}
                        >
                            {!step.completed && i >= currentStep ? (
                                i + 1
                            ) : (
                                <IconCheckmark className={styles.Icon} />
                            )}
                        </div>
                        <div
                            className={clsx(styles.textBlock, {
                                [styles.active]: currentStep === i || step.completed,
                                [styles.disabled]: i > currentStep && !step.valid,
                            })}
                        >
                            {step.title && (
                                <div
                                    className={clsx(styles.title, {
                                        [styles.disabled]: i > currentStep && !step.valid,
                                    })}
                                >
                                    {step.title}
                                </div>
                            )}
                            {step.subtitle && (
                                <div className={styles.subtitle}>{step.subtitle}</div>
                            )}
                        </div>
                    </button>
                    {i + 1 < StepsArray.length && <div className={styles.divider}></div>}
                </div>
            ))}
        </div>
    );
};
export default Stepper;
