import React, { useEffect, useState } from "react";
import styles from "./violationCard.module.scss";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import { clsx } from "clsx";
import { IconCalendar, IconDocument, IconPin, IconTime, IconUser } from "src/ui/assets/icons";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Link, useParams } from "react-router-dom";
import { splitFullName } from "src/shared/utils/splitFullName.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { MapEditor } from "src/features/map/MapEditor.tsx";
import { appStore, worksStore } from "src/app/AppStore.ts";

interface ViolationCardProps {
    violation: ProjectViolationDTO;
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

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы идут с 0
    const year = date.getFullYear();
    return `${month}.${year}`;
}

const ViolationCard = ({ violation }: ViolationCardProps) => {
    const [activeTab, setActiveTab] = useState(1);
    const [showMapOverlay, setShowMapOverlay] = useState(false);
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");

    return (
        <div className={styles.card}>
            <div className={styles.tabs}>
                <div
                    onClick={() => setActiveTab(1)}
                    className={clsx(styles.tabItem, { [styles.active]: activeTab === 1 })}
                >
                    О нарушении
                </div>
                <div
                    onClick={() => {
                        worksStore.showViolationComments = true;
                        worksStore.currentViolation = violation;
                    }}
                    className={clsx(styles.tabItem, { [styles.active]: activeTab === 2 })}
                >
                    Комментарии
                </div>
            </div>
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
                    <Link to={`/admin/users/${violation?.author.id}`} className={styles.userName}>
                        {getShortName(splitFullName(violation?.author ?? ""))}
                    </Link>
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
                        <Link
                            key={doc.id}
                            to={`/admin/dictionaries/normative-documents/${doc.id}}`}
                            className={styles.docItem}
                        >
                            <IconDocument />
                            <span style={{ marginTop: 1 }}>{doc.name} </span>
                        </Link>
                    ))}
                </div>
            </div>
            <div className={styles.PhotoBlock}>
                <div>Фотографии, подтверждающие факт нарушения</div>
                {violation.photos.map((photo, index) => (
                    <img className={styles.imgItem} key={index} src={fileUrl(photo.id)} />
                ))}
            </div>
            {showMapOverlay && (
                <Overlay
                    open={showMapOverlay}
                    onClose={() => setShowMapOverlay(false)}
                    title={"Место нарушения"}
                >
                    <div
                        style={{
                            width: 777,
                        }}
                    >
                        <MapEditor
                            readyProp={false}
                            height={"459px"}
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
                    </div>
                </Overlay>
            )}
        </div>
    );
};

export default ViolationCard;
