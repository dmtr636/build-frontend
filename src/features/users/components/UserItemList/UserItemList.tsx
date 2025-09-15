import React from "react";
import styles from "./UserItemList.module.scss";
import UserItemCard from "src/features/users/components/UserItemCard/UserItemCard.tsx";
import { User, UserOnline, UserOnlineMap } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { SortOption } from "src/features/users";

interface UserItemListProps {
    users: User[];
    onClick: (value: User) => void;
    currentUser?: User;
    sortOption: SortOption;
}

const UserItemList = observer(({ users, onClick, currentUser, sortOption }: UserItemListProps) => {
    const usersOnline = appStore.userStore.usersOnline;
    const onlineIds = Object.entries<any>(usersOnline)
        .filter(([_, value]) => value.status === "online")
        .map(([id]) => id);

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {users.map((u, index) => (
                    <UserItemCard
                        user={u}
                        onClick={() => onClick(u)}
                        key={index}
                        name={splitFullName(u)}
                        sortByDate={sortOption.field === "createDate"}
                        position={u.position}
                        sortOption={sortOption}
                        image={u.imageId}
                        enabled={onlineIds.includes(u.id)}
                        isOpen={u.id === currentUser?.id}
                    />
                ))}
            </div>
        </div>
    );
});

export default UserItemList;
