import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet";
import React, { useState } from "react";
import styles from "./journal.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { appStore } from "src/app/AppStore.ts";
import {
    IconCheckmark,
    IconClose,
    IconImport,
    IconPin,
    IconPlus,
    IconSearch,
    IconSorting,
    IconXlsx,
} from "src/ui/assets/icons";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { clsx } from "clsx";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { SortOption } from "src/features/users";
import JournalItemCard from "src/features/journal/components/JournalItemCard/JournalItemCard.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import MapObjectsEditor, { MapObject } from "src/features/map/Map.tsx";

export const JournalPage = observer(() => {
    const loginUser = appStore.accountStore.currentUser;
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
                setSortOption({
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
                setSortOption({
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
                setSortOption({
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
                {/*
                <div className={clsx(styles.containerHeader, { [styles.scrolled]: scrolled })}>
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
                <div className={clsx(styles.containerList)}>{renderContent}</div>*/}
                <div style={{ marginTop: 20 }}></div>
                <JournalItemCard />
            </div>
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
