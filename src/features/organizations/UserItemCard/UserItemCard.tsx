import React, { useEffect, useRef, useState } from "react";
import styles from "./UserItemCard.module.scss";
import {
    IconBasket,
    IconChat,
    IconClose,
    IconDote,
    IconNewInset,
    IconNext,
    IconUser,
} from "src/ui/assets/icons";
import clsx from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { endpoints, GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { User } from "src/features/users/types/User.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { DropdownListOptions } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

interface UserItemCardProps {
    name?: string;
    company?: string;
    position?: string | null;
    image?: string;
    enabled?: boolean;
    onClick?: () => void;
    onClickChat?: () => void;
    onDelete?: () => void;
    createdAt?: string;
    sortByDate?: boolean;
    isOpen?: boolean;
    user?: User;
}

function getShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/); // разделяем по пробелам
    const [lastName = "", firstName = "", patronymic = ""] = parts;

    const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic[0].toUpperCase()}.` : "";

    return [lastName, firstInitial, patronymicInitial].filter(Boolean).join(" ");
}

const UserItemCard = observer(
    ({
        name,
        company,
        position,
        image,
        enabled,
        onClick,
        onClickChat,
        createdAt,
        sortByDate,
        isOpen,
        user,
        onDelete,
    }: UserItemCardProps) => {
        const ref = useRef<HTMLDivElement | null>(null);
        const refDelete = useRef<HTMLDivElement | null>(null);

        const initials = position
            ?.split(" ")
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join("");
        const [chats, setChats] = useState(false);

        const chatOptions: DropdownListOptions = [
            {
                name: "Мессенджер",
                mode: "neutral",
                onClick: () => {
                    window.open(user?.messenger);
                },
            },
            {
                name: "Почта",
                mode: "neutral",
                onClick: () => {
                    window.open(user?.messenger);
                },
            },
            {
                name: "Рабочий телефон",
                mode: "neutral",
                onClick: () => {
                    if (user?.workPhone) {
                        navigator.clipboard.writeText(user?.workPhone);
                        snackbarStore.showNeutralPositiveSnackbar("Номер скопирован");
                    }
                },
            },
            {
                name: "Личный телефон",
                mode: "neutral",
                onClick: () => {
                    if (user?.personalPhone) {
                        navigator.clipboard.writeText(user?.personalPhone);
                        snackbarStore.showNeutralPositiveSnackbar("Номер скопирован");
                    }
                },
            },
        ];
        const filteredChatOptions = chatOptions.filter((option) => {
            switch (option.name) {
                case "Мессенджер":
                    return Boolean(user?.messenger);
                case "Почта":
                    return Boolean(user?.email);
                case "Рабочий телефон":
                    return Boolean(user?.workPhone);
                case "Личный телефон":
                    return Boolean(user?.personalPhone);
                default:
                    return true;
            }
        });

        function handleCard(event: React.MouseEvent<HTMLDivElement>) {
            if (ref.current && !ref.current.contains(event.target as Node) && onClick) {
                if (onDelete) {
                    if (refDelete.current && !refDelete.current.contains(event.target as Node)) {
                        onClick();
                    }
                } else {
                    onClick();
                }
            }
            if (!ref.current && onClick) {
                onClick();
            }
        }

        return (
            <div
                className={clsx(styles.container, { [styles.isOpen]: isOpen })}
                onClick={handleCard}
                style={{
                    width: onDelete ? 694 : undefined,
                }}
            >
                <div className={styles.imgBlock}>
                    {image ? (
                        <img
                            className={styles.userImg}
                            src={`${GET_FILES_ENDPOINT}/${image}`}
                            alt={name}
                        />
                    ) : (
                        <div className={styles.noUser}>
                            <IconUser />
                        </div>
                    )}
                    <div className={styles.enabledContainer}>
                        <div className={clsx(styles.enabled, { [styles.online]: enabled })}></div>
                    </div>
                </div>
                <div className={clsx(styles.infoBlock, { [styles.sortDate]: sortByDate })}>
                    <Tooltip text={name}>
                        <div className={styles.name}>{getShortName(name ?? "")}</div>
                    </Tooltip>
                    {sortByDate && (
                        <div className={styles.date}>
                            Пользователь добавлен <span>{createdAt}</span>
                        </div>
                    )}
                    <div className={styles.otherInfo}>
                        {initials && initials.length > 1 ? (
                            <Tooltip text={position}>
                                <div>{initials}</div>
                            </Tooltip>
                        ) : (
                            position
                        )}
                        {position && company && <IconDote />}
                        {company}
                    </div>
                </div>
                <div className={styles.buttonsBlock}>
                    {onDelete && (
                        <span ref={refDelete}>
                            <Tooltip text={"Удалить из организации"}>
                                <ButtonIcon
                                    type={"tertiary"}
                                    mode={"negative"}
                                    size={"small"}
                                    onClick={onDelete}
                                    className={styles.deleteButton}
                                >
                                    <IconBasket />
                                </ButtonIcon>
                            </Tooltip>
                        </span>
                    )}
                    {(user?.email || user?.messenger || user?.personalPhone || user?.workPhone) && (
                        <span ref={ref}>
                            <Tooltip text={"Связаться"} closeOnClick={true}>
                                <div className={styles.buttonsBlockChat}>
                                    <SingleDropdownList
                                        options={filteredChatOptions}
                                        show={chats}
                                        tipPosition={"top-right"}
                                        setShow={setChats}
                                        zIndex={100}
                                    >
                                        <ButtonIcon
                                            onMouseEnter={(e) => e.stopPropagation()}
                                            onMouseLeave={(e) => e.stopPropagation()}
                                            onClick={() => {
                                                setChats((v) => !v);
                                                if (onClickChat) onClickChat();
                                            }}
                                            pale={true}
                                            mode={"neutral"}
                                            size={"small"}
                                            type={"tertiary"}
                                        >
                                            <IconChat />
                                        </ButtonIcon>
                                    </SingleDropdownList>
                                </div>
                            </Tooltip>
                        </span>
                    )}
                    <Tooltip text={isOpen ? "Закрыть" : "Открыть"}>
                        <div
                            className={styles.icon}
                            style={{
                                padding: "0 8px",
                            }}
                        >
                            {isOpen ? <IconClose /> : <IconNewInset />}
                        </div>
                    </Tooltip>
                </div>
            </div>
        );
    },
);

export default UserItemCard;
