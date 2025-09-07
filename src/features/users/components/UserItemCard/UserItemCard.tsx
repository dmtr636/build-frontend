import React from "react";
import styles from "./UserItemCard.module.scss";
import { IconChat, IconClose, IconDote, IconNext, IconUser } from "src/ui/assets/icons";
import clsx from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

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
    }: UserItemCardProps) => {
        const initials = position
            ?.split(" ")
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join("");
        console.log(initials);
        return (
            <div className={clsx(styles.container, { [styles.isOpen]: isOpen })} onClick={onClick}>
                <div className={styles.imgBlock}>
                    {image ? (
                        <img className={styles.userImg} src={image} alt={name} />
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
                    <div className={styles.name}>{name}</div>
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
                    <div className={styles.buttonsBlockChat}>
                        <Tooltip text={"Связаться"}>
                            <ButtonIcon
                                onMouseEnter={(e) => e.stopPropagation()}
                                onMouseLeave={(e) => e.stopPropagation()}
                                onClick={onClickChat}
                                pale={true}
                                mode={"neutral"}
                                size={"small"}
                                type={"tertiary"}
                            >
                                <IconChat />
                            </ButtonIcon>
                        </Tooltip>
                    </div>
                    <Tooltip text={isOpen ? "Закрыть" : "Открыть"}>
                        <ButtonIcon pale={true} mode={"neutral"} size={"small"} type={"tertiary"}>
                            {isOpen ? <IconClose /> : <IconNext />}
                        </ButtonIcon>
                    </Tooltip>
                </div>
            </div>
        );
    },
);

export default UserItemCard;
