import React, { Profiler, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconFlag, IconGroup, IconHome, IconProject, IconTime } from "src/ui/assets/icons";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar.tsx";
import { appStore } from "src/app/AppStore.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { clsx } from "clsx";

const Header = () => {
    const logout = async () => {
        await appStore.accountStore.logout();
        window.location.pathname = "/auth/login";
    };
    const currentUser = appStore.accountStore.currentUser;
    console.log(currentUser);
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <NavLink
                    to={"/admin/home"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {({ isActive }) => (
                        <Button
                            mode={"neutral"}
                            type={"text"}
                            pale={!isActive}
                            size={"small"}
                            iconBefore={<IconHome />}
                        >
                            Главная
                        </Button>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/journal"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {({ isActive }) => (
                        <Button
                            mode={"neutral"}
                            type={"text"}
                            pale={!isActive}
                            size={"small"}
                            iconBefore={<IconProject />}
                        >
                            Журнал объектов
                        </Button>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/organizations"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {({ isActive }) => (
                        <Button
                            mode={"neutral"}
                            type={"text"}
                            pale={!isActive}
                            size={"small"}
                            iconBefore={<IconFlag />}
                        >
                            Организации
                        </Button>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/users"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {({ isActive }) => (
                        <Button
                            mode={"neutral"}
                            type={"text"}
                            pale={!isActive}
                            size={"small"}
                            iconBefore={<IconGroup />}
                        >
                            Пользователи
                        </Button>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/events"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {({ isActive }) => (
                        <Button
                            mode={"neutral"}
                            type={"text"}
                            pale={!isActive}
                            size={"small"}
                            iconBefore={<IconTime />}
                        >
                            История действий
                        </Button>
                    )}
                </NavLink>
                <div style={{ marginLeft: "auto" }} className={styles.profile}>
                    {currentUser?.name}
                    <Avatar
                        photoUrl={`${GET_FILES_ENDPOINT}/${currentUser?.imageId}`}
                        dropdownListOptions={[
                            { name: "Профиль" },
                            {
                                name: "Выйти",
                                mode: "negative",
                                onClick: () => {
                                    logout();
                                },
                            },
                        ]}
                        userName={currentUser?.name}
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
