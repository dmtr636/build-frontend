import styles from "./Accordion.module.scss";
import { ReactNode, useRef, useState } from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconArrowDown } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";

interface AccordionProps {
    title: string;
    content: ReactNode;
    counter?: number;
    defaultExpanded?: boolean;
}

export const Accordion = (props: AccordionProps) => {
    const [expanded, setExpanded] = useState(props.defaultExpanded ?? false);
    const [hover, setHover] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className={clsx(styles.container, { [styles.expanded]: expanded })}>
            <button
                className={clsx(styles.titleRow, { [styles.expanded]: expanded })}
                onClick={() => setExpanded(!expanded)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <Typo variant={"subheadXL"}>{props.title}</Typo>
                <div className={styles.actions}>
                    {!!props.counter && !expanded && (
                        <Counter size={"large"} value={props.counter} mode={"neutral"} />
                    )}
                    <ButtonIcon hover={hover} mode={"neutral"}>
                        <IconArrowDown
                            className={clsx(styles.icon, { [styles.expanded]: expanded })}
                        />
                    </ButtonIcon>
                </div>
            </button>
            <div
                ref={ref}
                className={styles.content}
                style={{ height: expanded ? (ref.current?.scrollHeight ?? "auto") : 0 }}
            >
                {props.content}
            </div>
        </div>
    );
};
