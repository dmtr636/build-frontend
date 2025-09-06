import React from "react";
import styles from "./UserItemList.module.scss";
import UserItemCard from "src/features/users/components/UserItemCard/UserItemCard.tsx";
import { User } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";

interface UserItemListProps {
    users: User[];
}

const UserItemList = observer(({ users }: UserItemListProps) => {
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

    return (
        <div className={styles.container}>
            <div className={styles.count}>
                <span style={{ opacity: 0.6 }}>Отображается</span>
                <span className={styles.countItem}>{pluralizeUsers(users.length)}</span>
            </div>
            <div className={styles.list}>
                {users.map((u, index) => (
                    <UserItemCard
                        key={index}
                        name={u.name}
                        role={u.role}
                        position={u.position}
                        image={u.imageId}
                        enabled={u.enabled}
                    />
                ))}
            </div>
        </div>
    );
});

export default UserItemList;
