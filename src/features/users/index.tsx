import { observer } from "mobx-react-lite";
import { appStore } from "src/app/AppStore.ts";
import UserItemList from "src/features/users/components/UserItemList/UserItemList.tsx";
import styles from "./UsersPage.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    IconCheckmark,
    IconClose,
    IconError,
    IconImport,
    IconPlus,
    IconSearch,
    IconSorting,
    IconUpdate,
} from "src/ui/assets/icons";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Chip } from "src/ui/components/controls/Chip/Chip.tsx";
import UserCard from "src/features/users/components/UserCard/UserCard.tsx";
import { User } from "src/features/users/types/User.ts";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { formatPhone } from "src/shared/utils/formatPhone.ts";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import useExcelExporter from "src/features/users/hooks/useExcelExporter.ts";
import { Helmet } from "react-helmet";
import UserForm from "src/features/users/components/UserForm/UserForm.tsx";
import { formatDateShort } from "src/shared/utils/date.ts";

export interface SortOption {
    field: "createDate" | "name" | "group" | "role";
    order: "asc" | "desc";
    label: string;
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

function sortItems(items: User[], sortOption: { field: string; order: "asc" | "desc" }) {
    const { field, order } = sortOption;

    return [...items].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        if (field === "role") {
            if (order === "asc") {
                aValue = a.position ?? "";
                bValue = b.position ?? "";
            } else {
                aValue = a.role ?? "";
                bValue = b.role ?? "";
            }
        } else if (field === "name") {
            const getFullName = (item: User) =>
                `${item.lastName ?? ""} ${item.firstName ?? ""} ${item.patronymic ?? ""}`.trim();

            aValue = getFullName(a);
            bValue = getFullName(b);
        } else if (field === "createDate") {
            const aDate = a.createDate ? new Date(a.createDate).getTime() : 0;
            const bDate = b.createDate ? new Date(b.createDate).getTime() : 0;
            return order === "asc" ? aDate - bDate : bDate - aDate;
        } else {
            aValue = (a as any)[field] ?? "";
            bValue = (b as any)[field] ?? "";
        }

        const result = String(aValue).localeCompare(String(bValue), "ru", {
            sensitivity: "base",
        });

        return order === "asc" ? result : -result;
    });
}

