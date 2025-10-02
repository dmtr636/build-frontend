import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { appStore, layoutStore, registryStore } from "src/app/AppStore.ts";
import { observer } from "mobx-react-lite";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconPin } from "src/ui/assets/icons";
import styles from "./CreateViolationPage.module.scss";
import { fileUrl } from "src/shared/utils/file.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { MapEditor } from "src/features/map/MapEditor.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { LatLngLiteral } from "leaflet";

type MediaSlot = { id: string; imageId: string | null };

function formatInstant(input: Date | string): string {
    const date = input instanceof Date ? input : new Date(input);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

const CreateViolationPage = observer(() => {
    const violations = registryStore.violations;
    const { id } = useParams();
    const object = appStore.objectStore.ObjectMap.get(id ?? "");
    const documents = registryStore.documents;
    const violationsOptions = violations.map((v) => ({
        name: v.name,
        value: v.id,
    }));
    const documentsOptions = documents.map((v) => ({
        name: v.name,
        value: v.id,
    }));
    const [document, setDocument] = useState<string[]>([]);
    const [violation, setViolation] = useState<string | null>();
    const [violationTime, setViolationTime] = React.useState<string | null>(null);
    const [violationDays, setViolationDays] = React.useState<number | string | null>(null);
    const [haveViolations, setHaveViolations] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const idSeq = useRef(0);
    const newId = () => {
        idSeq.current += 1;
        return `slot_${idSeq.current}`;
    };
    const createEmptySlot = (): MediaSlot => ({ id: newId(), imageId: null });

    const [slots, setSlots] = React.useState<MediaSlot[]>([createEmptySlot()]);

    const imageIds = React.useMemo(
        () => slots.map((s) => s.imageId).filter(Boolean) as string[],
        [slots],
    );
    const [isNote, setIsNote] = React.useState(false);
    const [coords, setCoords] = useState<LatLngLiteral | null>(null);
    const [showMapOverlay, setShowMapOverlay] = useState(false);

    useEffect(() => {
        if (showMapOverlay) {
            layoutStore.setHeaderProps({
                ...layoutStore.headerProps,
                hide: true,
            });
        } else {
            layoutStore.setHeaderProps({
                ...layoutStore.headerProps,
                hide: false,
            });
        }
    }, [showMapOverlay]);

    const onChangeViolation = (value: string | null) => {
        setViolation(value);
        setViolationDays(null);
        setHaveViolations(false);
        const currentViolation = registryStore.violationsMap.get(value as string);
        if (currentViolation?.remediationDueDays) {
            setViolationDays(currentViolation.remediationDueDays);
            setHaveViolations(true);
        }
    };

    const currentViolation = registryStore.violationsMap.get(violation as string);
    const violationForm = useMemo(() => {
        return {
            id: undefined,
            projectId: object?.id,

            name: currentViolation?.name,

            dueDate: (() => {
                if (!violationTime || !violationDays) return null;
                const start = new Date(violationTime);
                const due = new Date(start);
                due.setDate(due.getDate() + Number(violationDays));
                return due.toISOString().slice(0, 10);
            })(),

            violationTime: formatInstant(violationTime as any),

            status: "TODO",

            category: currentViolation?.category,
            kind: currentViolation?.kind ?? "Устранимое",
            severityType: currentViolation?.severityType ?? "Простое",

            isNote,

            normativeDocuments: document.map((id) => ({ id })),

            photos: imageIds.map((id) => ({ id })),
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
        };
    }, [
        object?.id,
        currentViolation,
        violationTime,
        violationDays,
        isNote,
        document,
        imageIds,
        coords?.lat,
        coords?.lng,
    ]);

    useEffect(() => {
        if (violation === null) {
            setHaveViolations(false);
            setViolationDays("");
        }
    }, [violation]);

    const handleSelectFile = (slotIndex: number) => async (file: File) => {
        const imageId = await appStore.accountStore.uploadMediaFile(file, "PROJECT_CONTENT_IMAGE");

        setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = { ...next[slotIndex], imageId };

            const isLast = slotIndex === prev.length - 1;
            if (isLast) {
                next.push(createEmptySlot());
            }
            return next;
        });
    };
    const resetViolationForm = () => {
        setDocument([]);
        setViolation(null);
        setViolationTime(null);
        setViolationDays(null);
        setHaveViolations(false);
        setIsNote(false);
        setSlots([createEmptySlot()]);
        setCoords(null);
    };

    const handleRemoveFile = (slotIndex: number) => () => {
        setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = { ...next[slotIndex], imageId: null };

            const filled = next.filter((s) => s.imageId !== null);
            return [...filled, createEmptySlot()];
        });
    };
    useLayoutEffect(() => {
        layoutStore.setHeaderProps({ title: "Новое нарушение" });
    }, []);

    return (
        <div className={styles.container}>
            <FlexColumn gap={16} style={{ zIndex: 999 }}>
                <Autocomplete
                    zIndex={999}
                    size={"large"}
                    required={true}
                    formName={"Нарушение"}
                    placeholder={"Введите или выберите из списка"}
                    options={violationsOptions}
                    value={violation as any}
                    onValueChange={onChangeViolation}
                />
                <Input
                    size={"large"}
                    formName={"Срок устранения (дни)"}
                    required={true}
                    placeholder={"Введите число"}
                    readonly={haveViolations || !violation}
                    value={violationDays}
                    number={true}
                    onChange={(event) => {
                        const value = event.target.value;
                        const numeric = value.replace(/\D/g, "");
                        setViolationDays(numeric as any);
                    }}
                />
                <div style={{ width: "100%" }}>
                    <DatePicker
                        zIndex={999}
                        width={"100%"}
                        size={"large"}
                        value={violationTime}
                        disableFuture={true}
                        onChange={setViolationTime}
                        formName={"Дата и время обнаружения*"}
                        placeholder={"ДД.ММ.ГГГГ / ЧЧ:ММ"}
                    />
                </div>
                <Button
                    iconBefore={<IconPin />}
                    size={"large"}
                    fullWidth={true}
                    mode={"neutral"}
                    type={coords?.lat ? "outlined" : "primary"}
                    onClick={() => {
                        setShowMapOverlay(true);
                    }}
                >
                    {coords?.lat ? "Посмотреть отмеченное место" : "Указать место нарушения"}
                </Button>
                <div>
                    <MultipleAutocomplete
                        size={"large"}
                        zIndex={99999}
                        formName={"Нормативные документы"}
                        required={true}
                        multiple={true}
                        placeholder={"Выберите документы"}
                        options={documentsOptions}
                        values={document}
                        onValuesChange={setDocument}
                    />
                </div>
                <div className={styles.text}>
                    Фотографии, подтверждающие факт нарушения{" "}
                    <span style={{ color: "#C02626" }}>*</span>
                </div>

                <div className={styles.mediaArray}>
                    {slots.map((slot, i) => (
                        <Media
                            key={slot.id}
                            type={"image"}
                            style={{ width: 768, height: 310 }}
                            url={fileUrl(slot.imageId)}
                            onSelectFile={handleSelectFile(i)}
                            onRemoveFile={handleRemoveFile(i)}
                        />
                    ))}
                </div>
                <Checkbox
                    size={"large"}
                    onChange={setIsNote}
                    checked={isNote}
                    title={"Отметить как замечание"}
                />
            </FlexColumn>
            <div className={styles.Buttons}>
                <div className={styles.ButtonItem}>
                    <Button
                        onClick={() => navigate(-1)}
                        mode={"neutral"}
                        type={"secondary"}
                        fullWidth={true}
                    >
                        Отмена
                    </Button>
                </div>
                <div className={styles.ButtonItem}>
                    <Button
                        disabled={
                            !violationDays ||
                            !violation ||
                            imageIds.length === 0 ||
                            document.length === 0 ||
                            !violationTime
                        }
                        onClick={() => {
                            appStore.violationStore
                                .createObject(violationForm as any, object?.id as string)
                                .then(() => {
                                    snackbarStore.showNeutralPositiveSnackbar(
                                        "Нарушение успешно добавлено",
                                    );
                                    resetViolationForm();
                                    navigate(`/admin/journal/${id}/violations`);
                                });
                        }}
                        mode={"neutral"}
                        type={"primary"}
                        fullWidth={true}
                    >
                        Добавить
                    </Button>
                </div>
            </div>
            {showMapOverlay && (
                <Overlay
                    open={showMapOverlay}
                    onClose={() => setShowMapOverlay(false)}
                    title={"Укажите место нарушения"}
                    smallPadding={true}
                    styles={{
                        background: {
                            zIndex: 10000,
                        },
                    }}
                    mobileMapOverlay={true}
                >
                    <div
                        style={{
                            width: "100%",
                        }}
                    >
                        <MapEditor
                            readyProp={true}
                            disableSatellite={true}
                            height={"400px"}
                            value={{
                                polygon: object?.polygon
                                    ? object.polygon.map((item) => ({
                                          lat: item.latitude,
                                          lng: item.longitude,
                                      }))
                                    : null,
                                marker: coords
                                    ? {
                                          lat: coords.lat,
                                          lng: coords.lng,
                                      }
                                    : null,
                            }}
                            onChange={(data) => {
                                const newCoors = data.marker
                                    ? { lat: data.marker.lat, lng: data.marker.lng }
                                    : null;
                                setCoords(newCoors);
                            }}
                            center={
                                object?.centroid
                                    ? {
                                          lat: object?.centroid?.latitude,
                                          lng: object?.centroid?.longitude,
                                      }
                                    : undefined
                            }
                            editable={true}
                            selectingPoint={true}
                        />
                        <Grid gap={12} style={{ marginTop: 20 }} columns={"1fr"}>
                            <Input
                                onChange={() => {}}
                                value={coords?.lat ?? "-"}
                                formName={"Широта"}
                                readonly={true}
                            />
                            <Input
                                onChange={() => {}}
                                value={coords?.lng ?? "-"}
                                formName={"Долгота"}
                                readonly={true}
                            />
                        </Grid>
                    </div>
                </Overlay>
            )}
        </div>
    );
});

export default CreateViolationPage;
