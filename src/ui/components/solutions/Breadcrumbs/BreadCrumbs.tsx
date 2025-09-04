import styles from "./styles.module.scss";
import { IconArrowRight } from "src/ui/assets/icons";
import { ReactNode } from "react";
import { clsx } from "clsx";

export interface BreadCrumb {
    icon?: ReactNode;
    name: string;
    onClick?: () => void;
}

export const BreadCrumbs = ({ breadCrumbsArray }: { breadCrumbsArray: BreadCrumb[] }) => {
    return (
        <div className={styles.container}>
            {breadCrumbsArray.map((breadCrumb, index) => (
                <div
                    key={index + breadCrumb.name}
                    className={clsx(styles.crumb, {
                        [styles.active]: index === breadCrumbsArray.length - 1,
                        [styles.disabled]: !breadCrumb.onClick,
                    })}
                >
                    <button
                        className={styles.crumbButton}
                        onClick={
                            index !== breadCrumbsArray.length - 1 ? breadCrumb.onClick : () => {}
                        }
                    >
                        {breadCrumb.icon && (
                            <div className={clsx(styles.icon, styles.crumbIcon)}>
                                {breadCrumb.icon}
                            </div>
                        )}
                        <div className={styles.text}>{breadCrumb.name}</div>
                    </button>
                    {index !== breadCrumbsArray.length - 1 && (
                        <div className={styles.icon}>
                            <IconArrowRight className={styles.icon} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
