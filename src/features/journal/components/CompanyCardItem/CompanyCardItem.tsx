import React from "react";
import clsx from "clsx";
import styles from "./CompanyCardItem.module.scss";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import {
    IconBasket,
    IconChat,
    IconClose,
    IconFlag,
    IconNewInset,
    IconNext,
} from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { numDecl } from "src/shared/utils/numDecl.ts";
import { Organization } from "src/features/organizations/Organization.ts";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { useNavigate } from "react-router-dom";

const CompanyCardItem = ({
    organization,
    onClear,
}: {
    organization: Organization;
    onClear: () => void;
}) => {
    const navigate = useNavigate();
    return (
        <div className={clsx(styles.container)}>
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
                    {organization?.employees.length || "Нет"}{" "}
                    {numDecl(organization?.employees.length, [
                        "сотрудник",
                        "сотрудника",
                        "сотрудников",
                    ])}
                </div>
            </div>
            <div className={styles.buttonsBlock}>
                <Tooltip text={"Удалить из объекта"}>
                    <ButtonIcon
                        onClick={onClear}
                        pale={true}
                        mode={"negative"}
                        size={"small"}
                        type={"tertiary"}
                    >
                        <IconBasket />
                    </ButtonIcon>
                </Tooltip>
                <Tooltip text={"Перейти в организацию"}>
                    <ButtonIcon
                        onClick={() => navigate(`/admin/organizations/${organization.id}`)}
                        pale={true}
                        mode={"neutral"}
                        size={"small"}
                        type={"tertiary"}
                    >
                        <IconNewInset />
                    </ButtonIcon>
                </Tooltip>
            </div>
        </div>
    );
};

export default CompanyCardItem;
