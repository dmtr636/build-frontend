import React, { useEffect, useState } from "react";
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
import { appStore } from "src/app/AppStore.ts";
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
import exifr from "exifr";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { ProjectDocumentDTO, UpdateProjectDTO } from "src/features/journal/types/Object.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

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
        name: currentDocName.trim() === "" ? "Без Названия" : currentDocName,
        documentGroup: currentGroup ?? undefined,
        file: {
            id: fileId ?? "",
            originalFileName: fileData?.name,
            type: fileData?.type,
            userId: currentUser?.id,
        },
    };
    console.log(currentDocName);
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
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Объекты – Build</title>
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
                                console.log(imageId);
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
                                ></Button>
                            </SingleDropdownList>
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}></div>
                    <DocumentList documentList={documentList} sort={sortOption} />
                </div>
            </div>
            <Overlay
                onClose={() => setOpenOverlay(false)}
                open={openOverlay}
                title={"Файл загружен! "}
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
                        <Button type={"secondary"} mode={"neutral"}>
                            Отмена
                        </Button>{" "}
                        <Button onClick={onClick} mode={"neutral"}>
                            Сохранить
                        </Button>
                    </div>
                </div>
            </Overlay>
        </div>
    );
});

export default DocumentsObjectPage;
