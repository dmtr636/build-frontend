import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import styles from "./AboutObjectPage.module.scss";
import { IconApartment, IconBasket } from "src/ui/assets/icons";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { appStore, eventsStore } from "src/app/AppStore.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { DateInput } from "src/ui/components/inputs/DateInput/DateInput.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { extractImageMetadata } from "src/shared/utils/extractMeta.ts";
import exifr from "exifr";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { UpdateProjectDTO } from "src/features/journal/types/Object.ts";
import { User } from "src/features/users/types/User.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import { formatObjNumber } from "src/shared/utils/formatObjNumber.ts";
import { Helmet } from "react-helmet";

function getDaysBetween(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end.getTime() - start.getTime();
    const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));

    const getDayWord = (n: number): string => {
        const lastDigit = n % 10;
        const lastTwo = n % 100;

        if (lastTwo >= 11 && lastTwo <= 14) return "дней";
        if (lastDigit === 1) return "день";
        if (lastDigit >= 2 && lastDigit <= 4) return "дня";
        return "дней";
    };

    return `${days} ${getDayWord(days)}`;
}

const AboutObjectPage = observer(() => {
    const constructionObjects = [
        { value: "Парк", name: "Парк" },
        { value: "ЖК", name: "ЖК" },
        { value: "Школа", name: "Школа" },
        { value: "ТЦ", name: "ТЦ" },
    ];
    const navigate = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        appStore.objectStore.fetchObjects();
    }, []);
    const currentOrg = appStore.objectStore.ObjectMap.get(id ?? "");
    const [type, setType] = useState<string | null>(currentOrg?.type ?? null);
    const [objPreview, setObjPreview] = useState<string | null>(currentOrg?.imageId ?? null);
    const [objName, setObjName] = useState<string | null>(currentOrg?.name ?? null);
    const [startDate, setStartDate] = useState<string | null>(
        currentOrg?.plannedPeriod?.start ?? null,
    );
    const [endDate, setEndDate] = useState<string | null>(currentOrg?.plannedPeriod?.end ?? null);

    const shouldBlockButton = useMemo(() => {
        if (!currentOrg) return false;

        return (
            type !== (currentOrg.type ?? null) ||
            objPreview !== (currentOrg.imageId ?? null) ||
            objName !== (currentOrg.name ?? null) ||
            startDate !== (currentOrg.plannedPeriod?.start ?? null) ||
            endDate !== (currentOrg.plannedPeriod?.end ?? null)
        );
    }, [type, objPreview, objName, startDate, endDate, currentOrg]);
    const setInitialValue = () => {
        if (currentOrg) {
            setType(currentOrg.type ?? null);
            setObjPreview(currentOrg.imageId ?? null);
            setObjName(currentOrg.name ?? null);
            setStartDate(currentOrg.plannedPeriod?.start ?? null);
            setEndDate(currentOrg.plannedPeriod?.end ?? null);
        }
    };
    useEffect(() => {
        setInitialValue();
    }, [currentOrg]);

    const objForm: UpdateProjectDTO = {
        ...currentOrg,
        type: type as string,
        imageId: objPreview as string,
        name: objName as string,
        objectNumber: currentOrg?.objectNumber,
        plannedPeriod: {
            start: startDate as string,
            end: endDate as string,
        },
    };
    const onClick = () => {
        if (objForm)
            appStore.objectStore.updateObject(objForm).then(() => {
                snackbarStore.showNeutralPositiveSnackbar("Изменения сохранены");
            });
    };
    const [showDelete, setShowDelete] = useState(false);

    return (
        <div className={styles.container}>
            <Helmet>
                <title>{currentOrg?.name}</title>
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
                            disabled={!shouldBlockButton || !objName}
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
                    <IconApartment />
                </div>
                Об объекте
            </div>
            <div className={styles.objectForm}>
                <Media
                    type={"image"}
                    style={{ width: 213, height: 310 }}
                    url={fileUrl(objPreview)}
                    onSelectFile={async (file) => {
                        const imageId = await appStore.accountStore.uploadMediaFile(
                            file,
                            "PROJECT_COVER_IMAGE",
                        );
                        setObjPreview(imageId);
                    }}
                    onRemoveFile={() => {
                        setObjPreview(null);
                    }}
                    resolution={[213, 310]}
                    maxSizeMB={100}
                />
                <div className={styles.formContainer}>
                    <div className={styles.formHead}>
                        <div style={{ width: "100%" }}>
                            <Input
                                onChange={(e) => setObjName(e.target.value)}
                                value={objName}
                                required={true}
                                placeholder={"Введите название объекта"}
                                size={"large"}
                                formName={"Название объекта"}
                            />
                        </div>
                        <div>
                            <Button
                                type={"secondary"}
                                mode={"negative"}
                                size={"large"}
                                iconBefore={<IconBasket />}
                                onClick={() => setShowDelete(true)}
                            >
                                Удалить объект
                            </Button>
                        </div>
                    </div>
                    <div className={styles.containerType}>
                        <div style={{ width: "100%" }}>
                            <Autocomplete
                                size={"large"}
                                placeholder={"Введите тип или выберите из списка"}
                                formName={"Тип"}
                                options={constructionObjects}
                                value={type}
                                onValueChange={setType}
                            />
                        </div>
                        <div style={{ width: 157 }}>
                            <Input
                                size={"large"}
                                formName={"Номер объекта"}
                                onChange={() => {}}
                                value={formatObjNumber(currentOrg?.objectNumber ?? "")}
                                readonly={true}
                            />
                        </div>
                    </div>
                    <div className={styles.containerDate}>
                        <DatePicker
                            value={startDate}
                            onChange={(value) => setStartDate(value)}
                            width={312}
                            placeholder={"ДД.ММ.ГГГГ"}
                            size={"large"}
                            disableTime={true}
                            formName={"Плановая дата начала работ"}
                        ></DatePicker>
                        <DatePicker
                            value={endDate}
                            onChange={(value) => setEndDate(value)}
                            width={312}
                            placeholder={"ДД.ММ.ГГГГ"}
                            size={"large"}
                            disableTime={true}
                            formName={"Плановая дата завершения"}
                        ></DatePicker>
                        {startDate && endDate && (
                            <div className={styles.dateCounter}>
                                <Typo
                                    variant={"subheadM"}
                                    type={"quaternary"}
                                    style={{ opacity: 0.7 }}
                                >
                                    Между датами
                                </Typo>
                                <Typo variant={"actionXL"}>
                                    {getDaysBetween(startDate, endDate)}
                                </Typo>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DeleteOverlay
                open={showDelete}
                deleteButtonLabel={"Удалить"}
                title={"Удаление объекта"}
                info={currentOrg?.name}
                subtitle={`Вы действительно хотите удалить объект`}
                onDelete={() => {
                    appStore.objectStore.deleteObject(currentOrg?.id ?? "").then(() => {
                        snackbarStore.showNeutralPositiveSnackbar("Объект успешно удален");
                        navigate("/admin/journal");
                    });
                }}
                onCancel={() => setShowDelete(false)}
            />
        </div>
    );
});

export default AboutObjectPage;
