import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { appStore, registryStore } from "src/app/AppStore.ts";
import { observer } from "mobx-react-lite";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconPin } from "src/ui/assets/icons";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import styles from "./AddViolationOverlay.module.scss";
import { fileUrl } from "src/shared/utils/file.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";

interface AddViolationOverlayProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    object?: ObjectDTO;
    isEditing?: boolean;
    editingViolation?: ProjectViolationDTO;
}

// --- медиа-слоты ---
type MediaSlot = { id: string; imageId: string | null };

function formatInstant(input: Date | string): string {
    const date = input instanceof Date ? input : new Date(input);

    // Берём UTC-компоненты
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

const AddViolationOverlay = observer(
    ({ open, setOpen, object, isEditing, editingViolation }: AddViolationOverlayProps) => {
        const violations = registryStore.violations;
        const documents = registryStore.documents;
        const violationsOptions = violations.map((v) => ({
            name: v.name,
            value: v.id,
        }));
        const documentsOptions = documents.map((v) => ({
            name: v.name,
            value: v.id,
        }));
        // если нужно — одинаково считаем dueDate и violationTime
        const [document, setDocument] = useState<string[]>([]);
        const [violation, setViolation] = useState<string | null>();
        const [violationTime, setViolationTime] = React.useState<string | null>(null);
        const [violationDays, setViolationDays] = React.useState<number | string | null>(null);
        const [haveViolations, setHaveViolations] = React.useState<boolean>(false);

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
                id: editingViolation?.id ?? undefined,
                projectId: object?.id ?? editingViolation?.projectId,

                name: currentViolation?.name,

                // Дата дедлайна = дата обнаружения + violationDays (в формате YYYY-MM-DD)
                dueDate: (() => {
                    if (!violationTime || !violationDays) return null;
                    const start = new Date(violationTime);
                    const due = new Date(start);
                    due.setDate(due.getDate() + Number(violationDays));
                    return due.toISOString().slice(0, 10);
                })(),

                // ISO-строка времени обнаружения
                violationTime: formatInstant(violationTime as any),

                status: "TODO", // TODO | IN_PROGRESS | IN_REVIEW | DONE

                // Если в справочнике у нарушения есть эти поля — возьмём их, иначе дефолты из примера
                category: currentViolation?.category,
                kind: currentViolation?.kind ?? "Устранимое",
                severityType: currentViolation?.severityType ?? "Простое",

                isNote,

                // Координаты — подставьте ваши значения/стор (если есть выбор точки на карте)
                /* latitude: appStore.mapStore?.selectedPoint?.lat ?? null,
                   longitude: appStore.mapStore?.selectedPoint?.lng ?? null,*/
                normativeDocuments: document.map((id) => ({ id })),

                // Фото — из загруженных imageIds
                photos: imageIds.map((id) => ({ id })),
            };
        }, [
            object?.id,
            currentViolation,
            violationTime,
            violationDays,
            isNote,
            document,
            imageIds,
        ]);

        useEffect(() => {
            if (violation === null) {
                setHaveViolations(false);
                setViolationDays("");
            }
        }, [violation]);
        const getViolationDays = () => {
            if (!editingViolation || !editingViolation.violationTime || !editingViolation.dueDate)
                return null;
            const start = new Date(editingViolation.violationTime);
            const end = new Date(editingViolation.dueDate);
            const diffTime = end.getTime() - start.getTime();
            return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        };
        const reset = useCallback(() => {
            if (isEditing && editingViolation) {
                const currentViolation = registryStore.violations.find(
                    (v) => v.name === editingViolation.name,
                );
                const violDays: number | null = getViolationDays();
                setViolation(currentViolation?.id);
                setHaveViolations(!!currentViolation?.remediationDueDays);
                setDocument(editingViolation.normativeDocuments.map((i) => i.id));
                setViolationDays(violDays ?? (currentViolation?.remediationDueDays as number));
                setIsNote(editingViolation.isNote);
                if (editingViolation.photos)
                    setSlots(
                        createSlotsFromImageIds(
                            editingViolation.photos.map((item) => item.id as any),
                        ),
                    );
                setViolationTime(editingViolation.violationTime);
            }
        }, []);
        useEffect(() => {
            if (isEditing && editingViolation) {
                reset();
            }
        }, [editingViolation, isEditing, violations, documents, open]);
        const handleSelectFile = (slotIndex: number) => async (file: File) => {
            const imageId = await appStore.accountStore.uploadMediaFile(file, "PROFILE_IMAGE");

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
            setDocument([]); // документы
            setViolation(null); // выбранное нарушение
            setViolationTime(null); // дата/время обнаружения
            setViolationDays(null); // срок устранения (дни)
            setHaveViolations(false); // флаг автозаполнения срока
            setIsNote(false); // чекбокс "замечание"
            setSlots([createEmptySlot()]); // медиа-слоты: один пустой
            setOpen(false);
        };

        const handleRemoveFile = (slotIndex: number) => () => {
            setSlots((prev) => {
                const next = [...prev];
                next[slotIndex] = { ...next[slotIndex], imageId: null };

                const filled = next.filter((s) => s.imageId !== null);
                return [...filled, createEmptySlot()];
            });
        };
        const createSlotsFromImageIds = (imageIds: string[]) => {
            let idSeq = 0;

            const newId = () => {
                idSeq += 1;
                return `slot_${idSeq}`;
            };

            const createEmptySlot = (): MediaSlot => ({ id: newId(), imageId: null });

            const slots = imageIds.map((imageId) => ({
                id: newId(),
                imageId,
            }));

            slots.push(createEmptySlot() as any);

            return slots;
        };

        return (
            <Overlay
                styles={{
                    card: {
                        width: 564,
                    },
                }}
                title={isEditing ? "Редактировать нарушение" : "Добавить нарушение"}
                open={open}
                onClose={() => resetViolationForm()}
                actions={[
                    <Button
                        style={{ marginLeft: isEditing ? 195 : 289 }}
                        key={1}
                        mode={"neutral"}
                        pale={true}
                        type={"secondary"}
                        onClick={resetViolationForm}
                    >
                        Отмена
                    </Button>,
                    <Button
                        key={2}
                        mode={"neutral"}
                        disabled={
                            !violationDays ||
                            !violation ||
                            imageIds.length === 0 ||
                            !document ||
                            !violationTime
                        }
                        onClick={() => {
                            if (isEditing) {
                                appStore.violationStore
                                    .updateObject(
                                        violationForm as any,
                                        editingViolation?.projectId as string,
                                    )
                                    .then(() => {
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Нарушение успешно обновлено",
                                        );
                                        resetViolationForm();
                                        setOpen(false);
                                    });
                            } else {
                                appStore.violationStore
                                    .createObject(violationForm as any, object?.id as string)
                                    .then(() => {
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Нарушение успешно добавлено",
                                        );
                                        resetViolationForm();
                                        setOpen(false);
                                    });
                            }
                        }}
                    >
                        {isEditing ? "Сохранить изменения" : "Добавить"}
                    </Button>,
                ]}
            >
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
                    >
                        Указать место нарушения
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
                                style={{ width: 500, height: 310 }}
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
            </Overlay>
        );
    },
);

export default AddViolationOverlay;
