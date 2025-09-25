import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./journal.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { appStore, registryStore } from "src/app/AppStore.ts";
import {
    IconCheckmark,
    IconClose,
    IconPin,
    IconPlus,
    IconSearch,
    IconSorting,
    IconUpdate,
    IconXlsx,
} from "src/ui/assets/icons";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { clsx } from "clsx";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { SortOption } from "src/features/users";
import JournalList from "src/features/journal/components/JournalList/JournalList.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import MapObjectsEditor, { MapObject } from "src/features/map/Map.tsx";

export const JournalPage = observer(() => {
    const loginUser = appStore.accountStore.currentUser;
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");
    const [sortOption, setSortOption] = useState<SortOption>({
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    });
    const [showMapsOverlay, setShowMapsOverlay] = useState(false);
    const [objects, setObjects] = useState<MapObject[]>([
        {
            id: "t1",
            name: "Тест 1",
            marker: { lat: 55.7578, lng: 37.6156 },
            polygon: [
                { lat: 55.7603, lng: 37.6116 },
                { lat: 55.7603, lng: 37.6196 },
                { lat: 55.7553, lng: 37.6196 },
                { lat: 55.7553, lng: 37.6116 },
            ],
            color: "#FA0032",
        },
        {
            id: "t2",
            name: "Тест 2",
            marker: { lat: 55.7487, lng: 37.5905 },
            polygon: [
                { lat: 55.7512, lng: 37.5855 },
                { lat: 55.7512, lng: 37.5955 },
                { lat: 55.7462, lng: 37.5955 },
                { lat: 55.7462, lng: 37.5855 },
            ],
            color: "#FA0032",
        },
        {
            id: "t3",
            name: "Тест 3",
            marker: { lat: 55.7517, lng: 37.628 },
            polygon: [
                { lat: 55.7542, lng: 37.6225 },
                { lat: 55.7542, lng: 37.6335 },
                { lat: 55.7492, lng: 37.6335 },
                { lat: 55.7492, lng: 37.6225 },
            ],
            color: "#FA0032",
        },
        {
            id: "t4",
            name: "Тест 4",
            marker: { lat: 55.7643, lng: 37.5931 },
            polygon: [
                { lat: 55.7668, lng: 37.5881 },
                { lat: 55.7668, lng: 37.5981 },
                { lat: 55.7618, lng: 37.5981 },
                { lat: 55.7618, lng: 37.5881 },
            ],
            color: "#FA0032",
        },
        {
            id: "t5",
            name: "Тест 5",
            marker: { lat: 55.7489, lng: 37.5366 },
            polygon: [
                { lat: 55.7514, lng: 37.5316 },
                { lat: 55.7514, lng: 37.5416 },
                { lat: 55.7464, lng: 37.5416 },
                { lat: 55.7464, lng: 37.5316 },
            ],
            color: "#FA0032",
        },
    ]);

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
                onChangeSort({ field: "name", order: "asc", label: "По алфавиту, от А - Я" });
            },
        },
        {
            name: "От Я - А",
            mode: "neutral",
            pale: true,
            disabled: isSelected("name", "desc"),
            iconAfter: isSelected("name", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                onChangeSort({ field: "name", order: "desc", label: "По алфавиту, от Я - А" });
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
                    field: "createdAt",
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
                onChangeSort({
                    field: "createdAt",
                    order: "desc",
                    label: "По дате создания, сначала старые",
                });
            },
        },
        {
            name: "По дате проверки",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По дате проверки</div>,
        },
        {
            name: "Сначала новые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("role", "asc"),
            iconAfter: isSelected("role", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                onChangeSort({
                    field: "role",
                    order: "asc",
                    label: "По дате проверки, сначала новые",
                });
            },
        },
        {
            name: "Сначала старые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("role", "desc"),
            iconAfter: isSelected("role", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                onChangeSort({
                    field: "role",
                    order: "desc",
                    label: "По дате проверки, сначала старые",
                });
            },
        },
    ];

    const [openCreate, setOpenCreate] = useState(false);
    const [sortIsOpen, setSortIsOpen] = useState<boolean>(false);
    const [value, setValue] = useState("");
    const journalList = appStore.objectStore.objects;
    const [objectStatus, setObjectStatus] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const typeList = new Set(journalList.map((item) => item.type).filter((i) => i));
    const [hasViolations, setHasViolations] = useState(false);
    const [responseCustomer, setResponseCustomer] = useState<string[]>([]);
    const [responseContractor, setResponseContractor] = useState<string[]>([]);
    const [contractorOrg, setContractorOrg] = useState<string[]>([]);
    const [customerOrg, setCustomerOrg] = useState<string[]>([]);
    const [haveUser, setHaveUser] = useState<string[]>([]);
    const typeOptions: SelectOption<string>[] = [...typeList].map((item) => ({
        name: item,
        value: item,
    }));
    const statusOptions: SelectOption<string>[] = [
        { name: "Ожидание", value: "AWAIT" },
        {
            name: "Стройка",
            value: "IN_PROGRESS",
        },
        { name: "Завершён", value: "COMPLETE" },
    ];
    const usersArrayList = [...new Set(journalList.flatMap((journal) => journal.projectUsers))];
    const orgsIdArrayCustomer = [
        ...new Set(journalList.map((obj) => obj.customerOrganization).filter((i) => i)),
    ];
    const orgsIdArrayContractor = [
        ...new Set(journalList.map((obj) => obj.contractorOrganization).filter((i) => i)),
    ];
    const filteredJournalList = useMemo(() => {
        return journalList
            .filter((obj) => {
                if (value) {
                    const lower = value.toLowerCase().replace(/-/g, "");
                    if (
                        !obj.name?.toLowerCase().replace(/-/g, "").includes(lower) &&
                        !obj.objectNumber?.toLowerCase().replace(/-/g, "").includes(lower) &&
                        !obj.objectNumber?.toLowerCase().replace(/-/g, "").includes(lower)
                    ) {
                        return false;
                    }
                }

                // ✅ Фильтр по типу
                if (types.length > 0 && !types.includes(obj.type)) {
                    return false;
                }

                // ✅ Фильтр по статусу
                if (objectStatus.length > 0 && !objectStatus.includes(obj.status)) {
                    return false;
                }

                // ✅ Фильтр по "Только с нарушениями"
                if (hasViolations && !obj.hasViolations) {
                    return false;
                }

                // ✅ Фильтр по ответственному (Заказчик)
                if (
                    responseCustomer.length > 0 &&
                    !obj.projectUsers.some(
                        (u) =>
                            u.side === "CUSTOMER" &&
                            u.isResponsible &&
                            responseCustomer.includes(u.id),
                    )
                ) {
                    return false;
                }

                // ✅ Фильтр по ответственному (Подрядчик)
                if (
                    responseContractor.length > 0 &&
                    !obj.projectUsers.some(
                        (u) =>
                            u.side === "CONTRUCTOR" &&
                            u.isResponsible &&
                            responseContractor.includes(u.id),
                    )
                ) {
                    return false;
                }

                // ✅ Фильтр по организациям (Заказчик)
                if (customerOrg.length > 0 && !customerOrg.includes(obj.customerOrganization)) {
                    return false;
                }

                // ✅ Фильтр по организациям (Подрядчик)
                if (
                    contractorOrg.length > 0 &&
                    !contractorOrg.includes(obj.contractorOrganization)
                ) {
                    return false;
                }

                // ✅ Фильтр "Задействован пользователь"
                if (haveUser.length > 0 && !obj.projectUsers.some((u) => haveUser.includes(u.id))) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                const { field, order } = sortOption;

                let valueA: any = (a as any)[field];
                let valueB: any = (b as any)[field];

                // Даты → преобразуем в timestamp
                if (field === "createdAt" || field === "updatedAt" || field === "lastInspection") {
                    valueA = new Date(valueA).getTime();
                    valueB = new Date(valueB).getTime();
                }

                // Строки → в нижний регистр
                if (typeof valueA === "string") valueA = valueA.toLowerCase();
                if (typeof valueB === "string") valueB = valueB.toLowerCase();

                if (valueA < valueB) return order === "desc" ? -1 : 1;
                if (valueA > valueB) return order === "desc" ? 1 : -1;
                return 0;
            });
    }, [
        journalList,
        value,
        types,
        objectStatus,
        hasViolations,
        responseCustomer,
        responseContractor,
        customerOrg,
        contractorOrg,
        haveUser,
        sortOption,
    ]);
    const [newObjName, setNewObjName] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        if (userId) setHaveUser((prevState) => [...prevState, userId]);
    }, [userId]);
    const onChangeSort = (sort: SortOption) => {
        setSortOption(sort);
        appStore.objectStore.setSortOption(sort);
    };
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Объекты – Build</title>
            </Helmet>
            <div className={styles.filterBlock}>
                {loginUser?.role !== "USER" && (
                    <div>
                        <Button
                            size={"small"}
                            mode={"neutral"}
                            fullWidth={true}
                            iconBefore={<IconPlus />}
                            onClick={() => setOpenCreate(true)}
                        >
                            Новый объект
                        </Button>
                    </div>
                )}
                <div>
                    <Button
                        fullWidth={true}
                        size={"small"}
                        type={"outlined"}
                        customIconBefore={<IconXlsx />}
                        mode={"neutral"}
                        /*
                                                onClick={downloadExcel}
                        */
                    >
                        Экспорт в XLSX
                    </Button>
                </div>
                <div className={styles.filterContainer}>
                    <div className={styles.filterHead}>
                        <span style={{ opacity: 0.6 }}>Фильтры</span>
                        {(types?.length > 0 || objectStatus.length > 0 || hasViolations) && (
                            <Button
                                /*
                                                                onClick={resetFilters}
                                */
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
                            values={types}
                            onValuesChange={setTypes}
                            options={typeOptions}
                            multiple={true}
                            placeholder={"Все"}
                            formName={"Тип объекта"}
                        ></MultipleSelect>
                        <MultipleSelect
                            values={objectStatus}
                            onValuesChange={setObjectStatus}
                            placeholder={"Все"}
                            options={statusOptions}
                            multiple={true}
                            formName={"Статус объекта"}
                        ></MultipleSelect>
                        <MultipleAutocomplete
                            formName={"Ответственный (Заказчик)"}
                            options={usersArrayList
                                .filter((user) => user.side === "CUSTOMER" && user.isResponsible)
                                .map((item) => ({
                                    name: getFullName(item),
                                    value: item.id,
                                }))}
                            placeholder={"Все"}
                            values={responseCustomer}
                            onValuesChange={setResponseCustomer}
                            multiple={true}
                        />
                        <MultipleAutocomplete
                            formName={"Ответственный (Подрядчик)"}
                            options={usersArrayList
                                .filter((user) => user.side === "CONTRUCTOR" && user.isResponsible)
                                .map((item) => ({
                                    name: getFullName(item),
                                    value: item.id,
                                }))}
                            placeholder={"Все"}
                            values={responseContractor}
                            onValuesChange={setResponseContractor}
                            multiple={true}
                        />
                        <MultipleAutocomplete
                            formName={"Заказчик"}
                            options={orgsIdArrayCustomer.map((org) => ({
                                name: appStore.organizationsStore.organizationById(org)?.name ?? "",
                                value: org,
                            }))}
                            placeholder={"Все"}
                            values={customerOrg}
                            onValuesChange={setCustomerOrg}
                            multiple={true}
                        />
                        <MultipleAutocomplete
                            formName={"Подрядчик"}
                            options={orgsIdArrayContractor.map((org) => ({
                                name: appStore.organizationsStore.organizationById(org)?.name ?? "",
                                value: org,
                            }))}
                            placeholder={"Все"}
                            values={contractorOrg}
                            onValuesChange={setContractorOrg}
                            multiple={true}
                        />
                        <MultipleAutocomplete
                            formName={"Задействован пользователь"}
                            options={usersArrayList.map((user) => ({
                                name: getFullName(user),
                                value: user.id,
                            }))}
                            placeholder={"Все"}
                            values={haveUser}
                            onValuesChange={setHaveUser}
                            multiple={true}
                        />
                        <Checkbox
                            size={"large"}
                            onChange={setHasViolations}
                            checked={hasViolations}
                            title={"Только с нарушениями"}
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
                            onClear={() => setValue("")}
                            onChange={(e) => setValue(e.target.value)}
                            value={value}
                            placeholder={"Найти по названию или номеру объекта"}
                        />
                    </div>
                    <div>
                        <Tooltip header={"Карта"} delay={500}>
                            <Button
                                size={"large"}
                                iconBefore={<IconPin />}
                                type={"outlined"}
                                mode={"neutral"}
                                onClick={() => setShowMapsOverlay(true)}
                            ></Button>
                        </Tooltip>
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
                <div style={{ marginTop: 12 }}></div>
                <JournalList
                    journalList={filteredJournalList}
                    sort={appStore.objectStore.sortOption}
                />
            </div>
            <Overlay
                styles={{
                    card: {
                        width: 564,
                        /* height: 408,*/
                    },
                }}
                title={"Новый объект"}
                open={openCreate}
                onClose={() => {
                    setNewObjName("");
                    setOpenCreate(false);
                }}
                actions={[
                    <Flex key={44} width={"500px"} gap={16}>
                        <div key={1} style={{ marginLeft: "auto" }}>
                            <Button
                                type={"secondary"}
                                mode={"neutral"}
                                onClick={() => {
                                    setNewObjName("");
                                    setOpenCreate(false);
                                }}
                            >
                                Отменить
                            </Button>
                        </div>
                        <div>
                            <Button
                                key={2}
                                type={"primary"}
                                mode={"neutral"}
                                disabled={!newObjName}
                                onClick={async () => {
                                    const response = await appStore.objectStore.createObject({
                                        name: newObjName,
                                        status: "Await",
                                    });
                                    if (response) {
                                        navigate(`/admin/journal/${response.data.id}`);
                                    }
                                }}
                            >
                                Добавить
                            </Button>
                        </div>
                    </Flex>,
                ]}
            >
                <div style={{ width: "100%", marginBottom: 178 }}>
                    <Input
                        onChange={(e) => {
                            setNewObjName(e.target.value);
                        }}
                        value={newObjName}
                        formName={"Название объекта"}
                        required={true}
                    />
                </div>
            </Overlay>

            {showMapsOverlay && (
                <Overlay
                    open={showMapsOverlay}
                    onClose={() => setShowMapsOverlay(false)}
                    title={"Карта"}
                    styles={{
                        card: {
                            width: "65vw",
                        },
                    }}
                >
                    <MapObjectsEditor objects={objects} />
                </Overlay>
            )}
        </div>
    );
});
