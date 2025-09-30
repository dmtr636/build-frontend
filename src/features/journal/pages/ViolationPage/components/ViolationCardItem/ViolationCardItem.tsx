import React, { useMemo, useState } from "react";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import styles from "./ViolationCardItem.module.scss";
import {
    IconArrowRight,
    IconCalendar,
    IconClose,
    IconEdit,
    IconError,
    IconNext,
    IconPlay,
    IconShowPass,
    IconSuccess,
    IconTime,
    IconUser,
} from "src/ui/assets/icons";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { observer } from "mobx-react-lite";
import { fileUrl } from "src/shared/utils/file.ts";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import clsx from "clsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import AddViolationOverlay from "src/features/journal/pages/ViolationPage/components/AddOverlay/AddViolationOverlay.tsx";
import { appStore, layoutStore } from "src/app/AppStore.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

interface ViolationCardItemProps {
    violation: ProjectViolationDTO;
    onClick: () => void;
    active?: boolean;
}

function formatDueDate(dateArray: [number, number, number]): string {
    const [year, month, day] = dateArray;

    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    const yy = String(year).slice(-2);

    return `${dd}.${mm}.${yy}`;
}

function formatDateTime(dateString: string): { date: string; time: string } {
    const date = new Date(dateString);

    // дата в формате DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    // время в формате HH:mm (по локальному времени)
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    return { date: formattedDate, time: formattedTime };
}

function getShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/); // разделяем по пробелам
    const [lastName = "", firstName = "", patronymic = ""] = parts;
    const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic[0].toUpperCase()}.` : "";

    return [lastName, firstInitial, patronymicInitial].filter(Boolean).join(" ");
}

const ViolationCardItem = observer(({ violation, onClick, active }: ViolationCardItemProps) => {
    const [open, setOpen] = useState(false);
    const currentUserRole = appStore.accountStore.currentUser?.role;
    const { id } = useParams();
    const isMobile = layoutStore.isMobile;

    const renderStatusButton = useMemo(() => {
        switch (violation?.status) {
            case "TODO":
                return (
                    <Button size={"small"} hover={true} type={"outlined"} mode={"neutral"}>
                        Ожидание
                    </Button>
                );

            case "IN_PROGRESS":
                return (
                    <Button size={"small"} type={"primary"} mode={"neutral"}>
                        В работе
                    </Button>
                );

            case "IN_REVIEW":
                return !isMobile ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button
                            fullWidth={isMobile}
                            size="small"
                            type="secondary"
                            mode="lavender"
                            onClick={() =>
                                appStore.violationStore
                                    .changeStatus(violation.id, "DONE", id ?? "")
                                    .then(() =>
                                        snackbarStore.showNeutralPositiveSnackbar("Статус изменен"),
                                    )
                            }
                        >
                            Принять
                        </Button>

                        <Button
                            fullWidth={isMobile}
                            onClick={() =>
                                appStore.violationStore
                                    .changeStatus(violation.id, "TODO", id ?? "")
                                    .then(() =>
                                        snackbarStore.showNeutralPositiveSnackbar("Статус изменен"),
                                    )
                            }
                            size="small"
                            type="secondary"
                            mode="negative"
                            iconBefore={<IconClose />}
                        />
                    </div>
                ) : null;

            case "DONE":
                return (
                    <Button
                        fullWidth={isMobile}
                        size={"small"}
                        iconBefore={<IconSuccess />}
                        type={"primary"}
                        mode={"positive"}
                    >
                        Готово
                    </Button>
                );
        }
    }, []);
    const navigate = useNavigate();
    const renderStatusButtonPodryadchik = useMemo(() => {
        switch (violation?.status) {
            case "TODO":
                return (
                    <Button
                        size={"small"}
                        type={"primary"}
                        mode={"neutral"}
                        fullWidth={isMobile}
                        iconBefore={<IconPlay />}
                        onClick={(event) => {
                            event.stopPropagation();
                            appStore.violationStore
                                .changeStatus(violation.id, "IN_PROGRESS", id ?? "")
                                .then(() =>
                                    snackbarStore.showNeutralPositiveSnackbar("Статус изменен"),
                                );
                        }}
                    >
                        Взять в работу
                    </Button>
                );

            case "IN_PROGRESS":
                return (
                    <Button
                        fullWidth={isMobile}
                        size={"small"}
                        type={"primary"}
                        mode={"positive"}
                        iconBefore={<IconShowPass />}
                        onClick={() =>
                            appStore.violationStore
                                .changeStatus(violation.id, "IN_REVIEW", id ?? "")
                                .then(() =>
                                    snackbarStore.showNeutralPositiveSnackbar("Статус изменен"),
                                )
                        }
                    >
                        Отправить на проверку
                    </Button>
                );

            case "IN_REVIEW":
                return (
                    <Button
                        fullWidth={isMobile}
                        size={"small"}
                        iconBefore={<IconTime />}
                        type={"secondary"}
                        mode={"lavender"}
                        hover={false}
                    >
                        На проверке
                    </Button>
                );

            case "DONE":
                return (
                    <Button
                        fullWidth={isMobile}
                        size={"small"}
                        iconBefore={<IconSuccess />}
                        type={"primary"}
                        mode={"positive"}
                    >
                        Готово
                    </Button>
                );
        }
    }, []);
    if (!violation) return null;

    return (
        <div
            className={clsx(styles.container, { [styles.active]: active })}
            onClick={() => {
                onClick();
                if (isMobile && violation.status === "IN_REVIEW") {
                    navigate(`${violation.id}`);
                }
            }}
        >
            <div className={styles.badges}>
                <Tooltip
                    text={formatDateTime(violation?.violationTime).date}
                    requireOverflow
                    delay={500}
                >
                    <div className={clsx(styles.badge, styles.badgeNoLimit)}>
                        <IconCalendar />
                        <span className={styles.badgeText}>
                            {formatDateTime(violation?.violationTime).date}
                        </span>
                    </div>
                </Tooltip>
                <Tooltip
                    text={formatDateTime(violation?.violationTime).time}
                    requireOverflow
                    delay={500}
                >
                    <div className={styles.badge}>
                        <IconTime />
                        <span className={styles.badgeText}>
                            {formatDateTime(violation?.violationTime).time}
                        </span>
                    </div>
                </Tooltip>
                <Tooltip
                    text={violation?.isNote ? "Замечание" : "Нарушение"}
                    requireOverflow
                    delay={500}
                >
                    <div className={styles.badge}>
                        <span className={styles.badgeText}>
                            {violation?.isNote ? "Замечание" : "Нарушение"}
                        </span>
                    </div>
                </Tooltip>

                <Tooltip text={violation?.category} requireOverflow delay={500}>
                    <div className={styles.badge}>
                        <span className={styles.badgeText}>{violation?.category}</span>
                    </div>
                </Tooltip>

                <Tooltip text={violation?.kind} requireOverflow delay={500}>
                    <div className={styles.badge}>
                        <span className={styles.badgeText}>{violation?.kind}</span>
                    </div>
                </Tooltip>

                <Tooltip text={violation?.severityType} requireOverflow delay={500}>
                    <div
                        className={clsx(styles.badge, {
                            [styles.error]: violation?.severityType?.toLowerCase() === "грубое",
                        })}
                    >
                        <span className={styles.badgeText}>{violation?.severityType}</span>
                    </div>
                </Tooltip>
            </div>
            <div className={styles.users}>
                <div className={styles.user}>
                    <div className={styles.imgBlock}>
                        {violation?.author?.imageId ? (
                            <img
                                className={styles.userImg}
                                src={`${GET_FILES_ENDPOINT}/${violation?.author?.imageId}`}
                            />
                        ) : (
                            <div className={styles.noUser}>
                                <IconUser />
                            </div>
                        )}
                    </div>
                    <div className={styles.userTexts} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.role}>Автор</div>
                        <Link
                            to={`/admin/users/${violation?.author.id}`}
                            className={styles.userName}
                        >
                            {getShortName(splitFullName(violation?.author ?? ""))}
                        </Link>
                    </div>
                </div>
                {violation?.assignee && (
                    <div className={styles.user}>
                        <div className={styles.imgBlock}>
                            {violation?.assignee?.imageId ? (
                                <img
                                    className={styles.userImg}
                                    src={`${GET_FILES_ENDPOINT}/${violation?.assignee?.imageId}`}
                                />
                            ) : (
                                <div className={styles.noUser}>
                                    <IconUser />
                                </div>
                            )}
                        </div>
                        <div className={styles.userTexts} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.role}>Взял в работу</div>
                            <Link
                                to={`/admin/users/${violation.assignee.id}`}
                                className={styles.userName}
                            >
                                {getShortName(splitFullName(violation?.assignee ?? ""))}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.text}>{violation.name}</div>
            <div className={styles.buttonBlock}>
                {currentUserRole !== "USER" ? renderStatusButtonPodryadchik : renderStatusButton}
                {!(currentUserRole === "USER" && violation.status === "IN_REVIEW") && !isMobile && (
                    <Button
                        onClick={(e) => e.stopPropagation()}
                        type={"outlined"}
                        mode={"neutral"}
                        size={"small"}
                    >
                        Комментарии
                    </Button>
                )}
                {(violation.status === "TODO" || violation.status === "IN_PROGRESS") &&
                    !isMobile && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(true);
                            }}
                            type={"outlined"}
                            mode={"neutral"}
                            size={"small"}
                            iconBefore={<IconEdit />}
                        />
                    )}
                {!isMobile && (
                    <div className={styles.info}>
                        <span style={{ opacity: 0.7 }}>Нужно исправить до</span>
                        <div className={styles.infoDate}>{formatDueDate(violation.dueDate)}</div>
                    </div>
                )}
                {!isMobile && (
                    <ButtonIcon
                        rounding={"peak"}
                        type={active ? "outlined" : "primary"}
                        mode={"neutral"}
                        size={"small"}
                    >
                        {active ? <IconClose /> : <IconNext />}
                    </ButtonIcon>
                )}
            </div>
            <AddViolationOverlay
                open={open}
                setOpen={setOpen}
                editingViolation={violation}
                isEditing={true}
            />
        </div>
    );
});

export default ViolationCardItem;
