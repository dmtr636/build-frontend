import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Link, useNavigate, useParams } from "react-router-dom";
import {
    accountStore,
    appStore,
    layoutStore,
    violationStore,
    worksStore,
} from "src/app/AppStore.ts";
import styles from "./ReviewPage.module.scss";
import {
    IconApps,
    IconAttention,
    IconCheckmark,
    IconDote,
    IconFlag,
    IconImage,
    IconInfo,
    IconNext,
    IconPin,
    IconPlus,
    IconSuccess,
    IconTime,
    IconUser,
} from "src/ui/assets/icons";
import clsx from "clsx";
import { endpoints, GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { formatDateShort } from "src/shared/utils/date.ts";
import {
    IconBuildClock,
    IconHardware,
} from "src/features/journal/components/JournalItemCard/assets";
import { formatObjNumber } from "src/shared/utils/formatObjNumber.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { MapEditor, MapEditorValue } from "src/features/map/MapEditor.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { OpeningCheckListSections } from "src/features/journal/pages/WorksPage/components/CheckListSection/OpeningCheckListSections.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { navigate } from "@storybook/addon-links";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Scanner } from "@yudiel/react-qr-scanner";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы идут с 0
    const year = date.getFullYear();
    return `${month}.${year}`;
}

const ReviewPage = observer(() => {
    const [unlock, setUnlock] = useState(false);
    const [unlockReason, setUnlockReason] = useState<string | null>(null);

    function validateQrCode(qrData: string, currentObjectId: string) {
        if (!qrData || !qrData.includes("_")) {
            setUnlock(false);
            setUnlockReason("Попробуйте еще раз");
            return;
        }

        const [timestampStr, objectId] = qrData.split("_");
        if (!timestampStr || !objectId) {
            setUnlock(false);
            setUnlockReason("Попробуйте еще раз");
            return;
        }

        const qrTime = new Date(timestampStr).getTime();
        const now = Date.now();

        if (isNaN(qrTime)) {
            setUnlock(false);
            setUnlockReason("Некорректная дата в QR-коде");
            return;
        }

        const diffSeconds = (now - qrTime) / 1000;

        if (diffSeconds > 10) {
            setUnlock(false);
            setUnlockReason("QR-код устарел");
            return;
        }

        if (objectId != currentObjectId) {
            setUnlock(false);
            setUnlockReason("Неверный объект");
            return;
        }

        setUnlock(true);
        snackbarStore.showNeutralPositiveSnackbar("QR-код успешно отсканирован");
        setUnlockReason(null); // очищаем, если всё ок
    }

    const { id } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const project = appStore.objectStore.ObjectMap.get(id ?? "");
    const customerOrg = appStore.organizationsStore.organizationById(project?.customerOrganization);
    const contractorOrg = appStore.organizationsStore.organizationById(
        project?.contractorOrganization,
    );
    const navigate = useNavigate();
    const customerUser = appStore.userStore.userById(
        project?.projectUsers.find((user) => user.side === "CUSTOMER" && user.isResponsible)?.id ??
            "",
    );
    const contractUser = appStore.userStore.userById(
        project?.projectUsers.find((user) => user.side === "CONTRUCTOR" && user.isResponsible)
            ?.id ?? "",
    );
    const statusBadge = useMemo(() => {
        switch (project?.status) {
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
    }, [project?.status]);
    const violations = violationStore.violations;
    const works = worksStore.works;
    useLayoutEffect(() => {
        if (id) {
            appStore.violationStore.fetchViolationByObj(id);
            appStore.worksStore.fetchWorks(id);
            appStore.worksStore.fetchChecklists(id);
        }
    }, [id]);
    const [mapObj, setMapObj] = useState<MapEditorValue>({
        name: "",
        marker: null, // или { lat: ..., lng: ... }
        polygon: null, // или массив координат
        color: "#1971c2",
        address: {
            city: "",
            street: "",
            house: "",
        },
    });
    const setInitial = () => {
        if (!project) {
            return;
        }
        setMapObj({
            ...mapObj,
            name: project.name,
            number: project.objectNumber,
            marker: project.centroid
                ? {
                      lat: project.centroid.latitude,
                      lng: project.centroid.longitude,
                  }
                : null,
            polygon: project.polygon?.length
                ? project.polygon.map((point) => ({
                      lat: point.latitude,
                      lng: point.longitude,
                  }))
                : null,
            address: project.address
                ? deepCopy(project.address)
                : {
                      city: "",
                      street: "",
                      house: "",
                  },
        });
    };
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!project || ready) {
            return;
        }
        setInitial();
        setTimeout(() => {
            mapObj.marker = null;
            mapObj.polygon = null;
            setMapObj({
                ...mapObj,
            });
        }, 15);
        setTimeout(() => {
            setInitial();
            setReady(true);
        }, 30);
    }, [project]);

    useEffect(() => {
        return () => {
            worksStore.openingChecklists = [];
            worksStore.openingChecklistsForm = [];
            worksStore.dailyChecklists = [];
            worksStore.dailyChecklistsForm = [];
        };
    }, []);

    const showChecklist = worksStore.openingChecklists?.[0]?.status === "IN_PROGRESS";

    useLayoutEffect(() => {
        if (project) layoutStore.setHeaderProps({ title: project?.name });
    }, [project]);
    const isMobile = layoutStore.isMobile;
    /*const { pos, inside, error, lastChangeTs } = useGeofence({
            polygon: project?.polygon ?? ([] as any),
            throttleMs: 1000,
            enableHighAccuracy: true,
            minAccuracyMeters: 500,
            onEnter: (p) => console.log("Вход в зону", p),
            onExit: (p) => console.log("Выход из зоны", p),
        });*/
    /*
            console.log(pos);
        */
    /*console.log(inside);*/
    /*
            console.log(JSON.parse(JSON.stringify(project?.polygon)));
        */

    const loading =
        !project ||
        !worksStore.openingChecklistsForm?.[0]?.sections?.length ||
        !worksStore.todayChecklistForm?.sections?.length;
    return (
        <>
            <div className={styles.container}>
                {!isMobile && (
                    <div className={styles.header}>
                        <div className={styles.icon}>
                            <IconApps />
                        </div>
                        <div>Обзор</div>
                    </div>
                )}
                {showChecklist && (
                    <div
                        style={{
                            marginTop: 24,
                            maxWidth: 829,
                        }}
                    >
                        <OpeningCheckListSections
                            sections={worksStore.openingChecklistsForm?.[0]?.sections ?? []}
                        />
                        <div
                            style={{
                                marginTop: 20,
                                marginBottom: 124,
                            }}
                        >
                            {accountStore.isContractor && (
                                <>
                                    {worksStore.openingChecklists?.[0]?.sections?.some((s) =>
                                        s.items.some((i) => !i.answer),
                                    ) && (
                                        <Button
                                            mode={"neutral"}
                                            size={"large"}
                                            disabled={worksStore.openingChecklistsForm?.[0]?.sections?.some(
                                                (s) => s.items.some((i) => !i.answer),
                                            )}
                                            onClick={async () => {
                                                const checkList =
                                                    worksStore.openingChecklistsForm[0];
                                                const answers = checkList.sections.flatMap((s) =>
                                                    s.items.map((item) => ({
                                                        templateItemId: item.templateItemId,
                                                        answer: item.answer,
                                                    })),
                                                );
                                                await worksStore.apiClient.put(
                                                    endpoints.projectChecklists + `/${id}`,
                                                    {
                                                        checklistInstanceId: checkList?.id,
                                                        status: "IN_PROGRESS",
                                                        answers: answers,
                                                    },
                                                );
                                                await worksStore.fetchChecklists(id ?? "");
                                            }}
                                        >
                                            Отправить на согласование
                                        </Button>
                                    )}
                                    {worksStore.openingChecklists?.[0]?.sections?.every((s) =>
                                        s.items.some((i) => !!i.answer),
                                    ) && (
                                        <Button
                                            mode={"neutral"}
                                            type={"secondary"}
                                            size={"large"}
                                            disabled={true}
                                            iconBefore={<IconTime />}
                                        >
                                            Находится на согласовании
                                        </Button>
                                    )}
                                </>
                            )}
                            {accountStore.isInspector && (
                                <>
                                    <Button
                                        mode={"neutral"}
                                        size={"large"}
                                        disabled={worksStore.openingChecklistsForm?.[0]?.sections?.some(
                                            (s) => s.items.some((i) => !i.answer),
                                        )}
                                        onClick={async () => {
                                            const checkList = worksStore.openingChecklistsForm[0];
                                            const answers = checkList.sections.flatMap((s) =>
                                                s.items.map((item) => ({
                                                    templateItemId: item.templateItemId,
                                                    answer: item.answer,
                                                })),
                                            );
                                            await worksStore.apiClient.put(
                                                endpoints.projectChecklists + `/${id}`,
                                                {
                                                    checklistInstanceId: checkList?.id,
                                                    status: "DONE",
                                                    answers: answers,
                                                },
                                            );
                                            await worksStore.fetchChecklists(id ?? "");
                                        }}
                                    >
                                        Согласовать открытие
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div
                    className={styles.content}
                    style={{
                        display: showChecklist ? "none" : undefined,
                        opacity: loading ? 0 : 1,
                        transition: "opacity 100ms",
                    }}
                >
                    {isMobile && !accountStore.isContractor && !unlock && (
                        <div className={styles.containerAlert}>
                            <Alert
                                icon={<IconAttention />}
                                title={"Изменение не доступно"}
                                mode={"warning"}
                                subtitle={"Посетите объект"}
                                actions={[
                                    <Button
                                        onClick={() => setIsOpen(true)}
                                        type={"primary"}
                                        size={"small"}
                                        mode={"neutral"}
                                        key={1}
                                    >
                                        Сканировать QR-код
                                    </Button>,
                                ]}
                            ></Alert>
                            <Typo variant={"bodyM"} mode={"negative"}>
                                {unlockReason}
                            </Typo>
                        </div>
                    )}
                    {isMobile &&
                        (!accountStore.isContractor ? (
                            <div className={styles.buttonsCheck}>
                                <Button
                                    disabled={!unlock}
                                    onClick={() => navigate(`/admin/journal/${id}/status`)}
                                    mode={"positive"}
                                    size={"small"}
                                    counter={works.length}
                                    fullWidth={true}
                                >
                                    Проверить работу
                                </Button>
                                <Button
                                    onClick={() => navigate(`/admin/journal/${id}/create`)}
                                    iconBefore={<IconPlus />}
                                    disabled={!unlock}
                                    mode={"negative"}
                                    size={"small"}
                                    fullWidth={true}
                                >
                                    Добавить нарушение
                                </Button>
                                <Button
                                    onClick={() =>
                                        navigate(`/admin/journal/${id}/violations?status=4`)
                                    }
                                    fullWidth={true}
                                    disabled={!unlock}
                                    type={"outlined"}
                                    counter={
                                        violations.filter((i) => i.status === "IN_REVIEW").length
                                            ? violations.filter((i) => i.status === "IN_REVIEW")
                                                  .length
                                            : undefined
                                    }
                                    /*   iconBefore={<IconPlus />}*/
                                    mode={"neutral"}
                                    size={"small"}
                                >
                                    Исправленные нарушения
                                </Button>
                            </div>
                        ) : (
                            <div className={styles.buttonsCheck}>
                                <Button
                                    onClick={() => navigate(`/admin/journal/${id}/status`)}
                                    mode={"neutral"}
                                    size={"small"}
                                    counter={works.length}
                                    fullWidth={true}
                                >
                                    Состав работ и чек-листы
                                </Button>
                                <Button
                                    onClick={() =>
                                        navigate(`/admin/journal/${id}/violations?status=2`)
                                    }
                                    counter={violations.length}
                                    mode={"negative"}
                                    size={"small"}
                                    fullWidth={true}
                                >
                                    Исправить нарушения
                                </Button>
                                <Button
                                    onClick={() => navigate(`/admin/journal/${id}/materials`)}
                                    fullWidth={true}
                                    type={"outlined"}
                                    mode={"neutral"}
                                    size={"small"}
                                >
                                    Материалы
                                </Button>
                            </div>
                        ))}
                    <div className={clsx(styles.itemForm, styles.left)}>
                        <div className={styles.objHead}>
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
                            {(project?.lastInspection ||
                                project?.plannedPeriod ||
                                project?.type) && (
                                <div className={styles.footerBlock}>
                                    {project.plannedPeriod?.start && project.plannedPeriod?.end && (
                                        <div className={styles.footerItem}>
                                            <div className={styles.footerItemHead}>
                                                Период строительства
                                            </div>
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
                                    {project.lastInspection && (
                                        <div className={styles.footerItem}>
                                            <div className={styles.footerItemHead}>
                                                Последняя проверка
                                            </div>
                                            <div className={styles.footerItemText}>
                                                <IconCheckmark />{" "}
                                                {formatDateShort(project.lastInspection)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.objStatus}>{statusBadge}</div>
                        <div className={styles.objInfo}>
                            {project?.name}
                            {!isMobile && <IconDote />}{" "}
                            <span
                                style={{ color: "rgba(0, 0, 0, 0.39)" }}
                            >{`№ ${formatObjNumber(project?.objectNumber ?? "")}`}</span>
                        </div>
                    </div>
                    <div className={styles.map}>
                        {project && !isOpen && (
                            <MapEditor
                                readyProp={false}
                                height={"300px"}
                                value={mapObj}
                                onChange={() => {}}
                                center={
                                    project?.centroid
                                        ? {
                                              lat: project.centroid.latitude,
                                              lng: project.centroid.longitude,
                                          }
                                        : undefined
                                }
                                editable={false}
                            />
                        )}
                        <div className={styles.mapInfo}>
                            {project?.address || project?.centroid ? (
                                <div className={styles.location}>
                                    <div className={styles.pin}>
                                        <IconPin />
                                    </div>
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
                            ) : (
                                <div
                                    className={clsx(styles.location, styles.noMap)}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        navigate(`/admin/journal/${project?.id}/location`)
                                    }
                                >
                                    <div className={styles.pin}>
                                        <IconPin />
                                    </div>
                                    <Typo variant="subheadS" mode="accent">
                                        Местоположение не указано
                                    </Typo>
                                    <div style={{ marginLeft: "auto" }}>
                                        <IconNext />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.userBlockContainer}>
                        <div className={clsx(styles.itemForm, styles.right)}>
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
                                                    <div className={styles.plus}>
                                                        <IconFlag />
                                                    </div>
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
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                to={`/admin/organizations/${customerOrg?.id}`}
                                                className={styles.itemName}
                                            >
                                                {customerOrg?.name}
                                            </Link>
                                        ) : (
                                            <Link
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
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
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                to={`/admin/users/${customerUser?.id}`}
                                                className={styles.itemName}
                                            >
                                                {getFullName(customerUser)}
                                            </Link>
                                        ) : (
                                            <Link
                                                aria-disabled={true}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
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
                        <div className={clsx(styles.itemForm, styles.right)}>
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
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                to={`/admin/organizations/${contractorOrg?.id}`}
                                                className={styles.itemName}
                                            >
                                                {contractorOrg?.name}
                                            </Link>
                                        ) : (
                                            <Link
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
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
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                to={`/admin/users/${contractUser?.id}`}
                                                className={styles.itemName}
                                            >
                                                {getFullName(contractUser)}
                                            </Link>
                                        ) : (
                                            <Link
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (isMobile) {
                                                        event.preventDefault();
                                                    }
                                                }}
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
                        {!isMobile && (
                            <div className={clsx(styles.itemForm, styles.right)}>
                                {works.length || violations.length ? (
                                    <div className={styles.infoBlock}>
                                        {Boolean(works.length) && (
                                            <div
                                                className={styles.works}
                                                onClick={() =>
                                                    navigate(`/admin/journal/${project?.id}/status`)
                                                }
                                            >
                                                <div className={styles.workCount}>
                                                    {works.length}
                                                </div>
                                                Работы
                                            </div>
                                        )}
                                        {Boolean(violations.length) && (
                                            <div
                                                className={styles.works}
                                                style={{ color: "#C02626" }}
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/journal/${project?.id}/violations`,
                                                    )
                                                }
                                            >
                                                <div className={styles.VCount}>
                                                    {" "}
                                                    {violations.length}
                                                </div>
                                                Нарушения
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={styles.noWork}
                                        onClick={() =>
                                            navigate(`/admin/journal/${project?.id}/status`)
                                        }
                                    >
                                        <div className={styles.noImgItem}>
                                            <div className={styles.plus}>
                                                <IconPlus />
                                            </div>
                                        </div>
                                        <span style={{ opacity: 0.8 }}>Работы</span>
                                        <div style={{ marginLeft: "auto" }}>
                                            <IconNext />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Overlay
                title={"Отсканируйте QR-код"}
                styles={{
                    card: { height: "100dvh", zIndex: 9999, width: "100vw", marginTop: 124 },
                }}
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <Scanner
                    sound={
                        "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"
                    }
                    onScan={(result) => {
                        if (result) {
                            validateQrCode(
                                atob(result[0]?.rawValue),
                                project?.objectNumber as string,
                            );
                            setIsOpen(false);
                        }
                    }}
                />
            </Overlay>
        </>
    );
});
export default ReviewPage;
