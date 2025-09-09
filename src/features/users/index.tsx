import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { appStore } from "src/app/AppStore.ts";
import UserItemList from "src/features/users/components/UserItemList/UserItemList.tsx";
import styles from "./UsersPage.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    IconClose,
    IconPlus,
    IconSearch,
    IconSort,
    IconSorting,
    IconUpdate,
} from "src/ui/assets/icons";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Chip } from "src/ui/components/controls/Chip/Chip.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import UserCard from "src/features/users/components/UserCard/UserCard.tsx";
import { User } from "src/features/users/types/User.ts";

export const UsersPage = observer(() => {
    const users = appStore.userStore.users;
    const [currentUser, setCurrentUser] = useState<User | undefined>();
    const usersPositionOptions: SelectOption<string>[] = users
        .filter((user) => user.position)
        .map((user) => ({
            name: user.position ?? "",
            value: user.position ?? "",
        }));

    const rolesOptions: SelectOption<string>[] = [
        { value: "ADMIN", name: "Администратор" },
        {
            value: "USER",
            name: "Пользователь",
        },
        {
            value: "ROOT",
            name: "ROOT",
        },
    ];
    const [rolesValue, setRolesValue] = useState<string[]>([]);
    const [positionValue, setPositionValue] = useState<string[]>([]);
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [name, setName] = useState<string>("");
    useLayoutEffect(() => {
        appStore.userStore.fetchOnlineUser();
    }, []);
    const chipArray = useMemo(() => {
        const rolesChip = rolesValue.map((role) => (
            <Chip
                closePale={true}
                size={"small"}
                onClick={() =>
                    setRolesValue((prevState) => {
                        return prevState.filter((prev) => prev !== role);
                    })
                }
                key={role}
                onDelete={() =>
                    setRolesValue((prevState) => {
                        return prevState.filter((prev) => prev !== role);
                    })
                }
            >
                {role}
            </Chip>
        ));

        const positionsChip = positionValue.map((position) => (
            <Chip
                closePale={true}
                size={"small"}
                key={position}
                onClick={() =>
                    setPositionValue((prevState) => {
                        return prevState.filter((prev) => prev !== position);
                    })
                }
                onDelete={() =>
                    setPositionValue((prevState) => {
                        return prevState.filter((prev) => prev !== position);
                    })
                }
            >
                {position}
            </Chip>
        ));
        return [...rolesChip, ...positionsChip];
    }, [rolesValue, positionValue]);
    const usersOnline = appStore.userStore.usersOnline;
    const onlineIds = Object.entries<any>(usersOnline)
        .filter(([_, value]) => value.status === "online")
        .map(([id]) => id);
    const filteredUsersByFilter = useMemo(() => {
        return users.filter((user) => {
            if (rolesValue.length > 0 && !rolesValue.includes(user.role)) {
                return false;
            }

            if (name.trim() !== "") {
                if (user.role === "ROOT") return false;
                const userName = user.name?.toLowerCase() ?? "";
                if (!userName.includes(name.toLowerCase())) return false;
            }
            if (
                positionValue.length > 0 &&
                (!user.position || !positionValue.includes(user.position))
            ) {
                return false;
            }

            return !(onlineOnly && !onlineIds.includes(user.id));
        });
    }, [users, rolesValue, positionValue, onlineOnly, onlineIds]);
    const filteredUsers = useMemo(() => {
        return filteredUsersByFilter.filter((user) => {
            if (name.trim() !== "") {
                if (user.role === "ROOT") return false;
                const userName = user.name?.toLowerCase() ?? "";
                if (!userName.includes(name.toLowerCase())) return false;
            }
            return true;
        });
    }, [filteredUsersByFilter, name]);
    const resetFilters = () => {
        setPositionValue([]);
        setRolesValue([]);
        setOnlineOnly(false);
    };
    const onClickCard = (u: User) => {
        console.log(u);
        console.log(currentUser?.id);

        if (u.id !== currentUser?.id || !currentUser) {
            setCurrentUser(u);
        } else {
            setCurrentUser(undefined);
        }
    };
    return (
        <div className={styles.container}>
            <div className={styles.filterBlock}>
                <div>
                    <Button
                        size={"small"}
                        mode={"neutral"}
                        fullWidth={true}
                        iconBefore={<IconPlus />}
                    >
                        Новый пользователь
                    </Button>
                </div>
                <div className={styles.filterContainer}>
                    <div className={styles.filterHead}>
                        <span style={{ opacity: 0.6 }}>Фильтры</span>
                        {(rolesValue.length > 0 || positionValue.length > 0 || onlineOnly) && (
                            <Button
                                onClick={resetFilters}
                                size={"tiny"}
                                type={"outlined"}
                                mode={"neutral"}
                                iconBefore={<IconUpdate />}
                            >
                                Сбросить
                            </Button>
                        )}
                    </div>
                    <FlexColumn gap={16} style={{ marginTop: 20 }}>
                        <MultipleSelect
                            values={positionValue}
                            onValuesChange={setPositionValue}
                            options={usersPositionOptions}
                            multiple={true}
                            placeholder={"Все"}
                            formName={"Должность"}
                        ></MultipleSelect>
                        <MultipleSelect
                            values={rolesValue}
                            onValuesChange={setRolesValue}
                            placeholder={"Все"}
                            options={rolesOptions}
                            multiple={true}
                            formName={"Роль в системе"}
                        ></MultipleSelect>
                        <MultipleAutocomplete
                            formName={"Объекты"}
                            options={rolesOptions}
                            placeholder={"Все"}
                            values={rolesValue}
                            onValuesChange={setRolesValue}
                            multiple={true}
                        />
                        <Checkbox
                            size={"large"}
                            onChange={setOnlineOnly}
                            checked={onlineOnly}
                            title={"Только в сети"}
                        />
                    </FlexColumn>
                </div>
            </div>
            <div className={styles.userlistBlock}>
                <div className={styles.sortContainer}>
                    <div>
                        <Input
                            size={"large"}
                            startIcon={<IconSearch />}
                            onClear={() => setName("")}
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder={"Найти по имени"}
                        />
                    </div>
                    {/* <div>
                        <Button
                            size={"large"}
                            iconBefore={<IconSorting />}
                            type={"primary"}
                            mode={"neutral"}
                        ></Button>
                    </div>*/}
                </div>
                <UserItemList
                    onClick={(value: User) => onClickCard(value)}
                    users={filteredUsers}
                    chips={chipArray}
                />
            </div>
            <div className={styles.userCard}>{currentUser && <UserCard user={currentUser} />}</div>
        </div>
    );
});
