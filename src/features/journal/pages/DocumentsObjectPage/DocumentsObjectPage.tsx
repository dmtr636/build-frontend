import React, { useEffect, useMemo, useState } from "react";
import styles from "./DocumentsObjectPage.module.scss";
import { v4 } from "uuid";

import {
    IconApartment,
    IconCheckmark,
    IconClose,
    IconDocument,
    IconPin,
    IconSearch,
    IconSorting,
    IconUpdate,
} from "src/ui/assets/icons";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { appStore, layoutStore } from "src/app/AppStore.ts";
import { Helmet } from "react-helmet";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { SortOption } from "src/features/users";
import DocumentList from "src/features/journal/pages/DocumentsObjectPage/Components/DocumentList/DocumentList.tsx";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { ProjectDocumentDTO, UpdateProjectDTO } from "src/features/journal/types/Object.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { clsx } from "clsx";

function pluralizeDocuments(count: number): string {
    const absCount = Math.abs(count) % 100;
    const lastDigit = absCount % 10;

    if (absCount > 10 && absCount < 20) {
        return `${count} документов`;
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return `${count} документа`;
    }
    if (lastDigit === 1) {
        return `${count} документ`;
    }
    return `${count} документов`;
}
const DocumentsObjectPage = observer(() => {
    const { id } = useParams();
    const object = appStore.objectStore.ObjectMap.get(id ?? "");
    const documentList = object?.documents;
    const [groups, setGroups] = useState<string[]>([]);
    const [date, setDate] = useState<string | null>(null);
    const [value, setValue] = useState("");
    const [sortIsOpen, setSortIsOpen] = useState<boolean>(false);
    const [groupOptions, setGroupOptions] = useState<SelectOption<string>[]>([]);
    const shouldBlockButton = false;
    const [sortOption, setSortOption] = useState<SortOption>({
        field: "name",
        order: "asc",
        label: "По алфавиту, от А - Я",
    });
    const onChangeSort = (sort: SortOption) => {
        setSortOption(sort);
        /*
                appStore.objectStore.setSortOption(sort);
        */
    };
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
            disabled: isSelected("createdAt", "asc"),
            iconAfter: isSelected("createdAt", "asc") ? <IconCheckmark /> : undefined,
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
            disabled: isSelected("createdAt", "desc"),
            iconAfter: isSelected("createdAt", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                onChangeSort({
                    field: "createdAt",
                    order: "desc",
                    label: "По дате создания, сначала старые",
                });
            },
        },
    ];
    const resetFilters = () => {
        setGroups([]);
        setDate(null);
    };
    useEffect(() => {
        const groupOptions = [
            ...new Set(
                object?.documents
                    .filter((doc) => doc.documentGroup)
                    .map((item) => item.documentGroup),
            ),
        ];

        if (groupOptions) {
            const groupOptionList: SelectOption<string>[] = groupOptions.map((group) => ({
                name: group as string,
                value: group as string,
            }));
            setGroupOptions(groupOptionList);
        }
    }, [object]);
    const [openOverlay, setOpenOverlay] = useState<boolean>(false);
    const [fileData, setFileData] = useState<File | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [currentDocName, setCurrentDocName] = useState<string>("");
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);
    const currentUser = appStore.accountStore.currentUser;

    const documentForm: ProjectDocumentDTO = {
        id: fileId ?? "",
        name: currentDocName.trim() === "" ? "Без названия" : currentDocName,
        documentGroup: currentGroup ?? undefined,
        file: {
            id: fileId ?? "",
            originalFileName: fileData?.name,
            type: fileData?.type,
            userId: currentUser?.id,
        },
    };
    const setInitialValue = () => {};
    const onClick = () => {
        const updateObjForm: UpdateProjectDTO = {
            ...object,
            documents: [...(object?.documents ?? []), documentForm],
        };
        if (updateObjForm) {
            appStore.objectStore.updateObject(updateObjForm).then(() => {
                snackbarStore.showNeutralPositiveSnackbar("Документ успешно добавлен");
                setCurrentDocName("");
                setCurrentGroup(null);
                setFileData(null);
                setFileId(null);
                setOpenOverlay(false);
            });
        }
    };
    const filteredDocuments = useMemo(() => {
        if (!documentList) return [];

        const getTs = (value: any): number | null => {
            if (!value) return null;
            const t = new Date(value).getTime();
            return Number.isNaN(t) ? null : t;
        };

        const mkDayRange = (dateStr: string) => {
            // Ожидаем формат "YYYY-MM-DD" из DatePicker без времени
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [y, m, d] = dateStr.split("-").map(Number);
                const start = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
                const end = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
                return { start, end };
            }
            // На всякий случай — если придёт ISO-строка
            const d = new Date(dateStr);
            const start = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                0,
                0,
                0,
                0,
            ).getTime();
            const end = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                23,
                59,
                59,
                999,
            ).getTime();
            return { start, end };
        };

        const dateRange = date ? mkDayRange(date) : null;

        const filtered = documentList.filter((obj) => {
            if (value) {
                const lower = value.toLowerCase();
                if (!obj.name?.toLowerCase().includes(lower)) return false;
            }

            if (groups.length > 0 && !groups.includes(obj?.documentGroup ?? "")) {
                return false;
            }

            if (dateRange) {
                const ts =
                    getTs((obj as any).file.createdAt) ??
                    getTs((obj as any).file.updatedAt) ??
                    getTs((obj as any).file?.createdAt);

                if (ts == null) return false;
                if (ts < dateRange.start || ts > dateRange.end) return false;
            }

            return true;
        });

        const sorted = filtered.sort((a, b) => {
            const { field, order } = sortOption;

            // Если сортировка по дате — берем поле из a.file / b.file
            let valueA: any;
            let valueB: any;

            if (field === "createdAt" || field === "updatedAt") {
                valueA = getTs((a as any).file[field]);
                valueB = getTs((b as any).file[field]);
            } else {
                valueA = (a as any)[field];
                valueB = (b as any)[field];
            }

            // Если это строки — приводим к нижнему регистру
            if (typeof valueA === "string") valueA = valueA.toLowerCase();
            if (typeof valueB === "string") valueB = valueB.toLowerCase();

            // Обработка null/undefined
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return order === "asc" ? 1 : -1;
            if (valueB == null) return order === "asc" ? -1 : 1;

            // Сравнение
            if (valueA < valueB) return order === "asc" ? -1 : 1;
            if (valueA > valueB) return order === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [documentList, value, groups, date, sortOption]);
    const onClose = () => {
        setFileId(null);
        setFileData(null);
        setCurrentDocName("");
        setCurrentGroup(null);
        setOpenOverlay(false);
    };
    if (documentList?.length === 0 && !openOverlay) {
        return (
            <div className={styles.container}>
                <Helmet>
                    <title>Объекты – Build</title>
                </Helmet>
                <div className={styles.noDocs}>
                    <div className={styles.textNoDocs}>
                        <IconDocument />
                        Пока документы <br /> не добавлены
                    </div>
                    <Media
                        type={"doc"}
                        buttonSize={"small"}
                        style={{ height: 36, width: 298, marginBottom: 60 }}
                        onSelectFile={async (file) => {
                            setFileData(file);
                            const imageId = await appStore.accountStore.uploadMediaFile(
                                file,
                                "PROJECT_DOCUMENT",
                            );

                            setFileId(imageId);
                            if (file) {
                                setOpenOverlay(true);
                                setCurrentDocName(file.name);
                            }
                        }}
                        onRemoveFile={() => {
                            setFileId(null);
                        }}
                        maxSizeMB={100}
                    ></Media>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <Helmet>
                <title>{object?.name}</title>
            </Helmet>
            {shouldBlockButton && (
                <div className={styles.footer}>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Button
                            mode={"neutral"}
                            type={"outlined"}
                            onClick={() => setInitialValue()}
                        >
                            Отменить
                        </Button>
                        <Button
                            disabled={!shouldBlockButton}
                            mode={"neutral"}
                            type={"primary"}
                            onClick={onClick}
                        >
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            )}
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconDocument />
                </div>
                Документы
            </div>

            <div className={styles.content}>
                <div className={styles.filterBlock}>
                    <div>
                        <Media
                            type={"doc"}
                            style={{ height: 52 }}
                            onSelectFile={async (file) => {
                                setFileData(file);
                                const imageId = await appStore.accountStore.uploadMediaFile(
                                    file,
                                    "PROJECT_DOCUMENT",
                                );

                                setFileId(imageId);
                                if (file) {
                                    setOpenOverlay(true);
                                    setCurrentDocName(file.name);
                                }
                            }}
                            onRemoveFile={() => {
                                setFileId(null);
                            }}
                            maxSizeMB={100}
                        ></Media>
                    </div>

                    <div className={styles.filterContainer}>
                        <div className={styles.filterHead}>
                            <span style={{ opacity: 0.6 }}>Фильтры</span>
                            {(date || groups.length > 0) && (
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
                                values={groups}
                                onValuesChange={setGroups}
                                options={groupOptions}
                                multiple={true}
                                placeholder={"Все"}
                                size={"large"}
                                formName={"Группа"}
                            ></MultipleSelect>
                            <DatePicker
                                width={250}
                                value={date}
                                onChange={setDate}
                                size={"large"}
                                formName={"Был загружен"}
                                disableFuture={true}
                                disableTime={true}
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
                                placeholder={"Найти по названию документа"}
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
                                />
                            </SingleDropdownList>
                        </div>
                    </div>

                    <div
                        className={clsx(styles.containerHeader, {
                            [styles.windowScrolled]: layoutStore.scrolled,
                        })}
                    >
                        {documentList && documentList.length > 0 && (
                            <div className={styles.headFilters}>
                                <div className={styles.count}>
                                    <span style={{ opacity: 0.6 }}>Отображается</span>
                                    <span className={styles.countItem}>
                                        {pluralizeDocuments(documentList.length)}
                                    </span>
                                </div>

                                <div className={styles.count} style={{ marginLeft: "auto" }}>
                                    <span style={{ opacity: 0.6 }}>Сортируется</span>
                                    <span className={styles.countItem}>{sortOption.label}</span>
                                </div>
                            </div>
                        )}

                        {/* {chipArray && chipArray?.length > 0 && (
                            <div className={styles.chipsArray}>{chipArray}</div>
                        )}*/}
                    </div>

                    <div className={clsx(styles.containerList)}>
                        <DocumentList
                            documentList={filteredDocuments}
                            sort={sortOption}
                            object={object as any}
                        />
                    </div>
                </div>
            </div>
            <Overlay
                onClose={() => setOpenOverlay(false)}
                open={openOverlay}
                title={"Файл загружен!"}
                titleMode={"positive"}
                styles={{
                    card: {
                        width: 564,
                        height: 408,
                    },
                }}
            >
                <div className={styles.overlayContainer}>
                    <div className={styles.inputOverlayContainer}>
                        <div>
                            <Input
                                size={"large"}
                                onChange={(e) => setCurrentDocName(e.target.value)}
                                value={currentDocName}
                                formName={"Название документа"}
                                placeholder={"Введите название документа"}
                            />
                        </div>
                        <div>
                            <Autocomplete
                                zIndex={99999}
                                size={"large"}
                                placeholder={"Введите группу или выберите из списка"}
                                formName={"Группа"}
                                options={groupOptions}
                                value={currentGroup}
                                addButtonLabel={"Добавить группу"}
                                onAddButtonClick={(value) => {
                                    setGroupOptions((prevState) => [
                                        ...prevState,
                                        { name: value, value: value },
                                    ]);
                                    setCurrentGroup(value);
                                }}
                                onValueChange={setCurrentGroup}
                            />
                        </div>
                    </div>
                    <div className={styles.buttonsOverlay}>
                        <Media
                            docChange={true}
                            type={"doc"}
                            style={{ height: 52 }}
                            onSelectFile={async (file) => {
                                setFileData(file);
                                const imageId = await appStore.accountStore.uploadMediaFile(
                                    file,
                                    "PROJECT_DOCUMENT",
                                );

                                setFileId(imageId);
                                if (file) {
                                    setCurrentDocName(file.name);
                                }
                            }}
                            onRemoveFile={() => {
                                setFileId(null);
                            }}
                            maxSizeMB={100}
                        />
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={onClose}
                        >
                            Отмена
                        </Button>{" "}
                        <Button onClick={onClick} mode={"neutral"}>
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            </Overlay>
        </div>
    );
});

export default DocumentsObjectPage;