export const UsersPage = observer(() => {
    const [sortOption, setSortOption] = useState<SortOption>({
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    });

    const [currentUser, setCurrentUser] = useState<User | undefined>();
    const users = appStore.userStore.users;

    const userPosition = [...new Set(users.filter((u) => u.position).map((u) => u.position))];
    const usersPositionOptions: SelectOption<string>[] = userPosition.map((user) => ({
        name: user ?? "",
        value: user ?? "",
    }));
    const organisations = appStore.organizationsStore.organizations;
    const companyOptions: SelectOption<string>[] = organisations.map((org) => ({
        name: org.name,
        value: org.id,
    }));
    const isSelected = (field: string, order: "asc" | "desc") =>
        sortOption?.field === field && sortOption?.order === order;

    const dropDownSortOptions: DropdownListOption<string>[] = [
        {
            name: "По алфавиту",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По алфавиту</div>,
        },
        {
            name: "От А - Я",
            mode: "neutral",
            pale: true,
            disabled: isSelected("name", "asc"),
            iconAfter: isSelected("name", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({ field: "name", order: "asc", label: "По алфавиту, от А - Я" });
            },
        },
        {
            name: "От Я - А",
            mode: "neutral",
            pale: true,
            disabled: isSelected("name", "desc"),
            iconAfter: isSelected("name", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({ field: "name", order: "desc", label: "По алфавиту, от Я - А" });
            },
        },
        {
            name: "По дате создания",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По дате создания</div>,
        },
        {
            name: "Сначала новые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("createDate", "asc"),
            iconAfter: isSelected("createDate", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({
                    field: "createDate",
                    order: "asc",
                    label: "По дате создания, сначала новые",
                });
            },
        },
        {
            name: "Сначала старые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("createDate", "desc"),
            iconAfter: isSelected("createDate", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({
                    field: "createDate",
                    order: "desc",
                    label: "По дате создания, сначала старые",
                });
            },
        },
        {
            name: "По роли",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По роли</div>,
        },
        {
            name: "В должности",
            mode: "neutral",
            pale: true,
            disabled: isSelected("role", "asc"),
            iconAfter: isSelected("role", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({
                    field: "role",
                    order: "asc",
                    label: "По роли, в должности",
                });
            },
        },
        {
            name: "В системе",
            mode: "neutral",
            pale: true,
            disabled: isSelected("role", "desc"),
            iconAfter: isSelected("role", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({
                    field: "role",
                    order: "desc",
                    label: "По роли, в системе",
                });
            },
        },
        {
            name: "По группе",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По группе</div>,
        },
        {
            name: "В организации",
            mode: "neutral",
            pale: true,
            disabled: isSelected("group", "asc"),
            iconAfter: isSelected("group", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                setSortOption({
                    field: "group",
                    order: "asc",
                    label: "По группе, в организации",
                });
            },
        },
    ];

    const [rolesValue, setRolesValue] = useState<string[]>([]);
    const [positionValue, setPositionValue] = useState<string[]>([]);
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [name, setName] = useState<string>("");
    const [sortIsOpen, setSortIsOpen] = useState<boolean>(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [company, setCompany] = useState<SelectOption<string>[]>([]);
    useLayoutEffect(() => {
        appStore.userStore.fetchOnlineUser();
    }, []);
    const chipArray = useMemo(() => {
        const companyChips = company?.map((comp: SelectOption<string>) => (
            <Chip
                closePale={true}
                size={"small"}
                key={comp.value}
                onClick={() =>
                    setCompany((prevState) => {
                        return prevState?.filter((prev) => prev.value !== comp.value);
                    })
                }
                onDelete={() =>
                    setCompany((prevState) => {
                        return prevState?.filter((prev) => prev.value !== comp.value);
                    })
                }
            >
                {comp.name}
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
        return [...(companyChips ?? []), ...positionsChip];
    }, [company, positionValue]);
    const usersOnline = appStore.userStore.usersOnline;
    const onlineIds = Object.entries<any>(usersOnline)
        .filter(([_, value]) => value.status === "online")
        .map(([id]) => id);
    const filteredUsersByFilter = useMemo(() => {
        return users.filter((user) => {
            const orgIds = company?.map((c) => c.value);
            if (orgIds && orgIds.length > 0 && !orgIds.includes(user.organizationId as string)) {
                return false;
            }

            if (
                positionValue.length > 0 &&
                (!user.position || !positionValue.includes(user.position))
            ) {
                return false;
            }

            return !(onlineOnly && !onlineIds.includes(user.id as string));
        });
    }, [users, name, company, positionValue, onlineOnly, onlineIds]);
    const filteredUsersByName = useMemo(() => {
        return users.filter((user) => {
            if (name.trim() !== "") {
                if (user.role === "ROOT") return false;
                const userName = splitFullName(user).toLowerCase().trim();
                if (!userName.includes(name.toLowerCase())) return false;
            }
            return true;
        });
    }, [filteredUsersByFilter, name]);
    const filteredUsers = useMemo(() => {
        return filteredUsersByFilter.filter((user) => {
            if (name.trim() !== "") {
                if (user.role === "ROOT") return false;
                const userName = splitFullName(user).toLowerCase().trim();
                if (!userName.includes(name.toLowerCase())) return false;
            }
            return true;
        });
    }, [filteredUsersByFilter, name]);
    const resetFilters = () => {
        setPositionValue([]);
        setCompany([]);
        setOnlineOnly(false);
    };
    const onClickCard = (u: User) => {
        if (u.id !== currentUser?.id || !currentUser) {
            setCurrentUser(u);
        } else {
            setCurrentUser(undefined);
        }
    };
    const sortedUsers = sortItems(filteredUsers, sortOption);
    const renderContent = useMemo(() => {
        if (filteredUsersByFilter.length === 0)
            return (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <div className={styles.errorText}>
                        Не нашли пользователей <br />с такими фильтрами
                    </div>
                    <Button
                        style={{ marginTop: 32 }}
                        type={"primary"}
                        mode={"neutral"}
                        size={"small"}
                        onClick={resetFilters}
                    >
                        Сбросить
                    </Button>
                </div>
            );
        if (filteredUsersByName.length === 0)
            return (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <div className={styles.errorText}>
                        Не нашли пользователей <br />с таким именем
                    </div>
                </div>
            );
        if (
            filteredUsers.length === 0 &&
            (filteredUsersByName.length > 0 || filteredUsersByFilter.length > 0)
        )
            return (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <div className={styles.errorText}>
                        Не нашли пользователей <br />с такими параметрами
                    </div>
                </div>
            );
        return (
            <UserItemList
                onClick={(value: User) => {
                    onClickCard(value);
                }}
                users={sortedUsers}
                currentUser={currentUser}
                sortOption={sortOption}
            />
        );
    }, [filteredUsersByFilter, filteredUsersByName]);
    const usersForCsv = filteredUsers.map((user) => ({
        ...user,
        fullName: getFullName(user),
        workPhone: formatPhone(user.workPhone),
        personalPhone: formatPhone(user.personalPhone),
    }));
    const columnHeaders = [
        {
            key: "fullName",
            displayLabel: "Имя",
        },
        {
            key: "login",
            displayLabel: "Логин",
        },
        {
            key: "position",
            displayLabel: "Должность",
        },
        {
            key: "role",
            displayLabel: "Роль в системек",
        },
        {
            key: "messenger",
            displayLabel: "Мессенджер",
        },
        {
            key: "email",
            displayLabel: "Почта",
        },
        {
            key: "workPhone",
            displayLabel: "Рабочий телефон",
        },
        {
            key: "personalPhone",
            displayLabel: "Личный телефон",
        },
        {
            key: "createDate",
            displayLabel: "Регистрация в системе",
        },
    ];
    const date = new Date();
    const formattedDate = formatDateShort(date.toString()).slice(0, 5);
    const { downloadExcel } = useExcelExporter({
        data: usersForCsv as any,
        columnHeaders: columnHeaders,
        filename: `Пользователи_${formattedDate}`,
    });
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Пользователи – Build</title>
            </Helmet>
            <div className={styles.filterBlock}>
                <div>
                    <Button
                        size={"small"}
                        mode={"neutral"}
                        fullWidth={true}
                        iconBefore={<IconPlus />}
                        onClick={() => setOpenCreate(true)}
                    >
                        Новый пользователь
                    </Button>
                </div>
                <div>
                    <Button
                        fullWidth={true}
                        size={"small"}
                        type={"outlined"}
                        iconBefore={<IconImport />}
                        mode={"neutral"}
                        onClick={downloadExcel}
                    >
                        Экспорт в XLSX
                    </Button>
                </div>
                <div className={styles.filterContainer}>
                    <div className={styles.filterHead}>
                        <span style={{ opacity: 0.6 }}>Фильтры</span>
                        {(company?.length > 0 || positionValue.length > 0 || onlineOnly) && (
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
                            onOptionsChange={setCompany}
                            placeholder={"Все"}
                            options={companyOptions}
                            multiple={true}
                            formName={"Организация"}
                        ></MultipleSelect>
                        <MultipleAutocomplete
                            formName={"Объекты"}
                            options={companyOptions}
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
                    <div style={{ width: "100%" }}>
                        <Input
                            size={"large"}
                            startIcon={<IconSearch />}
                            onClear={() => setName("")}
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder={"Найти по имени"}
                        />
                    </div>
                    <div>
                        <SingleDropdownList
                            hideTip={true}
                            setShow={setSortIsOpen}
                            maxHeight={542}
                            options={dropDownSortOptions}
                            tipPosition={"top-right"}
                        >
                            <Button
                                size={"large"}
                                iconBefore={sortIsOpen ? <IconClose /> : <IconSorting />}
                                type={sortIsOpen ? "primary" : "outlined"}
                                mode={"neutral"}
                            ></Button>
                        </SingleDropdownList>
                    </div>
                </div>
                <div className={styles.containerHeader}>
                    {filteredUsers.length > 0 && (
                        <div className={styles.headFilters}>
                            <div className={styles.count}>
                                <span style={{ opacity: 0.6 }}>Отображается</span>
                                <span className={styles.countItem}>
                                    {pluralizeUsers(filteredUsers.length)}
                                </span>
                            </div>

                            <div className={styles.count} style={{ marginLeft: "auto" }}>
                                <span style={{ opacity: 0.6 }}>Сортируется</span>
                                <span className={styles.countItem}>{sortOption.label}</span>
                            </div>
                        </div>
                    )}
                    {chipArray && chipArray?.length > 0 && (
                        <div className={styles.chipsArray}>{chipArray}</div>
                    )}
                </div>
                <div className={styles.containerList}>{renderContent}</div>
            </div>
            <div className={styles.userCard}>
                {currentUser && (
                    <UserCard clearUser={() => setCurrentUser(undefined)} userId={currentUser.id} />
                )}
            </div>
            <UserForm open={openCreate} setOpen={setOpenCreate} />
            {/* <SnackbarProvider />*/}
        </div>
    );
});
