import React, { useLayoutEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import {
    IconCheckmark,
    IconFlag,
    IconGroup,
    IconHome,
    IconInfo,
    IconProject,
    IconSuccess,
    IconTime,
} from "src/ui/assets/icons";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar.tsx";
import { appStore, notificationStore, objectStore, userStore } from "src/app/AppStore.ts";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { clsx } from "clsx";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { Notification } from "src/ui/components/solutions/Notification/Notification.tsx";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { NotificationDTO } from "src/features/notification/types/notification.ts";
import { observer } from "mobx-react-lite";

function getShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/); // разделяем по пробелам
    const [lastName = "", firstName = "", patronymic = ""] = parts;

    const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic[0].toUpperCase()}.` : "";

    return [lastName, firstInitial, patronymicInitial].filter(Boolean).join(" ");
}

function parseNotificationType(
    type:
        | "ADMONITION"
        | "VIOLATION"
        | "VIOLATION_COMMENT"
        | "WORK_COMMENT"
        | "WORK_STATUS_UPDATE"
        | "VIOLATION_STATUS_UPDATE",
): "violation" | "comment" | "text" | "ADMONITION" | "VIOLATION_STATUS_UPDATE" | "WORK_COMMENT" {
    switch (type) {
        case "ADMONITION":
            return "ADMONITION";
        case "VIOLATION":
            return "violation";
        case "VIOLATION_COMMENT":
            return "comment";
        case "WORK_COMMENT":
            return "WORK_COMMENT";
        case "WORK_STATUS_UPDATE":
            return "text";
        case "VIOLATION_STATUS_UPDATE":
            return "VIOLATION_STATUS_UPDATE";
        default:
            return "text";
    }
}

const Header = observer(() => {
    const logout = async () => {
        await appStore.accountStore.logout();
        window.location.pathname = "/auth/login";
    };
    const currentUser = appStore.accountStore.currentUser;
    const notification = notificationStore.notifications;

    const notificationsArray: any = notification.map((n) => ({
        id: n.id,
        date: n.createdAt,
        text: n.projectName,
        userName: getShortName(splitFullName(userStore.userById(n.authorId) as any)),
        userImg: userStore.userById(n.authorId)?.imageId,
        projId: n.projectId,
        img: objectStore.ObjectMap.get(n.projectId)?.imageId,
        body: {
            text: n.content,
            type: parseNotificationType(n.type),
        },
    }));
    const navigate = useNavigate();

    const onClickNotification = (notification: Notification) => {
        const { projId, body } = notification;
        if (!body) return;

        const { type } = body;
        notificationStore.notificationIsRead(notification.id);
        if (type === "violation" || type === "VIOLATION_STATUS_UPDATE" || type === "comment") {
            navigate(`/admin/journal/${projId}/violations`);
        } else if (type === "WORK_COMMENT" || type === "text") {
            navigate(`/admin/journal/${projId}/status`);
        } else {
            navigate(`/admin/journal/${projId}`);
        }
    };

    useLayoutEffect(() => {
        notificationStore.fetchUnreadNotifications();
    }, []);
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
                            Объекты
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
                            История
                        </div>
                    )}
                </NavLink>
                <NavLink
                    to={"/admin/dictionaries"}
                    className={({ isActive }) => clsx(styles.link, { [styles.active]: isActive })}
                >
                    {() => (
                        <div className={styles.linkItem}>
                            <div className={styles.linkItemIcon}>
                                <IconInfo />
                            </div>
                            Справочники
                        </div>
                    )}
                </NavLink>
                <div style={{ marginLeft: "auto" }}>
                    <Notification
                        notifications={notificationsArray}
                        onNotificationClick={onClickNotification}
                    />
                </div>
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
                    <div className={styles.profile}>
                        {getNameInitials(currentUser ?? undefined)}

                        <Avatar
                            photoUrl={
                                currentUser?.imageId
                                    ? `${GET_FILES_ENDPOINT}/${currentUser?.imageId}`
                                    : undefined
                            }
                            userName={currentUser?.name}
                        />
                    </div>
                </SingleDropdownList>
            </div>
        </div>
    );
});

export default Header;
