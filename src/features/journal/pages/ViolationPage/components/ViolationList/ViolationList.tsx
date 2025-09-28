import React from "react";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import styles from "./ViolationList.module.scss";
import ViolationCardItem from "src/features/journal/pages/ViolationPage/components/ViolationCardItem/ViolationCardItem.tsx";
import { observer } from "mobx-react-lite";

interface violationListProps {
    violationList: ProjectViolationDTO[];
    onClick: (v: ProjectViolationDTO) => void;
    currentViolation: ProjectViolationDTO | null;
}

const ViolationList = observer(
    ({ violationList, onClick, currentViolation }: violationListProps) => {
        return (
            <div className={styles.container}>
                {violationList.map((violation, index) => (
                    <ViolationCardItem
                        active={currentViolation?.id === violation.id}
                        onClick={() => onClick(violation)}
                        key={index + violation.id}
                        violation={violation}
                    />
                ))}
            </div>
        );
    },
);

export default ViolationList;
