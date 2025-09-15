import React, { useRef } from "react";
import styles from "./OrganizationListCard.module.scss";
import { IconClose, IconFlag, IconNext, IconUser } from "src/ui/assets/icons";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Organization } from "src/features/organizations/Organization.ts";
import { numDecl } from "src/shared/utils/numDecl.ts";

interface UserItemCardProps {
    onClick?: () => void;
    isOpen?: boolean;
    organization: Organization;
}

const OrganizationListCard = observer(({ onClick, isOpen, organization }: UserItemCardProps) => {
    const ref = useRef<HTMLDivElement | null>(null);

    function handleCard(event: React.MouseEvent<HTMLDivElement>) {
        if (ref.current && !ref.current.contains(event.target as Node) && onClick) {
            onClick();
        }
        if (!ref.current && onClick) {
            onClick();
        }
    }

    return (
        <div className={clsx(styles.container, { [styles.isOpen]: isOpen })} onClick={handleCard}>
            <div className={styles.imgBlock}>
                {organization?.imageId ? (
                    <img
                        className={styles.userImg}
                        src={`${GET_FILES_ENDPOINT}/${organization?.imageId}`}
                        alt={organization?.name}
                    />
                ) : (
                    <div className={styles.noUser}>
                        <IconFlag />
                    </div>
                )}
            </div>
            <div className={clsx(styles.infoBlock)}>
                <Tooltip text={organization?.name} requireOverflow={true}>
                    <div className={styles.name}>{organization?.name}</div>
                </Tooltip>
                <div className={styles.otherInfo}>
                    {organization?.employeeIds.length || "Нет"}{" "}
                    {numDecl(organization?.employeeIds.length, [
                        "сотрудник",
                        "сотрудника",
                        "сотрудников",
                    ])}
                </div>
            </div>
            <div className={styles.buttonsBlock}>
                <Tooltip text={isOpen ? "Закрыть" : "Открыть"}>
                    <div className={styles.icon}>{isOpen ? <IconClose /> : <IconNext />}</div>
                </Tooltip>
            </div>
        </div>
    );
});

export default OrganizationListCard;
