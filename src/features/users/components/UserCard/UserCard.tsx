import React, { ReactNode, useState } from "react";
import styles from "./UserCard.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    IconEdit,
    IconEmail,
    IconMore,
    IconPhone,
    IconUser,
    IconUserRounded,
} from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { User } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";
import { clsx } from "clsx";
import { IconMax, IconTg } from "src/features/users/components/UserCard/assets";
import { formatPhone } from "src/shared/utils/formatPhone.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { formatDateShort } from "src/shared/utils/date.ts";
import UserCardEdit from "src/features/users/components/UserCardDelete/UserCardEdit.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { DropdownListOptions } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { useNavigate } from "react-router-dom";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";

interface UserCardProps {
    userId: string;
    clearUser: () => void;
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

        return { icon: null, short: url };
    } catch {
        return { icon: null, short: url };
    }
}

const UserCard = observer(({ userId, clearUser }: UserCardProps) => {
    const user = appStore.userStore.usersMap.get(userId);
    if (!user) return null;
    const usersOnline = appStore.userStore.usersOnline;
    const userOrg = appStore.organizationsStore.organizationById(user?.organizationId as string);
    const currentUserOnline: { date: string; status: string } = usersOnline[user?.id as any];
    const [openModal, setOpenModal] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const navigate = useNavigate();
    const moreOptions: DropdownListOptions = [
        {
            name: "Выгрузить объекты (XLSX)",
            mode: "neutral",
            onClick: () => {},
        },
        {
            name: "История действий",
            mode: "neutral",
            onClick: () => {
                navigate(`/admin/events?userId=${user?.id}`);
            },
        },
        {
            name: "Удалить доступ",
            mode: "negative",
            onClick: () => {
                setOpenModalDelete(true);
            },
        },
    ];
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Tooltip text={"Редактировать"}>
                    <Button
                        mode={"neutral"}
                        type={"outlined"}
                        size={"small"}
                        iconBefore={<IconEdit />}
                        onClick={() => setOpenModal(true)}
                    ></Button>
                </Tooltip>
                <div className={styles.avatar} onClick={() => navigate(`/admin/users/${user.id}`)}>
                    {user.imageId ? (
                        <img
                            className={styles.avatarImg}
                            src={`${GET_FILES_ENDPOINT}/${user?.imageId}`}
                        />
                    ) : (
                        <div className={styles.noAvatar}>
                            <IconUserRounded />
                        </div>
                    )}
                </div>
                <Tooltip text={"Ещё"}>
                    <SingleDropdownList options={moreOptions} hideTip tipPosition={"top-right"}>
                        <Button
                            mode={"neutral"}
                            type={"outlined"}
                            size={"small"}
                            iconBefore={<IconMore />}
                        ></Button>
                    </SingleDropdownList>
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
                    {" "}
                    <span className={styles.onlineText}>
                        {currentUserOnline?.status === "online"
                            ? "В сети"
                            : getLastSeen(currentUserOnline?.date as string)}
                    </span>
                </div>
                <div className={styles.position}>{user.position}</div>
                {userOrg && <div className={styles.role}>{userOrg?.name}</div>}
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
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Номер скопирован",
                                        );
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
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Номер скопирован",
                                        );
                                    }}
                                >
                                    {formatPhone(user.personalPhone)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.footer}>
                    <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ opacity: 0.5 }}>Системная роль </span>
                        {user.role}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ opacity: 0.5 }}>Пользователь добавлен </span>
                        {formatDateShort(user?.createDate)}
                    </div>
                </div>
            </div>
            {user && <UserCardEdit open={openModal} setOpen={setOpenModal} currentUser={user} />}
            <Overlay
                open={openModalDelete}
                mode={"negative"}
                onClose={() => setOpenModalDelete(false)}
                title={"Удаление пользователя"}
                actions={[
                    <Button
                        mode={"negative"}
                        key={2}
                        onClick={async () => {
                            await appStore.userStore.deleteUser(user.id);
                            snackbarStore.showNeutralPositiveSnackbar("Пользователь удален");
                            clearUser();
                            setOpenModalDelete(false);
                        }}
                    >
                        Удалить
                    </Button>,
                    <Button
                        mode={"neutral"}
                        type={"tertiary"}
                        key={1}
                        onClick={() => setOpenModalDelete(false)}
                    >
                        Отмена
                    </Button>,
                ]}
            >
                <div className={styles.textFooter}>
                    {" "}
                    Будет удален пользователь: <b style={{ color: "black" }}>{getFullName(user)}</b>
                </div>
            </Overlay>
        </div>
    );
});

export default UserCard;
