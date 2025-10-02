import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { appStore, layoutStore, materialsStore, worksStore } from "src/app/AppStore.ts";
import { clsx } from "clsx";
import styles from "src/features/journal/pages/MaterialsPage/MaterialsPage.module.scss";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { IconPlaceholderArrow } from "src/features/organizations/assets";
import {
    IconAttach,
    IconCheckmark,
    IconClose,
    IconDocument,
    IconImage,
    IconPlaceholderBuild,
    IconVideo,
} from "src/ui/assets/icons";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { FileDto } from "src/features/journal/types/Object.ts";
import { fileStore } from "src/features/users/stores/FileStore.ts";

const MaterialCreate = observer(() => {
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

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

    const currentMaterial = materialsStore.currentMaterial;

    useEffect(() => {
        if (currentMaterial) {
            materialsStore.editForm = deepCopy(currentMaterial);
        } else {
            materialsStore.editForm = {};
        }
    }, [currentMaterial]);

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
        if (
            materialsStore.tab === "waybill" &&
            !materialsStore.addForm.waybill?.files?.length &&
            files?.[0]
        ) {
            await materialsStore.doOcr(files[0]);
        }
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
                    if (materialsStore.addForm.waybill && !materialsStore.addForm.waybill?.files) {
                        materialsStore.addForm.waybill.files = [];
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
                <div ref={orgCardRef} className={clsx(styles.orgCard)}>
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
                                    {materialsStore.addForm.passportQuality?.files?.length
                                        ? "ещё"
                                        : "паспорт"}
                                </Button>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {!!materialsStore.addForm.passportQuality?.files?.length && (
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
                                            {materialsStore.addForm.passportQuality.files.map(
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
                                                                materialsStore.addForm.passportQuality?.files?.splice(
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
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.manufacturer =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.addForm.passportQuality?.manufacturer ?? ""
                                    }
                                    formName={"Изготовитель"}
                                    placeholder={"Название компании"}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.manufacturer =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.consumerNameAndAddress =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.addForm.passportQuality
                                            ?.consumerNameAndAddress ?? ""
                                    }
                                    formName={"Наименование и адрес потребителя"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.consumerNameAndAddress =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.productNameAndGrade =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.addForm.passportQuality
                                            ?.productNameAndGrade ?? ""
                                    }
                                    formName={"Наименование и марка изделий"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.productNameAndGrade =
                                                "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.batchNumber =
                                                event.target.value;
                                        }
                                    }}
                                    value={
                                        materialsStore.addForm.passportQuality?.batchNumber ?? ""
                                    }
                                    formName={"Номер партии"}
                                    placeholder={"Введите номер"}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.batchNumber = "";
                                        }
                                    }}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.batchCount =
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                        }
                                    }}
                                    value={materialsStore.addForm.passportQuality?.batchCount ?? ""}
                                    formName={"Количество, шт."}
                                    placeholder={"Введите число"}
                                    number={true}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.batchCount =
                                                null;
                                        }
                                    }}
                                />
                                <DatePicker
                                    width={"calc(100vw - 40px)"}
                                    value={
                                        materialsStore.addForm.passportQuality?.manufactureDate ??
                                        null
                                    }
                                    onChange={(value) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.manufactureDate =
                                                value ?? null;
                                        }
                                    }}
                                    placeholder={"ДД.ММ.ГГГГ / ЧЧ:ММ"}
                                    formName={"Дата изготовления (выгрузки)"}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality = {} as any;
                                        }
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.shippedQuantity =
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                        }
                                    }}
                                    value={
                                        materialsStore.addForm.passportQuality?.shippedQuantity ??
                                        ""
                                    }
                                    formName={"Отгружаемое количество шт. / п.м."}
                                    placeholder={"Введите число"}
                                    number={true}
                                    onClear={() => {
                                        if (materialsStore.addForm.passportQuality) {
                                            materialsStore.addForm.passportQuality.shippedQuantity =
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
                                    loading={materialsStore.ocrLoading}
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                            fileInputRef.current.click();
                                        }
                                    }}
                                >
                                    Прикрепить{" "}
                                    {materialsStore.addForm.waybill?.files?.length
                                        ? "ещё"
                                        : "файлы"}
                                </Button>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {!!materialsStore.addForm.waybill?.files?.length && (
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
                                            {materialsStore.addForm.waybill.files.map(
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
                                                                materialsStore.addForm.waybill?.files?.splice(
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
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.materialName =
                                                event.target.value;
                                        }
                                    }}
                                    value={materialsStore.addForm.waybill?.materialName ?? ""}
                                    formName={"Наименование материала"}
                                    placeholder={"Введите наименование"}
                                    onClear={() => {
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.materialName = "";
                                        }
                                    }}
                                />
                                <Autocomplete
                                    value={materialsStore.addForm.waybill?.receiver || null}
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
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.receiver = value ?? null;
                                        }
                                    }}
                                    fullWidth={true}
                                />
                                <DatePicker
                                    width={"calc(100vw - 40px)"}
                                    value={materialsStore.addForm.waybill?.deliveryDateTime ?? null}
                                    onChange={(value) => {
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.deliveryDateTime =
                                                value ?? null;
                                        }
                                    }}
                                    placeholder={"ДД.ММ.ГГГГ / ЧЧ:ММ"}
                                    formName={"Дата поставки"}
                                />
                                <Autocomplete
                                    value={materialsStore.addForm.waybill?.projectWorkId}
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
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.projectWorkId =
                                                value ?? null;
                                        }
                                    }}
                                    fullWidth={true}
                                />
                                <Input
                                    onChange={(event) => {
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.invoiceNumber =
                                                event.target.value;
                                        }
                                    }}
                                    value={materialsStore.addForm.waybill?.invoiceNumber ?? ""}
                                    formName={"Номер накладкой"}
                                    placeholder={"Введите номер"}
                                    onClear={() => {
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.invoiceNumber = "";
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
                                            if (!materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill = {} as any;
                                            }
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.volume =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.addForm.waybill?.volume ?? ""}
                                        formName={"Объём"}
                                        placeholder={"Введите значение"}
                                        onClear={() => {
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.volume = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill = {} as any;
                                            }
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.netWeight =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.addForm.waybill?.netWeight ?? ""}
                                        formName={"Нетто"}
                                        placeholder={"Введите число"}
                                        onClear={() => {
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.netWeight = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill = {} as any;
                                            }
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.grossWeight =
                                                    event.target.value;
                                            }
                                        }}
                                        value={materialsStore.addForm.waybill?.grossWeight ?? ""}
                                        formName={"Брутто"}
                                        placeholder={"Введите число"}
                                        onClear={() => {
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.grossWeight = null;
                                            }
                                        }}
                                    />
                                    <Input
                                        onChange={(event) => {
                                            if (!materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill = {} as any;
                                            }
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.packageCount = event
                                                    .target.value
                                                    ? Number(event.target.value)
                                                    : null;
                                            }
                                        }}
                                        value={materialsStore.addForm.waybill?.packageCount ?? ""}
                                        formName={"Количество мест"}
                                        placeholder={"Введите число"}
                                        number={true}
                                        onClear={() => {
                                            if (materialsStore.addForm.waybill) {
                                                materialsStore.addForm.waybill.packageCount = null;
                                            }
                                        }}
                                    />
                                </FlexColumn>
                                <Checkbox
                                    size={"large"}
                                    title={"Нужен лабораторный анализ"}
                                    checked={
                                        materialsStore.addForm.waybill
                                            ?.laboratoryAnalysisRequired ?? false
                                    }
                                    onChange={(checked) => {
                                        if (!materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill = {} as any;
                                        }
                                        if (materialsStore.addForm.waybill) {
                                            materialsStore.addForm.waybill.laboratoryAnalysisRequired =
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
                        size={"small"}
                        mode={"neutral"}
                        onClick={() => {
                            materialsStore.addForm = {};
                            materialsStore.showAddOverlay = false;
                        }}
                    >
                        Отменить
                    </Button>
                    <Button
                        size={"small"}
                        mode={"neutral"}
                        onClick={async () => {
                            await materialsStore.createMaterial({
                                ...materialsStore.addForm,
                                projectId: id,
                                passportQuality: materialsStore.addForm.passportQuality
                                    ? {
                                          ...materialsStore.addForm.passportQuality,
                                          manufacturer:
                                              materialsStore.addForm.passportQuality.manufacturer ||
                                              "",
                                          consumerNameAndAddress:
                                              materialsStore.addForm.passportQuality
                                                  .consumerNameAndAddress || "",
                                          productNameAndGrade:
                                              materialsStore.addForm.passportQuality
                                                  .productNameAndGrade || "",
                                      }
                                    : null,
                            });
                            snackbarStore.showNeutralPositiveSnackbar("Материал добавлен");
                            navigate(-1);
                        }}
                    >
                        Сохранить
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default MaterialCreate;
