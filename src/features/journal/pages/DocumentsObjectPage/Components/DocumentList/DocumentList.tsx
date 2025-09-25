import React from "react";
import styles from "src/features/journal/components/JournalList/JournalList.module.scss";
import JournalItemCard from "src/features/journal/components/JournalItemCard/JournalItemCard.tsx";
import { SortOption } from "src/features/users";
import DocumentCard from "src/features/journal/pages/DocumentsObjectPage/Components/DocumentCardPage/DocumentCard.tsx";
import { ObjectDTO, ProjectDocumentDTO } from "src/features/journal/types/Object.ts";

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

interface DocumentListProps {
    documentList?: ProjectDocumentDTO[];
    object: ObjectDTO;
    sort: SortOption;
}

const DocumentList = ({ documentList, sort, object }: DocumentListProps) => {
    return (
        <div className={styles.container}>
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
                        <span className={styles.countItem}>{sort.label}</span>
                    </div>
                </div>
            )}
            {documentList && documentList.length > 0 && (
                <div className={styles.list}>
                    {documentList.map((journal, index) => (
                        <DocumentCard key={index} document={journal} object={object} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentList;
