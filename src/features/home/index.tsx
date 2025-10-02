import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";
import { accountStore, appStore, layoutStore, objectStore, worksStore } from "src/app/AppStore.ts";
import styles from "./home.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { fileUrl } from "src/shared/utils/file.ts";
import { formatObjNumber } from "src/shared/utils/formatObjNumber.ts";
import { IconError, IconImage, IconNewInset } from "src/ui/assets/icons";
import { useEffect, useLayoutEffect, useState } from "react";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";

export const HomePage = observer(() => {
    const currentUser = appStore.accountStore.currentUser;
    const allObjects = objectStore.objects;
    const currentobjects = appStore.objectStore.getObjectsByUserId(currentUser?.id ?? "");
    const objects = accountStore.isAdmin ? allObjects : currentobjects;
    const navigate = useNavigate();
    const objectsIdList = currentobjects.map((item) => item.id);
    useEffect(() => {
        worksStore.fetchAllWorks();
    }, []);
    const allWorkList: ProjectWork[] = worksStore.allWorks;
    const userworks = allWorkList
        .filter((item) => objectsIdList.includes(item.projectId))
        .filter((i) => i.status !== "DONE");
    if (!currentobjects) return null;
    const isMobile = layoutStore.isMobile;
    useLayoutEffect(() => {
        if (isMobile) {
            navigate("/admin/journal");
        }
    }, [isMobile]);
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Главная – Build</title>
            </Helmet>

            <div className={styles.itemForm}>
                <div className={styles.itemHead}>
                    {accountStore.isAdmin ? "Объекты" : "Мои объекты"}{" "}
                    <Link className={styles.itemLink} to="/admin/journal">
                        Перейти
                    </Link>
                </div>

                <div className={styles.bodyItemLeft}>
                    {objects.length > 0 ? (
                        objects.map((obj) => (
                            <div
                                className={styles.objCard}
                                key={obj.id}
                                onClick={() => navigate(`/admin/journal/${obj.id}`)}
                            >
                                {obj.imageId ? (
                                    <img src={fileUrl(obj.imageId)} className={styles.objImg} />
                                ) : (
                                    <div className={styles.noImg}>
                                        <IconImage />
                                    </div>
                                )}
                                <div className={styles.obj}>
                                    <div className={styles.objname}>{obj.name}</div>
                                    <div className={styles.objNumber}>
                                        № {formatObjNumber(obj.objectNumber)}
                                    </div>
                                </div>
                                <div className={styles.link}>
                                    <IconNewInset />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noItems}>
                            <IconError />
                            Пока нет объектов, над <br /> которыми вы работаете
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.itemForm}>
                <div className={styles.itemHead}>Работа</div>
                <div className={styles.bodyItemLeft}>
                    {userworks?.length > 0 ? (
                        userworks.map((item, index) => (
                            <div
                                key={index}
                                className={styles.workList}
                                onClick={() => navigate(`/admin/journal/${item.projectId}/status`)}
                            >
                                <span className={styles.workText}>{item.name}</span>
                                <div className={styles.link}>
                                    <IconNewInset />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noItems}>
                            <IconError />
                            Пока нет работ
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
