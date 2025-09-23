import React from "react";
import styles from "./JournalItemCard.module.scss";
import {
    IconCheckmark,
    IconDote,
    IconFlag,
    IconImage,
    IconInfo,
    IconPin,
    IconTime,
    IconUser,
} from "src/ui/assets/icons";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Link, useNavigate } from "react-router-dom";
import { appStore } from "src/app/AppStore.ts";
import { getFullName } from "src/shared/utils/getFullName.ts";

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы идут с 0
    const year = date.getFullYear();
    return `${month}.${year}`;
}

const JournalItemCard = () => {
    const id = 12345;
    const project = {
        name: "Стройка Центрального района",
        number: "CP-2025-002",
        address: "ул. Ленина, д. 14",
        district: "Центральный",
        latitude: 55.7558,
        longitude: 37.6173,
        responsibleCustomerUserId: "35bd4d27-6493-4324-9c5f-cff2f198ddab",
        responsibleContractorUserId: "bce832a2-3c3c-481d-af38-853d3a186c79",

        contractorOrganizationId: "5267f5d9-6393-4740-97ca-64226dfdd211",

        customerOrganizationId: "019ec5bf-4d76-455f-95ec-4ef39fe04c8c",
        startDate: "2025-10-01",
        endDate: "2026-12-31",
        imageId: null,
    };
    const navigate = useNavigate();
    const customerOrg = appStore.organizationsStore.organizationById(
        project.customerOrganizationId,
    );
    const contractorOrg = appStore.organizationsStore.organizationById(
        project.contractorOrganizationId,
    );
    const customerUser = appStore.userStore.userById(project.responsibleCustomerUserId);
    const contractUser = appStore.userStore.userById(project.responsibleContractorUserId);
    return (
        <div className={styles.container} onClick={() => navigate(`/admin/journal/${id}`)}>
            <div className={styles.img}>
                {project.imageId ? (
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
                    >{`№ ${project.number}`}</Typo>
                </div>
                <div className={styles.location}>
                    <IconPin />
                    <Typo
                        variant={"subheadS"}
                        mode={"accent"}
                    >{`Москва, ${project.district}, ${project.address}, ${project.latitude}, ${project.longitude}`}</Typo>
                </div>
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
                                        <IconFlag />
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Организация
                                    </Typo>
                                </div>
                                <Link
                                    onClick={(event) => event.stopPropagation()}
                                    to={`/admin/organizations/${contractorOrg?.id}`}
                                    className={styles.itemName}
                                >
                                    {customerOrg?.name}
                                </Link>
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
                                        <IconUser />
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Ответственный на объекте
                                    </Typo>
                                </div>
                                <Link
                                    onClick={(event) => event.stopPropagation()}
                                    to={`/admin/users/${customerUser?.id}`}
                                    className={styles.itemName}
                                >
                                    {getFullName(customerUser)}
                                </Link>
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
                                        <IconFlag />
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Организация
                                    </Typo>
                                </div>
                                <Link
                                    onClick={(event) => event.stopPropagation()}
                                    to={`/admin/organizations/${contractorOrg?.id}`}
                                    className={styles.itemName}
                                >
                                    {contractorOrg?.name}
                                </Link>
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
                                        <IconUser />
                                    </div>
                                )}
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <Typo variant={"bodyS"} style={{ opacity: 0.5 }}>
                                        Ответственный на объекте
                                    </Typo>
                                </div>
                                <Link
                                    onClick={(event) => event.stopPropagation()}
                                    to={`/admin/users/${contractUser?.id}`}
                                    className={styles.itemName}
                                >
                                    {getFullName(contractUser)}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBlock}>
                    <div className={styles.footerItem}>
                        <div className={styles.footerItemHead}>Последняя проверка</div>
                        <div className={styles.footerItemText}>
                            <IconCheckmark /> 05.05.2025
                        </div>
                    </div>
                    <div className={styles.footerItem}>
                        <div className={styles.footerItemHead}>Период строительства</div>
                        <div className={styles.footerItemText}>
                            <IconTime />{" "}
                            {`${formatDate(project.startDate)} - ${formatDate(project.endDate)}`}
                        </div>
                    </div>
                    <div className={styles.footerItem}>
                        <div className={styles.footerItemHead}>Тип объекта</div>
                        <div className={styles.footerItemText}>
                            <IconInfo /> Парк
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalItemCard;
