import React from "react";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { SortOption } from "src/features/users";
import styles from "./JournalList.module.scss";
import JournalItemCard from "src/features/journal/components/JournalItemCard/JournalItemCard.tsx";
import { IconError } from "src/ui/assets/icons";

interface JournalListProps {
    journalList: ObjectDTO[];
    sort?: SortOption;
}

const JournalList = ({ journalList }: JournalListProps) => {
    if (journalList.length === 0) {
        return (
            <div className={styles.noDocs}>
                <div className={styles.textNoDocs}>
                    <IconError />
                    Не нашли объект <br /> С такими параметрами
                </div>
            </div>
        );
    }
    return (
        <>
            {journalList.length > 0 && (
                <div className={styles.list}>
                    {journalList.map((journal, index) => (
                        <JournalItemCard key={index} project={journal} />
                    ))}
                </div>
            )}
        </>
    );
};

export default JournalList;
