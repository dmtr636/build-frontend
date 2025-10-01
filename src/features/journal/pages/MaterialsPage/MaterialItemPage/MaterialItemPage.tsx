import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { appStore, layoutStore, materialsStore, worksStore } from "src/app/AppStore.ts";
import { clsx } from "clsx";
import styles from "src/features/journal/pages/MaterialsPage/MaterialsPage.module.scss";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    IconAttach,
    IconBasket,
    IconCheckmark,
    IconClose,
    IconDocument,
    IconImage,
    IconVideo,
} from "src/ui/assets/icons";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { observer } from "mobx-react-lite";
import { FileDto } from "src/features/journal/types/Object.ts";
import { useNavigate, useParams } from "react-router-dom";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { fileStore } from "src/features/users/stores/FileStore.ts";

const getFileDtoImage = (file: FileDto) => {
    const defaultImageFormats = ["png", "jpg", "jpeg", "webp", "gif"];
    const defaultVideoFormats = ["mp4", "webm", "ogg"];
    if (defaultImageFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
        return <IconImage style={{ opacity: 0.6 }} />;
    }
    if (defaultVideoFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
        return <IconVideo style={{ opacity: 0.6 }} />;
    }
    return <IconDocument style={{ opacity: 0.6 }} />;
};

