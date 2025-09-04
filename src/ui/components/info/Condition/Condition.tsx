import styles from "./Condition.module.scss";
import { IconCheckmark } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface ConditionProps {
    active: boolean;
    text: string;
}

export const Condition = (props: ConditionProps) => {
    const { active, text }: ConditionProps = props;

    const containerClassName = clsx(styles.container, { [styles.active]: active });

    return (
        <div className={containerClassName}>
            <IconCheckmark />
            <Typo variant={"actionL"}>{text}</Typo>
        </div>
    );
};
