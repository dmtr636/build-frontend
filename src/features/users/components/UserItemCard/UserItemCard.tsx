import React, { useEffect, useRef, useState } from "react";
import styles from "./UserItemCard.module.scss";
import { IconChat, IconClose, IconDote, IconNext, IconUser } from "src/ui/assets/icons";
import clsx from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { endpoints, GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { User } from "src/features/users/types/User.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { DropdownListOptions } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";

interface UserItemCardProps {
    name?: string;
    role?: string;
    position?: string;
    image?: string;
    enabled?: boolean;
    onClick?: () => void;
    onClickChat?: () => void;
    createDate?: string;
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
        role,
        position,
        image,
        enabled,
        onClick,
        onClickChat,
        createDate,
        sortByDate,
        isOpen,
        user,
    }: UserItemCardProps) => {
        const ref = useRef<HTMLDivElement | null>(null);

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
        ];

        function handleCard(event: React.MouseEvent<HTMLDivElement>) {
            if (ref.current && !ref.current.contains(event.target as Node) && onClick) {
                onClick();
            }
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
                <div className={clsx(styles.infoBlock, { [styles.sortDate]: sortByDate })}>
                    <Tooltip text={name}>
                        <div className={styles.name}>{getShortName(name ?? "")}</div>
                    </Tooltip>
                    {sortByDate && (
                        <div className={styles.date}>
                            Пользователь добавлен <span>{createDate}</span>
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
                        {position && role && <IconDote />}
                        {role}
                    </div>
                </div>
                <div className={styles.buttonsBlock}>
                    <div className={styles.buttonsBlockChat} ref={ref}>
                        <Tooltip text={"Связаться"}>
                            <SingleDropdownList
                                options={chatOptions}
                                show={chats}
                                tipPosition={"top-left"}
                                setShow={setChats}
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
                        </Tooltip>
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
