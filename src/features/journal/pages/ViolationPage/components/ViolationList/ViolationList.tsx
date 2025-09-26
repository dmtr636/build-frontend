import React from "react";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import styles from "./ViolationList.module.scss";
import ViolationCardItem from "src/features/journal/pages/ViolationPage/components/ViolationCardItem/ViolationCardItem.tsx";

interface violationListProps {
    violationList: ProjectViolationDTO[];
}

const ViolationList = ({ violationList }: violationListProps) => {
    return (
        <div className={styles.container}>
            {violationList.map((violation, index) => (
                <ViolationCardItem key={index} violation={violation} />
            ))}
        </div>
    );
};

export default ViolationList;
