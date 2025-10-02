import React, { useMemo, useRef, useState } from "react";
import styles from "./UserItemList.module.scss";
import UserItemCard from "src/features/users/components/UserItemCard/UserItemCard.tsx";
import { User, UserOnline, UserOnlineMap } from "src/features/users/types/User.ts";
import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { SortOption } from "src/features/users";
import { clsx } from "clsx";

interface UserItemListProps {
    users: User[];
    onClick: (value: User) => void;
    currentUser?: User;
    sortOption: SortOption;
    setScrolled?: (value: boolean) => void;
}

const UserItemList = observer(
    ({ users, onClick, currentUser, sortOption, setScrolled }: UserItemListProps) => {
        const usersOnline = appStore.userStore.usersOnline;
        const onlineIds = Object.entries<any>(usersOnline)
            .filter(([_, value]) => value.status === "online")
            .map(([id]) => id);
        type SortField = "createdAt" | "name" | "group" | "role";
        type SortOrder = "asc" | "desc";

        function groupUsers(users: User[], field: SortField, order: SortOrder = "asc") {
            switch (field) {
                case "group": {
                    const groups: Record<string, User[]> = {};
                    for (const u of users) {
                        const orgId = u.organizationId ?? "";
                        if (!groups[orgId]) groups[orgId] = [];
                        groups[orgId].push(u);
                    }

                    return Object.values(groups)
                        .sort((a, b) => {
                            const aId = a[0]?.organizationId ?? "";
                            const bId = b[0]?.organizationId ?? "";
                            if (!aId && bId) return 1; // пустые в конец
                            if (aId && !bId) return -1; // непустые в начало
                            return 0;
                        })
                        .map((group) => (
                            <div key={group[0]?.organizationId ?? "no-org"}>
                                <div className={styles.headGroup}>
                                    {appStore.organizationsStore.organizationById(
                                        group[0]?.organizationId ?? "",
                                    )?.name || "Без организации"}
                                </div>
                                <div className={styles.list}>
                                    {group.map((u, index) => (
                                        <UserItemCard
                                            user={u}
                                            onClick={() => onClick(u)}
                                            key={index}
                                            name={splitFullName(u)}
                                            sortByDate={sortOption.field === "createdAt"}
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
                        const groups: Record<string, User[]> = {};
                        for (const u of users) {
                            const pos = u.position ?? "";
                            if (!groups[pos]) groups[pos] = [];
                            groups[pos].push(u);
                        }

                        return Object.values(groups)
                            .sort((a, b) => {
                                const aPos = a[0]?.position ?? "";
                                const bPos = b[0]?.position ?? "";
                                if (!aPos && bPos) return 1;
                                if (aPos && !bPos) return -1;
                                return 0;
                            })
                            .map((group) => (
                                <div key={group[0]?.position ?? "no-pos"}>
                                    <div className={styles.headGroup}>
                                        {group[0]?.position?.length
                                            ? group[0].position
                                            : "Без должности"}
                                    </div>
                                    <div className={styles.list}>
                                        {group.map((u, index) => (
                                            <UserItemCard
                                                user={u}
                                                onClick={() => onClick(u)}
                                                key={index}
                                                name={splitFullName(u)}
                                                sortByDate={sortOption.field === "createdAt"}
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
                    } else {
                        return (
                            <div className={styles.list}>
                                {users.map((u, index) => (
                                    <UserItemCard
                                        user={u}
                                        onClick={() => onClick(u)}
                                        key={index}
                                        name={splitFullName(u)}
                                        sortByDate={sortOption.field === "createdAt"}
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

                case "createdAt":
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
                                    sortByDate={sortOption.field === "createdAt"}
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

        const containerRef = useRef<HTMLDivElement>(null);

        function handleScroll() {
            if (!containerRef.current) return;
            const el = containerRef.current;
            if (setScrolled) {
                setScrolled(el.scrollTop > 0);
            }
        }

        return (
            <div ref={containerRef} className={clsx(styles.container)} onScroll={handleScroll}>
                {groupUsers(users, sortOption.field as any, sortOption.order)}
            </div>
        );
    },
);

export default UserItemList;
