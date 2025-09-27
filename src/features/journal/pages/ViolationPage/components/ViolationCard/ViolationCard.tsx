import { useState } from "react";
import styles from "./violationCard.module.scss";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import { clsx } from "clsx";
import { IconCalendar, IconTime, IconUser } from "src/ui/assets/icons";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Link } from "react-router-dom";
import { splitFullName } from "src/shared/utils/splitFullName.ts";

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

const ViolationCard = ({ violation }: ViolationCardProps) => {
    const [activeTab, setActiveTab] = useState(1);
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
                    onClick={() => setActiveTab(2)}
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
            <div className={styles.text}>{violation.name}</div>
        </div>
    );
};

export default ViolationCard;