const MaterialItemPage = observer(() => {
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(false);
    const orgCardRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const params = useParams<{ materialId: string }>();

    useLayoutEffect(() => {
        materialsStore.currentMaterialId = params.materialId || null;
    }, [params.materialId]);

    useEffect(() => {
        if (id) {
            worksStore.fetchWorks(id);
            materialsStore.fetchMaterials(id);
        }
    }, [id]);

    const isSelected = (field: string, order: "asc" | "desc") =>
        materialsStore.sort.field === field && materialsStore.sort?.direction === order;

    const dropDownSortOptions: DropdownListOption<string>[] = [
        {
            name: "По дате создания",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По дате создания</div>,
        },
        {
            name: "Сначала новые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("createdAt", "desc"),
            iconAfter: isSelected("createdAt", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                materialsStore.sort = {
                    field: "createdAt",
                    direction: "desc",
                };
            },
        },
        {
            name: "Сначала старые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("createdAt", "asc"),
            iconAfter: isSelected("createdAt", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                materialsStore.sort = {
                    field: "createdAt",
                    direction: "asc",
                };
            },
        },
    ];

    const currentMaterial = materialsStore.currentMaterial;

    useEffect(() => {
        if (currentMaterial) {
            materialsStore.editForm = deepCopy(currentMaterial);
        } else {
            materialsStore.editForm = {};
        }
    }, [currentMaterial]);

    const scrollBarWidth = useMemo(() => getScrollBarWidth(), []);

    useEffect(() => {
        const el = orgCardRef.current;
        if (!el) {
            setShowBottomGradient(false);
            return;
        }

        const updateGradientVisibility = () => {
            const hasVerticalScroll = el.scrollHeight > el.clientHeight + 1;
            const scrolledToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            setShowBottomGradient(hasVerticalScroll && !scrolledToBottom);
        };

        updateGradientVisibility();
        el.addEventListener("scroll", updateGradientVisibility, { passive: true });
        window.addEventListener("resize", updateGradientVisibility, { passive: true });
        return () => {
            el.removeEventListener("scroll", updateGradientVisibility);
            window.removeEventListener("resize", updateGradientVisibility);
        };
        // Re-evaluate when the current material or its users list changes
    }, [
        materialsStore.currentMaterialId,
        materialsStore.showAddOverlay,
        materialsStore.tab,
        orgCardRef.current,
    ]);

    const hasActiveFilters = materialsStore.hasActiveFilters;

    const getFileDtoImage = (file: FileDto) => {
        const defaultImageFormats = ["png", "jpg", "jpeg", "webp", "gif"];
        const defaultVideoFormats = ["mp4", "webm", "ogg"];
        if (defaultImageFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
            return <IconImage style={{ opacity: 0.6 }} />;
        }
        if (defaultVideoFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
            return <IconVideo style={{ opacity: 0.6 }} />;
        }
        return <IconDocument style={{ opacity: 0.6 }} />;
    };
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            await fileStore.uploadFile(files[0], "PROJECT_DOCUMENT", undefined, (fileDto) => {
                if (materialsStore.tab === "waybill") {
                    if (!materialsStore.addForm.waybill) {
                        materialsStore.addForm.waybill = {} as any;
                        if (
                            materialsStore.addForm.waybill &&
                            !materialsStore.addForm.waybill?.files
                        ) {
                            materialsStore.addForm.waybill.files = [];
                        }
                    }
                    materialsStore.addForm.waybill?.files.push(fileDto);
                } else {
                    if (!materialsStore.addForm.passportQuality) {
                        materialsStore.addForm.passportQuality = {} as any;
                        if (
                            materialsStore.addForm.passportQuality &&
                            !materialsStore.addForm.passportQuality?.files
                        ) {
                            materialsStore.addForm.passportQuality.files = [];
                        }
                    }
                    materialsStore.addForm.passportQuality?.files.push(fileDto);
                }
            });
        }
    };

    const handleFileChangeEdit = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            await fileStore.uploadFile(files[0], "PROJECT_DOCUMENT", undefined, (fileDto) => {
                if (materialsStore.tab === "waybill") {
                    if (!materialsStore.editForm.waybill) {
                        materialsStore.editForm.waybill = {} as any;
                        if (
                            materialsStore.editForm.waybill &&
                            !materialsStore.editForm.waybill?.files
                        ) {
                            materialsStore.editForm.waybill.files = [];
                        }
                    }
                    materialsStore.editForm.waybill?.files.push(fileDto);
                } else {
                    if (!materialsStore.editForm.passportQuality) {
                        materialsStore.editForm.passportQuality = {} as any;
                        if (
                            materialsStore.editForm.passportQuality &&
                            !materialsStore.editForm.passportQuality?.files
                        ) {
                            materialsStore.editForm.passportQuality.files = [];
                        }
                    }
                    materialsStore.editForm.passportQuality?.files.push(fileDto);
                }
            });
        }
    };
    const isMobile = layoutStore.isMobile;
    useLayoutEffect(() => {
        layoutStore.setHeaderProps({ title: "Материалы" });
    }, []);
    return (
        <div>
            <div
                style={{
                    width: "100vw",
                }}
            >
                <div
                    ref={orgCardRef}
                    className={clsx(
                        styles.orgCard,
                        deepEquals(materialsStore.editForm, currentMaterial) && styles.noFooter,
                    )}
                >
                    <Tooltip header={"Удалить"} delay={500}>
                        <Button
                            className={styles.deleteButton}
                            size={"small"}
                            type={"tertiary"}
                            mode={"negative"}
                            iconBefore={<IconBasket />}
                            onClick={() => {
                                materialsStore.deletingMaterial = currentMaterial as any;
                                materialsStore.showDeleteOverlay = true;
                            }}
                        />
                    </Tooltip>
                    <FlexColumn gap={16} style={{ position: "relative" }}>
                        <Flex gap={16} align={"center"}>
                            <Typo
                                variant={"h5"}
                                type={"primary"}
                                mode={materialsStore.tab === "waybill" ? "accent" : "neutral"}
                                onClick={() => {
                                    materialsStore.tab = "waybill";
                                }}
                                className={
                                    materialsStore.tab === "quality"
                                        ? styles.tabHeaderButton
                                        : undefined
                                }
                                style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                    opacity: materialsStore.tab === "waybill" ? "1" : "0.6",
                                }}
                            >
                                ТТН
                            </Typo>
                            <Typo
                                variant={"h5"}
                                type={"primary"}
                                mode={materialsStore.tab === "quality" ? "accent" : "neutral"}
                                onClick={() => {
                                    materialsStore.tab = "quality";
                                }}
                                className={
                                    materialsStore.tab === "waybill"
                                        ? styles.tabHeaderButton
                                        : undefined
                                }
                                style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                    opacity: materialsStore.tab === "quality" ? "1" : "0.6",
                                }}
                            >
                                Паспорт качества
                            </Typo>
                        </Flex>
                        {materialsStore.tab === "quality" && (
                            <>
                                <Button
                                    mode={"neutral"}
                                    iconBefore={<IconAttach />}
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                            fileInputRef.current.click();
                                        }
                                    }}
                                >
                                    Прикрепить{" "}
                                    {materialsStore.editForm.passportQuality?.files?.length
                                        ? "ещё"
                                        : "паспорт"}
                                </Button>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileChangeEdit}
                                />

                                {!!materialsStore.editForm.passportQuality?.files?.length && (
                                    <div
                                        style={{
                                            borderRadius: 8,
                                            background: "#F0F0F0",
                                            padding: "12px",
                                        }}
                                    >
                                        <Typo
                                            variant={"subheadM"}
                                            style={{
                                                marginBottom: 12,
                                            }}
                                        >
                                            Загруженные файлы
                                        </Typo>
                                        <FlexColumn gap={8}>
                                            {materialsStore.editForm.passportQuality.files.map(
                                                (fileDTO, index) => (
                                                    <Grid
                                                        gap={16}
                                                        columns={"1fr auto"}
                                                        align={"center"}
                                                        key={index}
                                                    >
                                                        <Button
                                                            type={"text"}
                                                            size={"small"}
                                                            iconBefore={getFileDtoImage(fileDTO)}
                                                            align={"start"}
                                                            style={{
                                                                overflow: "hidden",
                                                            }}
                                                            onClick={async () => {
                                                                const response = await fetch(
                                                                    fileUrl(fileDTO.id) as string,
                                                                );
                                                                const blob = await response.blob();
                                                                const blobUrl =
                                                                    window.URL.createObjectURL(
                                                                        blob,
                                                                    );

                                                                const link =
                                                                    document.createElement("a");
                                                                link.href = blobUrl;
                                                                link.download =
                                                                    fileDTO.originalFileName ||
                                                                    "file";
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                                window.URL.revokeObjectURL(blobUrl);
                                                            }}
                                                        >
                                                            {fileDTO.originalFileName}
                                                        </Button>
                                                        <IconClose
                                                            className={styles.deleteFileIcon}
                                                            onClick={() => {
                                                                materialsStore.editForm.passportQuality?.files?.splice(
                                                                    index,
                                                                    1,
                                                                );
                                                            }}
                                                        />
                                                    </Grid>
                                                ),
                                            )}
                                        </FlexColumn>
                                    </div>
                                )}
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.manufacturer =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality?.manufacturer ?? ""
                                    }
                                    formName={"Изготовитель"}
                                    placeholder={"Название компании"}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.manufacturer =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.consumerNameAndAddress =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality
                                            ?.consumerNameAndAddress ?? ""
                                    }
                                    formName={"Наименование и адрес потребителя"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.consumerNameAndAddress =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.productNameAndGrade =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality
                                            ?.productNameAndGrade ?? ""
                                    }
                                    formName={"Наименование и марка изделий"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.productNameAndGrade =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.batchNumber =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality?.batchNumber ?? ""
                                    }
                                    formName={"Номер партии"}
                                    placeholder={"Введите номер"}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.batchNumber =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.batchCount =
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality?.batchCount ?? ""
                                    }
                                    formName={"Количество, шт."}
                                    placeholder={"Введите число"}
                                    number={true}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.batchCount =
                                                null;
                                        }
                                    }}
                                />
                                <DatePicker
                                    value={
                                        materialsStore.editForm.passportQuality?.manufactureDate ??
                                        null
                                    }
                                    onChange={(value) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.manufactureDate =
                                                value ?? null;
                                        }
                                    }}
                                    placeholder={"ДД.ММ.ГГГГ / ЧЧ:ММ"}
                                    formName={"Дата изготовления (выгрузки)"}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.shippedQuantity =
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                        }
                                    }}
                                    value={
                                        materialsStore.editForm.passportQuality?.shippedQuantity ??
                                        ""
                                    }
                                    formName={"Отгружаемое количество шт. / п.м."}
                                    placeholder={"Введите число"}
                                    number={true}
                                    onClear={() => {
                                        if (materialsStore.editForm.passportQuality) {
                                            materialsStore.editForm.passportQuality.shippedQuantity =
                                                null;
                                        }
                                    }}
                                />
                            </>
                        )}
                        {materialsStore.tab === "waybill" && (
                            <>
                                <Button
                                    mode={"neutral"}
                                    iconBefore={<IconAttach />}
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                            fileInputRef.current.click();
                                        }
                                    }}
                                >
                                    Прикрепить{" "}
                                    {materialsStore.editForm.waybill?.files?.length
                                        ? "ещё"
                                        : "файлы"}
                                </Button>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileChangeEdit}
                                />

                                {!!materialsStore.editForm.waybill?.files?.length && (
                                    <div
                                        style={{
                                            borderRadius: 8,
                                            background: "#F0F0F0",
                                            padding: "12px",
                                        }}
                                    >
                                        <Typo
                                            variant={"subheadM"}
                                            style={{
                                                marginBottom: 12,
                                            }}
                                        >
                                            Загруженные файлы
                                        </Typo>
                                        <FlexColumn gap={8}>
                                            {materialsStore.editForm.waybill.files.map(
                                                (fileDTO, index) => (
                                                    <Grid
                                                        gap={16}
                                                        columns={"1fr auto"}
                                                        align={"center"}
                                                        key={index}
                                                    >
                                                        <Button
                                                            type={"text"}
                                                            size={"small"}
                                                            iconBefore={getFileDtoImage(fileDTO)}
                                                            align={"start"}
                                                            style={{
                                                                overflow: "hidden",
                                                            }}
                                                            onClick={async () => {
                                                                const response = await fetch(
                                                                    fileUrl(fileDTO.id) as string,
                                                                );
                                                                const blob = await response.blob();
                                                                const blobUrl =
                                                                    window.URL.createObjectURL(
                                                                        blob,
                                                                    );

                                                                const link =
                                                                    document.createElement("a");
                                                                link.href = blobUrl;
                                                                link.download =
                                                                    fileDTO.originalFileName ||
                                                                    "file";
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                                window.URL.revokeObjectURL(blobUrl);
                                                            }}
                                                        >
                                                            {fileDTO.originalFileName}
                                                        </Button>
                                                        <IconClose
                                                            className={styles.deleteFileIcon}
                                                            onClick={() => {
                                                                materialsStore.editForm.waybill?.files?.splice(
                                                                    index,
                                                                    1,
                                                                );
                                                            }}
                                                        />
                                                    </Grid>
                                                ),
                                            )}
                                        </FlexColumn>
                                    </div>
                                )}
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.materialName =
                                                event.target.value;
                                        }
                                    }}
                                    value={materialsStore.editForm.waybill?.materialName ?? ""}
                                    formName={"Наименование материала"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.materialName = "";
                                        }
                                    }}
                                />
                                <Autocomplete
                                    value={materialsStore.editForm.waybill?.receiver || null}
                                    formName={"Принимающее лицо"}
                                    size={"medium"}
                                    options={
                                        currentObj?.projectUsers
                                            .map((user) => ({
                                                name: getNameInitials(user),
                                                value: user.id,
                                            }))
                                            .filter((user) => !!user.name) ?? []
                                    }
                                    placeholder={"Выберите из списка"}
                                    onValueChange={(value) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.receiver =
                                                value ?? null;
                                        }
                                    }}
                                    fullWidth={true}
                                />
                                <DatePicker
                                    value={
                                        materialsStore.editForm.waybill?.deliveryDateTime ?? null
                                    }
                                    onChange={(value) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.deliveryDateTime =
                                                value ?? null;
                                        }
                                    }}
                                    placeholder={"ДД.ММ.ГГГГ / ЧЧ:ММ"}
                                    formName={"Дата поставки"}
                                />
                                <Autocomplete
                                    value={materialsStore.editForm.waybill?.projectWorkId}
                                    formName={"Для какой работы материал"}
                                    size={"medium"}
                                    options={
                                        worksStore.works
                                            .map((work) => ({
                                                name: work.name,
                                                value: work.id,
                                            }))
                                            .filter((user) => user.name) ?? []
                                    }
                                    placeholder={"Выберите из списка"}
                                    onValueChange={(value) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.projectWorkId =
                                                value ?? null;
                                        }
                                    }}
                                    fullWidth={true}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.invoiceNumber =
                                                event.target.value;
                                        }
                                    }}
                                    value={materialsStore.editForm.waybill?.invoiceNumber ?? ""}
                                    formName={"Номер накладкой"}
                                    placeholder={"Введите номер"}
                                    onClear={() => {
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.invoiceNumber = "";
                                        }
                                    }}
                                />
                                <FlexColumn
                                    gap={12}
                                    style={{
                                        padding: 16,
                                        borderRadius: 8,
                                        background: "#F0F0F0",
                                    }}
                                >
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill = {} as any;
                                            }
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.volume =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.editForm.waybill?.volume ?? ""}
                                        formName={"Объём"}
                                        placeholder={"Введите значение"}
                                        onClear={() => {
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.volume = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill = {} as any;
                                            }
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.netWeight =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.editForm.waybill?.netWeight ?? ""}
                                        formName={"Нетто"}
                                        placeholder={"Введите значение"}
                                        onClear={() => {
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.netWeight = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill = {} as any;
                                            }
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.grossWeight =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.editForm.waybill?.grossWeight ?? ""}
                                        formName={"Брутто"}
                                        placeholder={"Введите значение"}
                                        onClear={() => {
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.grossWeight = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill = {} as any;
                                            }
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.packageCount = event
                                                    .target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                            }
                                        }}
                                        value={materialsStore.editForm.waybill?.packageCount ?? ""}
                                        formName={"Количество мест"}
                                        placeholder={"Введите число"}
                                        number={true}
                                        onClear={() => {
                                            if (materialsStore.editForm.waybill) {
                                                materialsStore.editForm.waybill.packageCount = null;
                                            }
                                        }}
                                    />
                                </FlexColumn>
                                <Checkbox
                                    size={"large"}
                                    title={"Нужен лабораторный анализ"}
                                    checked={
                                        materialsStore.editForm.waybill
                                            ?.laboratoryAnalysisRequired ?? false
                                    }
                                    onChange={(checked) => {
                                        if (!materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill = {} as any;
                                        }
                                        if (materialsStore.editForm.waybill) {
                                            materialsStore.editForm.waybill.laboratoryAnalysisRequired =
                                                checked;
                                        }
                                    }}
                                    color={"neutral"}
                                    style={{
                                        marginBottom: 20,
                                    }}
                                />
                            </>
                        )}
                    </FlexColumn>
                </div>

                <div className={styles.footer}>
                    <Button
                        type={"secondary"}
                        mode={"neutral"}
                        onClick={() => {
                            materialsStore.editForm = deepCopy(currentMaterial ?? {});
                        }}
                    >
                        Отменить
                    </Button>
                    <Button
                        disabled={deepEquals(materialsStore.editForm, currentMaterial)}
                        mode={"neutral"}
                        onClick={async () => {
                            await materialsStore.updateMaterial(
                                {
                                    ...materialsStore.editForm,
                                },
                                currentMaterial as any,
                            );
                            snackbarStore.showNeutralPositiveSnackbar("Изменения сохранены");
                        }}
                    >
                        Сохранить
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default MaterialItemPage;
