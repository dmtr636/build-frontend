import React from "react";
import styles from "./DocumentList.module.scss";
import JournalItemCard from "src/features/journal/components/JournalItemCard/JournalItemCard.tsx";
import { SortOption } from "src/features/users";
import DocumentCard from "src/features/journal/pages/DocumentsObjectPage/Components/DocumentCardPage/DocumentCard.tsx";
import { ObjectDTO, ProjectDocumentDTO } from "src/features/journal/types/Object.ts";
import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet";
import { IconDocument, IconError } from "src/ui/assets/icons";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { appStore } from "src/app/AppStore.ts";

interface DocumentListProps {
    documentList?: ProjectDocumentDTO[];
    object: ObjectDTO;
    sort: SortOption;
}

const DocumentList = observer(({ documentList, object }: DocumentListProps) => {
    if (documentList?.length === 0) {
        return (
            <div className={styles.container}>
                <Helmet>
                    <title>Объекты – Build</title>
                </Helmet>
                <div className={styles.noDocs}>
                    <div className={styles.textNoDocs}>
                        <IconError />
                        Не нашли документ <br /> С такими параметрами
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            {documentList && documentList.length > 0 && (
                <div className={styles.list}>
                    {documentList.map((journal, index) => (
                        <DocumentCard key={index} documentItem={journal} object={object} />
                    ))}
                </div>
            )}
        </div>
    );
});

export default DocumentList;
