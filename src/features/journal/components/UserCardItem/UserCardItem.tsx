import React, { useRef, useState } from "react";
import styles from "./UserCardItem.module.scss";
import {
    IconBasket,
    IconChat,
    IconClose,
    IconDote,
    IconMore,
    IconNewInset,
    IconNext,
    IconUser,
} from "src/ui/assets/icons";
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
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { useNavigate } from "react-router-dom";

interface UserItemCardProps {
    onClickChat?: () => void;
    onClick?: () => void;
    onClickDelete: () => void;
    user: User;
    enabled?: boolean;
    isResponseUser?: boolean;
}

function getShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/); // разделяем по пробелам
    const [lastName = "", firstName = "", patronymic = ""] = parts;

    const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic[0].toUpperCase()}.` : "";

    return [lastName, firstInitial, patronymicInitial].filter(Boolean).join(" ");
}

const userCardItem = observer(
    ({ onClickChat, onClick, user, enabled, isResponseUser, onClickDelete }: UserItemCardProps) => {
        const ref = useRef<HTMLDivElement | null>(null);
        const navigate = useNavigate();
        const initials = user?.position
            ?.split(" ")
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

        return (
            <div className={clsx(styles.container)}>
                <div className={styles.imgBlock}>
                    {user?.imageId ? (
                        <img
                            className={styles.userImg}
                            src={`${GET_FILES_ENDPOINT}/${user?.imageId}`}
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
                <div className={clsx(styles.infoBlock)}>
                    <Tooltip text={splitFullName(user)}>
                        <div className={styles.name}>{getShortName(splitFullName(user))}</div>
                    </Tooltip>

                    <div className={styles.otherInfo}>
                        {initials && initials.length > 1 ? (
                            <Tooltip text={user.position}>
                                <div>{initials}</div>
                            </Tooltip>
                        ) : (
                            user.position
                        )}
                        {user?.position && user?.organizationId && (
                            <IconDote className={styles.dote} />
                        )}
                        {user?.organizationId &&
                            appStore.organizationsStore.organizationById(user?.organizationId ?? "")
                                ?.name}
                    </div>
                </div>

                <div className={styles.buttonsBlock}>
                    <div>
                        <SingleDropdownList
                            key={"1"}
                            options={[
                                {
                                    icon: <IconUser />,
                                    name: isResponseUser
                                        ? "Снять отвественного"
                                        : "Назначить ответственного",
                                    mode: "neutral",
                                    onClick: onClick,
                                },
                                {
                                    icon: <IconBasket />,
                                    name: "Удалить из объекта",
                                    mode: "negative",
                                    onClick: onClickDelete,
                                },
                            ]}
                            hideTip={true}
                            tipPosition={"top-right"}
                        >
                            <ButtonIcon
                                pale={true}
                                mode={"neutral"}
                                size={"small"}
                                type={"tertiary"}
                            >
                                <IconMore />
                            </ButtonIcon>
                        </SingleDropdownList>
                    </div>
                    <div ref={ref}>
                        {(user?.email ||
                            user?.messenger ||
                            user?.personalPhone ||
                            user?.workPhone) && (
                            <Tooltip text={"Связаться"}>
                                <div
                                    className={styles.buttonsBlockChat}
                                    onMouseEnter={(e) => e.stopPropagation()}
                                    onMouseLeave={(e) => e.stopPropagation()}
                                    onClick={() => {
                                        setChats((v) => !v);
                                        if (onClickChat) onClickChat();
                                    }}
                                >
                                    <SingleDropdownList
                                        key={"2"}
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

                    <Tooltip text={"Перейти в профиль пользователя"}>
                        <ButtonIcon
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            pale={true}
                            mode={"neutral"}
                            size={"small"}
                            type={"tertiary"}
                        >
                            <IconNewInset />
                        </ButtonIcon>
                    </Tooltip>
                </div>
            </div>
        );
    },
);

export default userCardItem;
