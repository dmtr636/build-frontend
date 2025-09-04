import { IconNotification } from "src/ui/assets/icons";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { PopoverBase } from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { useState } from "react";
import styles from "./Notification.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";

export interface Notification {
    id: number;
    date: string;
    text: string;
}

interface NotificationProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onAllNotificationsClick?: () => void;
}

export const Notification = (props: NotificationProps) => {
    const [showPopover, setShowPopover] = useState(false);

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
                                <TooltipTypo
                                    variant={"actionL"}
                                    className={styles.notificationText}
                                >
                                    {notification.text}
                                </TooltipTypo>
                                <div className={styles.notificationDate}>
                                    <Typo variant={"bodyL"}>
                                        {new Date(notification.date).toLocaleDateString([], {
                                            day: "2-digit",
                                            month: "long",
                                        })}
                                    </Typo>
                                    <Typo variant={"bodyL"}>&nbsp;в&nbsp;</Typo>
                                    <Typo variant={"bodyL"}>
                                        {new Date(notification.date).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Typo>
                                </div>
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
                counter={props.notifications?.length || undefined}
                hover={showPopover}
            />
        </PopoverBase>
    );
};
