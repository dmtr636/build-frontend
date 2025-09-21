import React, { useRef, useState } from "react";
import styles from "./UserItemCard.module.scss";
import { IconChat, IconClose, IconDote, IconNext, IconUser } from "src/ui/assets/icons";
import clsx from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { User } from "src/features/users/types/User.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { DropdownListOptions } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { formatDateShort } from "src/shared/utils/date.ts";
import { SortOption } from "src/features/users";
import { appStore } from "src/app/AppStore.ts";

interface UserItemCardProps {
    name?: string;
    company?: string;
    position?: string | null;
    image?: string;
    enabled?: boolean;
    onClick?: () => void;
    onClickChat?: () => void;
    createDate?: string;
    sortByDate?: boolean;
    isOpen?: boolean;
    user?: User;
    sortOption?: SortOption;
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
        sortByDate,
        sortOption,
        isOpen,
        user,
    }: UserItemCardProps) => {
        const ref = useRef<HTMLDivElement | null>(null);
        const additionalRow =
            sortOption?.field === "createDate" ||
            (sortOption?.field === "role" && sortOption.order === "desc");
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
                        snackbarStore.showPositiveSnackbar("Номер скопирован");
                    }
                },
            },
            {
                name: "Личный телефон",
                mode: "neutral",
                onClick: () => {
                    if (user?.personalPhone) {
                        navigator.clipboard.writeText(user?.personalPhone);
                        snackbarStore.showPositiveSnackbar("Номер скопирован");
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
            console.log(ref);
            if (ref.current && !ref.current.contains(event.target as Node) && onClick) {
                onClick();
            }
            /*if (!ref.current && onClick) {
                console.log(123);
                onClick();
            }*/
        }

        return (
            <div
                className={clsx(styles.container, { [styles.isOpen]: isOpen })}
                onClick={handleCard}
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
                <div className={clsx(styles.infoBlock, { [styles.sortDate]: additionalRow })}>
                    <Tooltip text={name}>
                        <div className={styles.name}>{getShortName(name ?? "")}</div>
                    </Tooltip>
                    {sortByDate && (
                        <div className={styles.date}>
                            <span style={{ opacity: 0.5 }}>Пользователь добавлен </span>
                            <span>{formatDateShort(user?.createDate ?? "")}</span>
                        </div>
                    )}
                    {sortOption?.field === "role" && sortOption.order === "desc" && (
                        <div className={styles.date}>
                            <span style={{ opacity: 0.5 }}>Системная роль </span>
                            <span>{user?.role ?? ""}</span>
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
                    <div ref={ref}>
                        {(user?.email ||
                            user?.messenger ||
                            user?.personalPhone ||
                            user?.workPhone) && (
                            <Tooltip text={"Связаться"}>
                                <div
                                    className={styles.buttonsBlockChat}
                                    /*
                                                                    ref={ref}
                                    */
                                    onMouseEnter={(e) => e.stopPropagation()}
                                    onMouseLeave={(e) => e.stopPropagation()}
                                    onClick={() => {
                                        setChats((v) => !v);
                                        if (onClickChat) onClickChat();
                                    }}
                                >
                                    <SingleDropdownList
                                        options={filteredChatOptions}
                                        show={chats}
                                        tipPosition={"top-left"}
                                        setShow={setChats}
                                    >
                                        <ButtonIcon
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
                        )}
                    </div>

                    <Tooltip text={isOpen ? "Закрыть" : "Открыть"}>
                        <div className={styles.icon}>{isOpen ? <IconClose /> : <IconNext />}</div>
                    </Tooltip>
                </div>
            </div>
        );
    },
);

export default UserItemCard;
