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
            setUnlockReason("Неверный формат QR-кода");
            return;
        }

        const [timestampStr, objectId] = qrData.split("_");
        if (!timestampStr || !objectId) {
            setUnlock(false);
            setUnlockReason("Некорректная структура данных");
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

        if (objectId !== currentObjectId) {
            setUnlock(false);
            setUnlockReason("Неверный объект");
            return;
        }

        setUnlock(true);
        setUnlockReason(null); // очищаем, если всё ок
    }

    const { id } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<any>([]);
    const currenUser = appStore.accountStore.currentUser;
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
    console.log(atob("MjAyNS0xMC0wMVQxMjoyODoxMC4xMzhaXzI2MjA0OQ=="));
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
                title={"Отсканируйте QR-код на объекте"}
                styles={{ card: { height: "100vh", zIndex: 9999, width: "100vw", marginTop: 124 } }}
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <Scanner
                    onScan={(result) => {
                        if (result) {
                            validateQrCode(atob(result[0]?.rawValue), project?.id as string);
                            setIsOpen(false);
                        }
                    }}
                />
            </Overlay>
        </>
    );
});
export default ReviewPage;
