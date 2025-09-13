import React, { ReactNode } from "react";
import styles from "./UserCard.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconEdit, IconEmail, IconMore, IconPhone } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { User } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";
import { clsx } from "clsx";
import { IconMax, IconTg } from "src/features/users/components/UserCard/assets";
import { formatPhone } from "src/shared/utils/formatPhone.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

interface UserCardProps {
    user: User;
}

function getLastSeen(time: string | Date): string {
    if (!time) return "Не в сети";
    const lastSeen = new Date(time).getTime();
    const now = Date.now();
    const diff = Math.floor((now - lastSeen) / 1000); // разница в секундах

    if (diff < 60) {
        return "В сети только что";
    }

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) {
        return `В сети ${minutes} ${getPlural(minutes, "минуту", "минуты", "минут")} назад`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `В сети ${hours} ${getPlural(hours, "час", "часа", "часов")} назад`;
    }

    const days = Math.floor(hours / 24);
    return `В сети ${days} ${getPlural(days, "день", "дня", "дней")} назад`;
}

function getPlural(number: number, one: string, few: string, many: string): string {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
}

type LinkInfo = {
    icon: ReactNode;
    short: string;
};

function getLinkInfo(url: string): LinkInfo | null {
    try {
        const { hostname } = new URL(url);

        if (hostname.includes("t.me") || hostname.includes("telegram.")) {
            return { icon: <IconTg />, short: "t.me" };
        }

        if (hostname.includes("max.ru")) {
            return { icon: <IconMax />, short: "max.ru" };
        }

        return null;
    } catch {
        return null;
    }
}

function formatDateShort(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${day}.${month}.${year}`;
}

const UserCard = observer(({ user }: UserCardProps) => {
    const usersOnline = appStore.userStore.usersOnline;
    const currentUserOnline: { date: string; status: string } = usersOnline[user.id as any];
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Tooltip text={"Редактировать"}>
                    <Button
                        mode={"neutral"}
                        type={"outlined"}
                        size={"small"}
                        iconBefore={<IconEdit />}
                    ></Button>
                </Tooltip>
                <div className={styles.avatar}>
                    <img
                        className={styles.avatarImg}
                        src={`${GET_FILES_ENDPOINT}/${user?.imageId}`}
                    />
                </div>
                <Tooltip text={"Ещё"}>
                    <Button
                        mode={"neutral"}
                        type={"outlined"}
                        size={"small"}
                        iconBefore={<IconMore />}
                    ></Button>
                </Tooltip>
            </div>
            <div className={styles.body}>
                <div className={styles.name}>
                    {`${user.lastName ?? ""} ${user.firstName ?? ""} ${user.patronymic ?? ""}`}
                </div>
                <div
                    className={clsx(styles.online, {
                        [styles.active]: currentUserOnline?.status === "online",
                    })}
                >
                    {currentUserOnline?.status === "online"
                        ? "В сети"
                        : getLastSeen(currentUserOnline?.date as string)}
                </div>
                <div className={styles.position}>{user.position}</div>
                <div className={styles.role}>Тут будет организация</div>
                <Button
                    style={{ marginTop: 16 }}
                    size={"small"}
                    type={"primary"}
                    mode={"neutral"}
                    fullWidth={true}
                    counter={12}
                >
                    Объекты
                </Button>
                <div className={styles.messengers}>
                    {user.messenger && (
                        <div className={styles.messengerItem}>
                            <div className={clsx(styles.messengerIcon, styles.messenger)}>
                                {getLinkInfo(user.messenger)?.icon}
                            </div>
                            <div className={styles.messengerBody}>
                                <div className={styles.messengerHead}>Месседжер</div>
                                <div className={styles.messengerLink}>
                                    <a href={user.messenger}>
                                        {getLinkInfo(user.messenger)?.short}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                    {user.email && (
                        <div className={styles.messengerItem}>
                            <div className={clsx(styles.messengerIcon)}>
                                <IconEmail />
                            </div>
                            <div className={styles.messengerBody}>
                                <div className={styles.messengerHead}>Корпоративная почта</div>
                                <div className={styles.messengerLink}>
                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                </div>
                            </div>
                        </div>
                    )}
                    {user.workPhone && (
                        <div className={styles.messengerItem}>
                            <div className={clsx(styles.messengerIcon)}>
                                <IconPhone />
                            </div>
                            <div className={styles.messengerBody}>
                                <div className={styles.messengerHead}>Рабочий</div>
                                <div
                                    className={styles.messengerLink}
                                    onClick={() => {
                                        navigator.clipboard.writeText(user.workPhone ?? "");
                                        snackbarStore.showPositiveSnackbar("Номер скопирован");
                                    }}
                                >
                                    {formatPhone(user.workPhone)}
                                </div>
                            </div>
                        </div>
                    )}
                    {user.personalPhone && (
                        <div className={styles.messengerItem}>
                            <div className={clsx(styles.messengerIcon)}>
                                <IconPhone />
                            </div>
                            <div className={styles.messengerBody}>
                                <div className={styles.messengerHead}>Личный</div>
                                <div
                                    className={styles.messengerLink}
                                    onClick={() => {
                                        navigator.clipboard.writeText(user.personalPhone ?? "");
                                        snackbarStore.showPositiveSnackbar("Номер скопирован");
                                    }}
                                >
                                    {formatPhone(user.personalPhone)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.footer}>
                    <div>
                        <span style={{ opacity: 0.5 }}>Системная роль </span>
                        {user.role}
                    </div>
                    <span style={{ opacity: 0.5 }}>Пользователь добавлен </span>
                    {formatDateShort(user.createDate)}
                </div>
            </div>
        </div>
    );
});

export default UserCard;
