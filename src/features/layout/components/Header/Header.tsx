import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { IconFlag, IconGroup, IconHome, IconProject, IconTime } from "src/ui/assets/icons";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar.tsx";
import { appStore } from "src/app/AppStore.ts";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { clsx } from "clsx";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";

const Header = () => {
    const logout = async () => {
        await appStore.accountStore.logout();
        window.location.pathname = "/auth/login";
    };
    const currentUser = appStore.accountStore.currentUser;

    const navigate = useNavigate();
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <NavLink
                    to={"/admin/home"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconHome />
                            </div>
                            Главная
                        </div>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/journal"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconProject />
                            </div>
                            Журнал объектов
                        </div>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/organizations"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconFlag />
                            </div>
                            Организации
                        </div>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/users"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconGroup />
                            </div>
                            Пользователи
                        </div>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/events"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconTime />
                            </div>
                            История действий
                        </div>
                    )}
                </NavLink>
                <SingleDropdownList
                    tipPosition={"top-center"}
                    hideTip={true}
                    options={[
                        {
                            name: "Профиль",
                            mode: "neutral",
                            onClick: () => {
                                navigate(`/admin/users/${currentUser?.id}`);
                            },
                        },
                        {
                            name: "Выйти",
                            mode: "negative",
                            onClick: () => {
                                logout();
                            },
                        },
                    ]}
                >
                    <div style={{ marginLeft: "auto" }} className={styles.profile}>
                        {getNameInitials(currentUser ?? undefined)}

                        <Avatar
                            photoUrl={`${GET_FILES_ENDPOINT}/${currentUser?.imageId}`}
                            userName={currentUser?.name}
                        />
                    </div>
                </SingleDropdownList>
            </div>
        </div>
    );
};

export default Header;
