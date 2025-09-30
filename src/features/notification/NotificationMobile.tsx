import React, { useLayoutEffect, useMemo, useCallback } from "react";
import { layoutStore, notificationStore, objectStore, userStore } from "src/app/AppStore.ts";
import styles from "./notifications.module.scss";
import { fileUrl } from "src/shared/utils/file.ts";
import { IconUserRounded } from "src/ui/assets/icons";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

function getShortName(fullName: string): string {
    const parts = fullName?.trim()?.split(/\s+/) ?? [];
    const [lastName = "", firstName = "", patronymic = ""] = parts;
    const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic[0].toUpperCase()}.` : "";
    return [lastName, firstInitial, patronymicInitial].filter(Boolean).join(" ");
}

type RawType =
    | "ADMONITION"
    | "VIOLATION"
    | "VIOLATION_COMMENT"
    | "WORK_COMMENT"
    | "WORK_STATUS_UPDATE"
    | "VIOLATION_STATUS_UPDATE";

type ViewType =
    | "violation"
    | "comment"
    | "text"
    | "ADMONITION"
    | "VIOLATION_STATUS_UPDATE"
    | "WORK_COMMENT";

function parseNotificationType(type: RawType): ViewType {
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

type NotificationBody = {
    text: string;
    type: ViewType;
};

type Notification = {
    id: string;
    date: string | number | Date;
    text: string;
    userName: string;
    userImg?: string;
    projId?: string;
    img?: string;
    body: NotificationBody;
};

const renderBody = (body?: {
    type:
        | "violation"
        | "comment"
        | "text"
        | "ADMONITION"
        | "VIOLATION_STATUS_UPDATE"
        | "WORK_COMMENT";
    text?: string;
}) => {
    if (!body) return null;

    switch (body.type) {
        case "violation":
            return <div className={styles.alert}> {"Добавлено нарушение!"}</div>;
        case "ADMONITION":
            return <div className={styles.alert}> {"Добавлено замечание!"}</div>;
        case "VIOLATION_STATUS_UPDATE":
            return <div className={styles.alert}> {"Статус нарушения обновлен!"}</div>;
        case "comment":
            return (
                <div className={styles.comment}>
                    {" "}
                    <span style={{ color: "#5F6A81" }}>Комментарий:</span> {body.text}
                </div>
            );
        case "WORK_COMMENT":
            return (
                <div className={styles.comment}>
                    {" "}
                    <span style={{ color: "#5F6A81" }}>Комментарий:</span> {body.text}
                </div>
            );

        case "text":
            return <div className={styles.textBodyRender}>{body.text}</div>;

        default:
            return null;
    }
};

const NotificationMobile: React.FC = observer(() => {
    const navigate = useNavigate();

    const notificationsView: Notification[] = useMemo(() => {
        const list = notificationStore.notifications ?? [];
        return list.map((n) => {
            const author = userStore.userById(n.authorId) as any;
            const projectObj = objectStore.ObjectMap.get(n.projectId);
            return {
                id: String(n.id),
                date: n.createdAt,
                text: n.projectName,
                userName: getShortName(splitFullName(author)),
                userImg: author?.imageId,
                projId: n.projectId,
                img: projectObj?.imageId,
                body: {
                    text: n.content,
                    type: parseNotificationType(n.type as RawType),
                },
            };
        });
    }, [notificationStore.notifications]);

    const onClickNotification = useCallback(
        (notification: Notification) => {
            const { projId, body } = notification;
            if (!body) return;
            const { type } = body;
            notificationStore.notificationIsRead(notification.id);
            const base = projId ? `/admin/journal/${projId}` : `/admin/journal`;
            if (type === "violation" || type === "VIOLATION_STATUS_UPDATE" || type === "comment") {
                navigate(`${base}/violations`);
            } else if (type === "WORK_COMMENT" || type === "text") {
                navigate(`${base}/status`);
            } else {
                navigate(base);
            }
        },
        [navigate],
    );
    const hasNotifications = (notificationsView?.length ?? 0) > 0;
    useLayoutEffect(() => {
        notificationStore.fetchUnreadNotifications();
        layoutStore.setHeaderProps({ title: "Уведомления" });
    }, []);
    return (
        <div className={styles.content}>
            {hasNotifications && <Typo variant={"subheadL"}>Новые</Typo>}
            {hasNotifications ? (
                <div className={styles.list}>
                    {notificationsView.map((notification) => (
                        <button
                            className={styles.notification}
                            key={notification.id}
                            onClick={() => onClickNotification(notification)}
                            type="button"
                        >
                            <div className={styles.objImg}>
                                {notification.img ? (
                                    <img
                                        src={fileUrl(notification.img)}
                                        className={styles.oImg}
                                        alt=""
                                    />
                                ) : (
                                    <div className={styles.noObjImg} />
                                )}
                            </div>

                            <div className={styles.body}>
                                <div className={styles.header}>{notification.text}</div>

                                <div className={styles.textBody}>
                                    {renderBody(notification.body)}
                                </div>

                                <div className={styles.footerBody}>
                                    <div className={styles.user}>
                                        <div className={styles.userImg}>
                                            {notification.userImg ? (
                                                <img
                                                    className={styles.uImg}
                                                    src={fileUrl(notification.userImg)}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className={styles.noImg}>
                                                    <IconUserRounded />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.userName}>
                                            {notification.userName}
                                        </div>
                                    </div>

                                    <div className={styles.notificationDate}>
                                        <Typo variant="bodyS">
                                            {new Date(notification.date).toLocaleDateString(
                                                "ru-RU",
                                                {
                                                    day: "2-digit",
                                                    month: "long",
                                                },
                                            )}
                                        </Typo>
                                        <Typo variant="bodyS">&nbsp;в&nbsp;</Typo>
                                        <Typo variant="bodyS">
                                            {new Date(notification.date).toLocaleTimeString(
                                                "ru-RU",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                },
                                            )}
                                        </Typo>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <Typo variant="bodyXL" className={styles.noNotifications}>
                    Новых уведомлений нет
                </Typo>
            )}
        </div>
    );
});

export default NotificationMobile;
