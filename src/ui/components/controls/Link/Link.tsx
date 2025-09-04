import styles from "./Link.module.scss";
import { IconArrowTopRight } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { LinkSize } from "./Link.types.ts";
import { observer } from "mobx-react-lite";

interface LinkProps {
    href: string;
    firstLine: string;
    secondLine?: string;
    size?: LinkSize;
    disableVisited?: boolean;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Link = observer((props: LinkProps) => {
    const {
        href,
        firstLine,
        secondLine,
        size = "small",
        disableVisited,
        onClick,
    }: LinkProps = props;
    const linkClassName = clsx(styles.link, styles[size], {
        [styles.disableVisited]: disableVisited,
    });

    return (
        <a
            className={linkClassName}
            href={href}
            target={"_blank"}
            rel="noreferrer"
            onClick={onClick}
        >
            <div className={styles.lines}>
                <div className={styles.line}>
                    <div className={styles.text}>{firstLine}</div>
                    {!secondLine && <IconArrowTopRight className={styles.icon} />}
                </div>
                {secondLine && (
                    <div className={styles.line}>
                        <div className={styles.text}>{secondLine}</div>
                        <IconArrowTopRight className={styles.icon} />
                    </div>
                )}
            </div>
        </a>
    );
});
