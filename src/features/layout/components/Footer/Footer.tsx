import styles from "./footer.module.scss";
import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { observer } from "mobx-react-lite";

export interface FooterProps {
    actions: {
        name: string;
        icon?: React.ReactNode;
        to: string;
        counter?: number;
        /*
                counterType?: 'primary' | 'secondary'
        */
    }[];
}

const Footer = observer(({ actions }: FooterProps) => {
    return (
        <div className={styles.container}>
            {actions.map((item, index) => (
                <NavLink
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                    to={item.to}
                    key={index}
                >
                    <div className={styles.iconContainer}>
                        {" "}
                        {item.icon}{" "}
                        {item.counter && (
                            <div className={styles.counter}>
                                {item.counter /*> 99 ? '99+' : item.counter*/}
                            </div>
                        )}
                    </div>
                    {item.name}
                </NavLink>
            ))}
        </div>
    );
});

export default Footer;
