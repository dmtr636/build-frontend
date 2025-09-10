import React from "react";
import styles from "./UserItemList.module.scss";
import UserItemCard from "src/features/users/components/UserItemCard/UserItemCard.tsx";
import { User, UserOnline, UserOnlineMap } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";

interface UserItemListProps {
    users: User[];
    chips?: React.ReactNode[];
    onClick: (value: User) => void;
}

function pluralizeUsers(count: number): string {
    const absCount = Math.abs(count) % 100;
    const lastDigit = absCount % 10;

    if (absCount > 10 && absCount < 20) {
        return `${count} пользователей`;
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return `${count} пользователя`;
    }
    if (lastDigit === 1) {
        return `${count} пользователь`;
    }
    return `${count} пользователей`;
}

function splitFullName(user: {
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
}): string {
    return [user.lastName, user.firstName, user.patronymic].filter(Boolean).join(" ");
}

const UserItemList = observer(({ users, chips, onClick }: UserItemListProps) => {
    const usersOnline = appStore.userStore.usersOnline;
    const onlineIds = Object.entries<any>(usersOnline)
        .filter(([_, value]) => value.status === "online")
        .map(([id]) => id);

    return (
        <div className={styles.container}>
            <div className={styles.count}>
                <span style={{ opacity: 0.6 }}>Отображается</span>
                <span className={styles.countItem}>{pluralizeUsers(users.length)}</span>
            </div>
            {chips && chips?.length > 0 && <div className={styles.chipsArray}>{chips}</div>}
            <div className={styles.list}>
                {users.map((u, index) => (
                    <UserItemCard
                        onClick={() => onClick(u)}
                        key={index}
                        name={splitFullName(u)}
                        role={u.role}
                        position={u.position}
                        image={u.imageId}
                        enabled={onlineIds.includes(u.id)}
                    />
                ))}
            </div>
        </div>
    );
});

export default UserItemList;
