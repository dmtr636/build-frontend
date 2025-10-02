import React, { useEffect, useMemo, useState } from "react";
import { ObjectDTO, ProjectDocumentDTO } from "src/features/journal/types/Object.ts";
import styles from "./DocumentCardPage.module.scss";
import { useParams } from "react-router-dom";
import { appStore } from "src/app/AppStore.ts";
import clsx from "clsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import {
    IconBasket,
    IconDocument,
    IconDote,
    IconDownload,
    IconEdit,
    IconShowPass,
    IconSmartDisplay,
} from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { formatDateShort } from "src/shared/utils/date.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import { PdfOverlay } from "src/features/journal/components/PdfOverlay.tsx";
import { Document, Page } from "react-pdf";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";

interface DocumentCardProps {
    documentItem: ProjectDocumentDTO;
    object: ObjectDTO;
}

export function getDocumentFormat(name?: string): string | null {
    if (!name) return null;

    const parts = name.split(".");
    if (parts.length < 2) return null;

    return parts.pop()?.toLowerCase() ?? null;
}

const DocumentCard = ({ documentItem, object }: DocumentCardProps) => {
    const [showDelete, setShowDelete] = useState(false);
    const onClickDelete = () => {
        const updatedDocument = object.documents.filter((doc) => doc.id !== documentItem.id);
        const objectForm = { ...object, documents: updatedDocument };
        appStore.objectStore.updateObject(objectForm).then(() => {
            snackbarStore.showNeutralPositiveSnackbar("Документ удален");
            setShowDelete(false);
        });
    };
    const docFormat = getDocumentFormat(documentItem?.file.originalFileName);

    const [openOverlay, setOpenOverlay] = useState<boolean>(false);
    const [fileData, setFileData] = useState<File | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [currentDocName, setCurrentDocName] = useState<string>("");
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);
    const currentUser = appStore.accountStore.currentUser;
    const [groupOptions, setGroupOptions] = useState<SelectOption<string>[]>([]);
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
    const updatedDocument = useMemo<ProjectDocumentDTO>(() => {
        // Если новый файл не выбран → обновляем только имя и группу
        if (!fileId && !fileData) {
            return {
                ...documentItem,
                name: currentDocName.trim() === "" ? "Без названия" : currentDocName,
                documentGroup: currentGroup ?? undefined,
            };
        }

        // Если новый файл выбран → используем documentForm (файл + метаданные)
        return documentForm;
    }, [fileId, fileData, currentDocName, currentGroup, documentItem, documentForm]);

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
    const onClick = () => {
        const newDocuments = object.documents.map((doc) =>
            doc.id === documentItem.id ? updatedDocument : doc,
        );

        const objectForm = { ...object, documents: newDocuments };

        appStore.objectStore.updateObject(objectForm).then(() => {
            snackbarStore.showNeutralPositiveSnackbar("Документ обновлен");
            setOpenOverlay(false);
        });
    };

    return (
        <div className={clsx(styles.container)}>
            <div className={styles.imgBlock}>
                <div className={styles.noUser}>
                    {docFormat?.toLowerCase() !== "ppdx" ? <IconDocument /> : <IconSmartDisplay />}
                    {docFormat}
                </div>
            </div>
            <div className={clsx(styles.infoBlock)}>
                <div className={styles.name}>{documentItem?.name ?? "Без названия"}</div>
                <div className={styles.otherInfo}>
                    {documentItem?.documentGroup ?? "Без группы"}
                    <IconDote className={styles.dote} />

                    {formatDateShort(documentItem?.file.createdAt)}
                </div>
            </div>
            <div className={styles.buttonsBlock}>
                <div className={styles.buttonsBlockChat}>
                    <Tooltip text={"Удалить"} delay={500}>
                        <ButtonIcon
                            onClick={() => setShowDelete(true)}
                            pale={true}
                            mode={"negative"}
                            size={"small"}
                            type={"tertiary"}
                        >
                            <IconBasket />
                        </ButtonIcon>
                    </Tooltip>
                </div>
                {docFormat === "pdf" && (
                    <div className={styles.buttonsBlockChat}>
                        <Tooltip text={"Предпросмотр"} delay={500}>
                            <ButtonIcon
                                onClick={() => {
                                    const url = fileUrl(documentItem.file.id);
                                    window.open(url, "_blank");
                                }}
                                pale={true}
                                mode={"neutral"}
                                size={"small"}
                                type={"tertiary"}
                            >
                                <IconShowPass />
                            </ButtonIcon>
                        </Tooltip>
                    </div>
                )}
                <div className={styles.buttonsBlockChat}>
                    <Tooltip text={"Скачать документ"} delay={500}>
                        <ButtonIcon
                            onClick={async () => {
                                const response = await fetch(
                                    fileUrl(documentItem.file.id) as string,
                                );
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);

                                // Функция для получения расширения файла
                                const getFileExtension = (filename: string) => {
                                    const match = filename.match(/\.([0-9a-z]+)$/i);
                                    return match ? match[0] : "";
                                };

                                const originalExtension = getFileExtension(
                                    documentItem.file.originalFileName ?? "",
                                );
                                let downloadName = documentItem.name || "file";

                                // Добавляем расширение только если его нет и есть оригинальное расширение
                                if (!getFileExtension(downloadName) && originalExtension) {
                                    downloadName += originalExtension;
                                }

                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download = downloadName;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();

                                window.URL.revokeObjectURL(blobUrl);
                            }}
                            pale
                            mode="neutral"
                            size="small"
                            type="tertiary"
                        >
                            <IconDownload />
                        </ButtonIcon>
                    </Tooltip>
                </div>
                <div className={styles.buttonsBlockChat}>
                    <Tooltip text={"Редактировать"} delay={500}>
                        <ButtonIcon
                            onClick={() => {
                                setCurrentDocName(documentItem.name);
                                setCurrentGroup(documentItem.documentGroup ?? null);
                                setOpenOverlay(true);
                            }}
                            pale={true}
                            mode={"neutral"}
                            size={"small"}
                            type={"tertiary"}
                        >
                            <IconEdit />
                        </ButtonIcon>
                    </Tooltip>
                </div>
            </div>
            <Overlay
                onClose={() => setOpenOverlay(false)}
                open={openOverlay}
                title={"Редактировать файл"}
                titleMode={"neutral"}
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
                            onClick={() => {
                                setFileData(null);
                                setFileId(null);
                                setOpenOverlay(false);
                            }}
                        >
                            Отмена
                        </Button>{" "}
                        <Button onClick={onClick} mode={"neutral"}>
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            </Overlay>
            <DeleteOverlay
                open={showDelete}
                title={"Удаление документа"}
                subtitle={"Вы уверены что хотите удалить документ "}
                deleteButtonLabel={"Удалить"}
                info={documentItem?.name}
                onDelete={onClickDelete}
                onCancel={() => setShowDelete(false)}
            />
        </div>
    );
};

export default DocumentCard;
