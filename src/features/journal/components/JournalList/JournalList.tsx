import React from "react";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { SortOption } from "src/features/users";
import styles from "./JournalList.module.scss";
import JournalItemCard from "src/features/journal/components/JournalItemCard/JournalItemCard.tsx";

interface JournalListProps {
    journalList: ObjectDTO[];
    sort: SortOption;
}

function pluralizeObjects(count: number): string {
    const absCount = Math.abs(count) % 100;
    const lastDigit = absCount % 10;

    if (absCount > 10 && absCount < 20) {
        return `${count} объектов`;
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return `${count} объекта`;
    }
    if (lastDigit === 1) {
        return `${count} объект`;
    }
    return `${count} объектов`;
}

const JournalList = ({ journalList, sort }: JournalListProps) => {
    return (
        <div className={styles.container}>
            {journalList.length > 0 && (
                <div className={styles.headFilters}>
                    <div className={styles.count}>
                        <span style={{ opacity: 0.6 }}>Отображается</span>
                        <span className={styles.countItem}>
                            {pluralizeObjects(journalList.length)}
                        </span>
                    </div>

                    <div className={styles.count} style={{ marginLeft: "auto" }}>
                        <span style={{ opacity: 0.6 }}>Сортируется</span>
                        <span className={styles.countItem}>{sort.label}</span>
                    </div>
                </div>
            )}
            {journalList.length > 0 && (
                <div className={styles.list}>
                    {journalList.map((journal, index) => (
                        <JournalItemCard key={index} project={journal} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default JournalList;
