import React, { useState } from "react";
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
    IconFlag,
    IconNewInset,
    IconShowPass,
} from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { numDecl } from "src/shared/utils/numDecl.ts";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { formatDate } from "@storybook/blocks";
import { fileUrl } from "src/shared/utils/file.ts";
import { formatDateShort } from "src/shared/utils/date.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";

interface DocumentCardProps {
    document: ProjectDocumentDTO;
    object: ObjectDTO;
}

async function downloadFile(url: string, filename: string) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Ошибка скачивания: ${response.status}`);
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error(e);
    }
}

const DocumentCard = ({ document, object }: DocumentCardProps) => {
    const [showDelete, setShowDelete] = useState(false);
    const onClickDelete = () => {
        const updatedDocument = object.documents.filter((doc) => doc.id !== document.id);
        const objectForm = { ...object, documents: updatedDocument };
        appStore.objectStore
            .updateObject(objectForm)
            .then(() => snackbarStore.showNeutralPositiveSnackbar("Документ удален"));
    };
    return (
        <div className={clsx(styles.container)}>
            <div className={styles.imgBlock}>
                <div className={styles.noUser}>
                    <IconDocument />
                </div>
            </div>
            <div className={clsx(styles.infoBlock)}>
                <div className={styles.name}>{document?.name ?? "Без названия"}</div>
                <div className={styles.otherInfo}>
                    {document?.documentGroup}
                    {document?.documentGroup && <IconDote className={styles.dote} />}
                    {/* {user?.organizationId &&
                        appStore.organizationsStore.organizationById(user?.organizationId ?? "")
                            ?.name}*/}
                    {formatDateShort(document.file.createdAt)}
                </div>
            </div>
            <div className={styles.buttonsBlock}>
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
                <Tooltip text={"Предпросмотр"} delay={500}>
                    <ButtonIcon
                        /*
                                                onClick={onClear}
                        */
                        pale={true}
                        mode={"neutral"}
                        size={"small"}
                        type={"tertiary"}
                    >
                        <IconShowPass />
                    </ButtonIcon>
                </Tooltip>
                <Tooltip text={"Скачать документ"} delay={500}>
                    <ButtonIcon
                        onClick={() => downloadFile(fileUrl(document.file.id) ?? "", document.name)}
                        pale={true}
                        mode="neutral"
                        size="small"
                        type="tertiary"
                    >
                        <IconDownload />
                    </ButtonIcon>
                </Tooltip>
                <Tooltip text={"Редактировать"} delay={500}>
                    <ButtonIcon
                        /*onClick={() => navigate(`/admin/organizations/${organization.id}`)}*/
                        pale={true}
                        mode={"neutral"}
                        size={"small"}
                        type={"tertiary"}
                    >
                        <IconEdit />
                    </ButtonIcon>
                </Tooltip>
            </div>
            <DeleteOverlay
                open={showDelete}
                title={"Удаление документа"}
                subtitle={"Вы уверены что хотите удалить документ "}
                deleteButtonLabel={"Удалить"}
                info={document.name}
                onDelete={onClickDelete}
                onCancel={() => setShowDelete(false)}
            />
        </div>
    );
};

export default DocumentCard;
