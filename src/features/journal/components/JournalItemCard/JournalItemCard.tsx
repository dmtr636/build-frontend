import React, { useMemo } from "react";
import styles from "./JournalItemCard.module.scss";
import {
    IconCheckmark,
    IconDote,
    IconFlag,
    IconImage,
    IconInfo,
    IconPin,
    IconPlus,
    IconSuccess,
    IconTime,
    IconUser,
} from "src/ui/assets/icons";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Link, useNavigate } from "react-router-dom";
import { appStore, layoutStore, violationStore } from "src/app/AppStore.ts";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { formatDateShort } from "src/shared/utils/date.ts";
import { clsx } from "clsx";
import {
    IconBuildClock,
    IconDangerous,
    IconHardware,
} from "src/features/journal/components/JournalItemCard/assets";
import { formatObjNumber } from "src/shared/utils/formatObjNumber.ts";

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы идут с 0
    const year = date.getFullYear();
    return `${month}.${year}`;
}

interface journalItemCardProps {
    project: ObjectDTO;
}

const JournalItemCard = ({ project }: journalItemCardProps) => {
    const navigate = useNavigate();
    const violatinons = violationStore.allViolations;
    const isGuilty =
        violatinons.filter((i) => i.projectId === project.id && i.status !== "DONE")?.length > 0;
    const customerOrg = appStore.organizationsStore.organizationById(project?.customerOrganization);
    const contractorOrg = appStore.organizationsStore.organizationById(
        project?.contractorOrganization,
    );

    const customerUser = appStore.userStore.userById(
        project?.projectUsers.find((user) => user.side === "CUSTOMER" && user.isResponsible)?.id ??
            "",
    );
    const contractUser = appStore.userStore.userById(
        project?.projectUsers.find((user) => user.side === "CONTRUCTOR" && user.isResponsible)
            ?.id ?? "",
    );
    const statusBadge = useMemo(() => {
        switch (project.status) {
            case "IN_PROGRESS":
                return (
                    <div className={clsx(styles.badge, styles.progress)}>
                        <IconHardware /> Стройка
                    </div>
                );
            case "AWAIT":
                return (
                    <div className={clsx(styles.badge, styles.await)}>
                        <IconBuildClock /> Ожидание
                    </div>
                );
            case "COMPLETE":
                return (
                    <div className={clsx(styles.badge, styles.complete)}>
                        <IconSuccess /> Завершён
                    </div>
                );
            default:
                return null;
        }
    }, [project.status]);
    const isMobile = layoutStore.isMobile;
    if (isMobile) {
        return (
            <div
                className={styles.container}
                onClick={() => navigate(`/admin/journal/${project.id}`)}
            >
                <div className={styles.img}>
                    {project?.imageId ? (
                        <div className={styles.avatarImg}>
                            <img src={`${GET_FILES_ENDPOINT}/${project?.imageId}`} />
                        </div>
                    ) : (
                        <div className={styles.noImg}>
                            <IconImage />
                        </div>
                    )}
                </div>
                <div className={styles.textBLockMob}>
                    <div className={styles.textMob}>{project.name}</div>
                    <Typo
                        style={{
                            color: "rgba(0, 0, 0, 0.39)",
                        }}
                        variant={"subheadS"}
                    >{`№ ${formatObjNumber(project.objectNumber)}`}</Typo>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.container} onClick={() => navigate(`/admin/journal/${project.id}`)}>
            <div className={styles.badgeArray}>
                {isGuilty && (
                    <div className={clsx(styles.badge, styles.error)}>
                        <IconDangerous /> Есть нарушения
                    </div>
                )}
                {statusBadge}
            </div>
            <div className={styles.img}>
                {project?.imageId ? (
                    <div className={styles.avatarImg}>
                        <img src={`${GET_FILES_ENDPOINT}/${project?.imageId}`} />
                    </div>
                ) : (
                    <div className={styles.noImg}>
                        <IconImage />
                    </div>
                )}
            </div>
            <div className={styles.form}>
                <div className={styles.header}>
                    <Typo variant={"subheadXL"}>{project.name}</Typo>
                    <IconDote />
                    <Typo
                        style={{
                            color: "rgba(0, 0, 0, 0.39)",
                        }}
                        variant={"subheadXL"}
                    >{`№ ${formatObjNumber(project.objectNumber)}`}</Typo>
                </div>
                {(project.address || project.centroid) && (
                    <div className={styles.location}>
                        <IconPin />
                        <Typo variant="subheadS" mode="accent">
                            {[
                                project.address?.city,
                                project.address?.street,
                                project.address?.house,
                                project.centroid?.latitude,
                                project.centroid?.longitude,
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </Typo>
                    </div>
                )}
                <div className={styles.userBlock}>
                    <div className={styles.userBlockContractor}>
                        <div className={styles.userBlockHeader}>Заказчик</div>
                        <div className={styles.userItem}>
                            <div className={styles.itemLogo}>
                                {customerOrg?.imageId ? (
                                    <img
                                        className={styles.imgLogoItem}
                                        src={`${GET_FILES_ENDPOINT}/${customerOrg?.imageId}`}
                                    />
                                ) : (
                                    <div className={styles.noImgItem}>
                                        {customerOrg ? (
                                            <IconFlag />
                                        ) : (
                                            <div className={styles.plus}>
                                                <IconPlus />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Организация
                                    </Typo>
                                </div>
                                {customerOrg ? (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        to={`/admin/organizations/${customerOrg?.id}`}
                                        className={styles.itemName}
                                    >
                                        {customerOrg?.name}
                                    </Link>
                                ) : (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.itemName}
                                        to={`/admin/journal/${project?.id}/users`}
                                    >
                                        Нужно выбрать
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className={styles.userItem}>
                            <div className={styles.itemLogo}>
                                {customerUser?.imageId ? (
                                    <img
                                        className={styles.imgLogoItem}
                                        src={`${GET_FILES_ENDPOINT}/${customerUser?.imageId}`}
                                    />
                                ) : (
                                    <div className={styles.noImgItem}>
                                        {customerUser ? (
                                            <IconUser />
                                        ) : (
                                            <div className={styles.plus}>
                                                <IconPlus />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Ответственный на объекте
                                    </Typo>
                                </div>
                                {customerUser ? (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        to={`/admin/users/${customerUser?.id}`}
                                        className={styles.itemName}
                                    >
                                        {getFullName(customerUser)}
                                    </Link>
                                ) : (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.itemName}
                                        to={`/admin/journal/${project?.id}/users`}
                                    >
                                        Нужно назначить
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.userBlockContractor}>
                        <div className={styles.userBlockHeader}>Подрядчик</div>
                        <div className={styles.userItem}>
                            <div className={styles.itemLogo}>
                                {contractorOrg?.imageId ? (
                                    <img
                                        className={styles.imgLogoItem}
                                        src={`${GET_FILES_ENDPOINT}/${contractorOrg?.imageId}`}
                                    />
                                ) : (
                                    <div className={styles.noImgItem}>
                                        {contractorOrg ? (
                                            <IconFlag />
                                        ) : (
                                            <div className={styles.plus}>
                                                <IconPlus />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Организация
                                    </Typo>
                                </div>
                                {contractorOrg ? (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        to={`/admin/organizations/${contractorOrg?.id}`}
                                        className={styles.itemName}
                                    >
                                        {contractorOrg?.name}
                                    </Link>
                                ) : (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.itemName}
                                        to={`/admin/journal/${project?.id}/users`}
                                    >
                                        Нужно выбрать
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className={styles.userItem}>
                            <div className={styles.itemLogo}>
                                {contractUser?.imageId ? (
                                    <img
                                        className={styles.imgLogoItem}
                                        src={`${GET_FILES_ENDPOINT}/${contractUser?.imageId}`}
                                    />
                                ) : (
                                    <div className={styles.noImgItem}>
                                        {contractUser ? (
                                            <IconUser />
                                        ) : (
                                            <div className={styles.plus}>
                                                <IconPlus />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Ответственный на объекте
                                    </Typo>
                                </div>
                                {contractUser ? (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        to={`/admin/users/${contractUser?.id}`}
                                        className={styles.itemName}
                                    >
                                        {getFullName(contractUser)}
                                    </Link>
                                ) : (
                                    <Link
                                        onClick={(event) => event.stopPropagation()}
                                        className={styles.itemName}
                                        to={`/admin/journal/${project?.id}/users`}
                                    >
                                        Нужно назначить
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {(project.lastInspection || project.plannedPeriod || project.type) && (
                    <div className={styles.footerBlock}>
                        {project.lastInspection && (
                            <div className={styles.footerItem}>
                                <div className={styles.footerItemHead}>Последняя проверка</div>
                                <div className={styles.footerItemText}>
                                    <IconCheckmark /> {formatDateShort(project.lastInspection)}
                                </div>
                            </div>
                        )}
                        {project.plannedPeriod?.start && project.plannedPeriod?.end && (
                            <div className={styles.footerItem}>
                                <div className={styles.footerItemHead}>Период строительства</div>
                                <div className={styles.footerItemText}>
                                    <IconTime />{" "}
                                    {`${formatDate(project.plannedPeriod?.start)} - ${formatDate(project.plannedPeriod?.end)}`}
                                </div>
                            </div>
                        )}
                        {project.type && (
                            <div className={styles.footerItem}>
                                <div className={styles.footerItemHead}>Тип объекта</div>
                                <div className={styles.footerItemText}>
                                    <IconInfo /> {project.type}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalItemCard;
