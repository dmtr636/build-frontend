import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { appStore, layoutStore, violationStore } from "src/app/AppStore.ts";
import { observer } from "mobx-react-lite";
import styles from "./ViolationItemPage.module.scss";
import { clsx } from "clsx";
import { IconCalendar, IconDocument, IconPin, IconTime, IconUser } from "src/ui/assets/icons";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { MapEditor } from "src/features/map/MapEditor.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";

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

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы идут с 0
    const year = date.getFullYear();
    return `${month}.${year}`;
}

const ViolationItemPage = observer(() => {
    const { id, violId } = useParams();
    const violation = violationStore.violations.find((violation) => violation.id === violId);
    const navigate = useNavigate();
    const [showMapOverlay, setShowMapOverlay] = useState(false);
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

    useEffect(() => {
        if (showMapOverlay) {
            layoutStore.setHeaderProps({
                ...layoutStore.headerProps,
                hide: true,
            });
        } else {
            layoutStore.setHeaderProps({
                ...layoutStore.headerProps,
                hide: false,
            });
        }
    }, [showMapOverlay]);

    useLayoutEffect(() => {
        if (id) violationStore.fetchViolationByObj(id);
    }, [id]);
    if (!violation) return null;

    return (
        <div className={styles.card}>
            <div className={styles.badges}>
                <div className={clsx(styles.badge)}>
                    <IconCalendar />
                    <span className={styles.badgeText}>
                        {formatDateTime(violation?.violationTime).date}
                    </span>
                </div>

                <div className={styles.badge}>
                    <IconTime />
                    <span className={styles.badgeText}>
                        {formatDateTime(violation?.violationTime).time}
                    </span>
                </div>

                <div className={styles.badge}>
                    <span className={styles.badgeText}>
                        {violation?.isNote ? "Замечание" : "Нарушение"}
                    </span>
                </div>

                <div className={styles.badge}>
                    <span className={styles.badgeText}>{violation?.category}</span>
                </div>

                <div className={styles.badge}>
                    <span className={styles.badgeText}>{violation?.kind}</span>
                </div>

                <div
                    className={clsx(styles.badge, {
                        [styles.error]: violation?.severityType?.toLowerCase() === "грубое",
                    })}
                >
                    <span className={styles.badgeText}>{violation?.severityType}</span>
                </div>
            </div>
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
                <div className={styles.userTexts}>
                    <div className={styles.role}>Автор</div>
                    <div className={styles.userName}>
                        {getShortName(splitFullName(violation?.author ?? ""))}
                    </div>
                </div>
            </div>
            <div className={styles.textForm}>{violation.name}</div>
            {violation.latitude && violation.longitude && (
                <Button
                    iconBefore={<IconPin />}
                    size={"medium"}
                    fullWidth={true}
                    mode={"neutral"}
                    onClick={() => {
                        setShowMapOverlay(true);
                    }}
                >
                    Посмотреть место нарушения
                </Button>
            )}
            {violation.dueDate && (
                <div className={styles.textBlock}>
                    <div>Нужно исправить до</div>
                    <div className={styles.textBlockSubtext}>{formatDate(violation.dueDate)}</div>
                </div>
            )}
            <div className={styles.textBlock}>
                <div>Нормативные документы</div>
                <div className={styles.docsArray}>
                    {violation.normativeDocuments.map((doc) => (
                        <div key={doc.id} className={styles.docItem}>
                            <IconDocument />
                            <span style={{ marginTop: 1 }}>
                                {`${doc.name} (${doc.regulation})`}{" "}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.PhotoBlock}>
                <div>Фотографии, подтверждающие факт нарушения</div>
                {violation.photos.map((photo, index) => (
                    <img className={styles.imgItem} key={index} src={fileUrl(photo.id)} />
                ))}
            </div>
            <div className={styles.buttonBlock}>
                <div className={styles.buttonItem}>
                    <Button
                        onClick={() =>
                            appStore.violationStore
                                .changeStatus(violation.id, "TODO", violation.id)
                                .then(() => {
                                    snackbarStore.showNeutralPositiveSnackbar("Статус изменен");
                                    navigate(-1);
                                })
                        }
                        type={"secondary"}
                        fullWidth={true}
                        mode={"negative"}
                        size={"small"}
                    >
                        Отклонить
                    </Button>
                </div>
                <div className={styles.buttonItem}>
                    <Button
                        onClick={() => {
                            appStore.violationStore
                                .changeStatus(violation?.id, "DONE", violation?.projectId)
                                .then(() => {
                                    {
                                        snackbarStore.showNeutralPositiveSnackbar("Статус изменен");
                                        navigate(-1);
                                    }
                                });
                        }}
                        fullWidth={true}
                        mode={"positive"}
                        size={"small"}
                    >
                        Принять
                    </Button>
                </div>
            </div>
            {showMapOverlay && (
                <Overlay
                    open={showMapOverlay}
                    onClose={() => setShowMapOverlay(false)}
                    title={"Место нарушения"}
                    smallPadding={true}
                    styles={{
                        background: {
                            zIndex: 10000,
                        },
                    }}
                    mobileMapOverlay={true}
                >
                    <div
                        style={{
                            width: "100%",
                        }}
                    >
                        <MapEditor
                            readyProp={false}
                            height={"400px"}
                            value={{
                                name: violation.name,
                                marker: {
                                    lat: violation.latitude,
                                    lng: violation.longitude,
                                },
                                polygon: currentObj?.polygon
                                    ? currentObj.polygon.map((item) => ({
                                          lat: item.latitude,
                                          lng: item.longitude,
                                      }))
                                    : null,
                            }}
                            onChange={() => {}}
                            center={{
                                lat: violation.latitude,
                                lng: violation.longitude,
                            }}
                            editable={false}
                        />
                        <Grid gap={12} style={{ marginTop: 20 }} columns={"1fr"}>
                            <Input
                                onChange={() => {}}
                                value={violation?.latitude ?? "-"}
                                formName={"Широта"}
                                readonly={true}
                            />
                            <Input
                                onChange={() => {}}
                                value={violation?.longitude ?? "-"}
                                formName={"Долгота"}
                                readonly={true}
                            />
                        </Grid>
                    </div>
                </Overlay>
            )}
        </div>
    );
});

export default ViolationItemPage;
