import { IconNotification, IconUserRounded } from "src/ui/assets/icons";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { PopoverBase } from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { useState } from "react";
import styles from "./Notification.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { fileUrl } from "src/shared/utils/file.ts";

export interface Notification {
    id: number;
    date: string;
    text: string;
    img?: string;
    userName?: string;
    userImg?: string;
    objectImg?: string;
    body?: { type: "violation" | "comment" | "text"; text?: string };
}

interface NotificationProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onAllNotificationsClick?: () => void;
}

export const Notification = (props: NotificationProps) => {
    const [showPopover, setShowPopover] = useState(false);
    const renderBody = (body?: { type: "violation" | "comment" | "text"; text?: string }) => {
        if (!body) return null;

        switch (body.type) {
            case "violation":
                return (
                    <div className={styles.alert}>
                        {" "}
                        {body.text ? body.text : "Добавлено нарушение!"}
                    </div>
                );

            case "comment":
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
    const renderContent = () => {
        return (
            <div className={styles.content}>
                {props.notifications?.length ? (
                    <div className={styles.list}>
                        {props.notifications.slice(0, 5).map((notification) => (
                            <button
                                className={styles.notification}
                                key={notification.id}
                                onClick={() => props.onNotificationClick(notification)}
                            >
                                <div className={styles.objImg}>
                                    <img src={fileUrl(notification.img)} className={styles.oImg} />
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
                                            <Typo variant={"bodyL"}>
                                                {new Date(notification.date).toLocaleDateString(
                                                    [],
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                    },
                                                )}
                                            </Typo>
                                            <Typo variant={"bodyL"}>&nbsp;в&nbsp;</Typo>
                                            <Typo variant={"bodyL"}>
                                                {new Date(notification.date).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    },
                                                )}
                                            </Typo>
                                        </div>
                                    </div>
                                </div>
                                {/*<div className={styles.notificationDate}>
                                    <Typo variant={"bodyL"}>
                                        {new Date(notification.date).toLocaleDateString([], {
                                            day: "2-digit",
                                            month: "short",
                                        })}
                                    </Typo>
                                    <div className={styles.notificationDateDivider} />
                                    <Typo variant={"bodyL"}>
                                        {new Date(notification.date).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Typo>
                                </div>*/}
                            </button>
                        ))}
                    </div>
                ) : (
                    <Typo variant={"bodyXL"} className={styles.noNotifications}>
                        Новых уведомлений нет
                    </Typo>
                )}
                {props.onAllNotificationsClick && (
                    <div className={styles.footer}>
                        <Button
                            type={"primary"}
                            size={"large"}
                            onClick={props.onAllNotificationsClick}
                            fullWidth={true}
                        >
                            Все уведомления
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <PopoverBase
            zIndex={1000}
            hideTip={true}
            mode={"contrast"}
            show={showPopover}
            setShow={setShowPopover}
            content={renderContent()}
            triggerEvent={"click"}
            tipPosition={"top-right"}
        >
            <Button
                type={"outlined"}
                mode={"neutral"}
                iconBefore={<IconNotification />}
                counterClassname={styles.counter}
                counter={props.notifications?.length || undefined}
                hover={showPopover}
            />
        </PopoverBase>
    );
};
