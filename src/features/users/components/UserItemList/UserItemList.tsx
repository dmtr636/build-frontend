import React, { useMemo } from "react";
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
    type SortField = "createDate" | "name" | "group" | "role";
    type SortOrder = "asc" | "desc";

    function groupUsers(users: User[], field: SortField, order: SortOrder = "asc") {
        switch (field) {
            case "group": {
                const groups: Record<string, User[]> = {};
                for (const u of users) {
                    if (!groups[u.organizationId ?? ""]) groups[u.organizationId ?? ""] = [];
                    groups[u.organizationId ?? ""].push(u);
                }
                return Object.values(groups).map((group) => (
                    <div key={group[0].organizationId}>
                        {group[0]?.organizationId && (
                            <div className={styles.headGroup}>
                                {
                                    appStore.organizationsStore.organizationById(
                                        group[0]?.organizationId ?? "",
                                    )?.name
                                }
                            </div>
                        )}
                        <div className={styles.list}>
                            {group.map((u, index) => (
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
                ));
            }

            case "role":
                if (order === "asc") {
                    // по position
                    {
                        const groups: Record<string, User[]> = {};
                        for (const u of users) {
                            if (!groups[u.position ?? ""]) groups[u.position ?? ""] = [];
                            groups[u.position ?? ""].push(u);
                        }
                        return Object.values(groups).map((group) => (
                            <div key={group[0].position}>
                                {group[0].position && (
                                    <div className={styles.headGroup}>{group[0].position}</div>
                                )}
                                <div className={styles.list}>
                                    {group.map((u, index) => (
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
                        ));
                    } // обернули массив, дальше сортировка у тебя
                } else {
                    // по role
                    return (
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
                    );
                }

            case "createDate":
            case "name":
            default:
                return (
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
                );
        }
    }

    return (
        <div className={styles.container}>
            {groupUsers(users, sortOption.field, sortOption.order)}
        </div>
    );
});

export default UserItemList;
