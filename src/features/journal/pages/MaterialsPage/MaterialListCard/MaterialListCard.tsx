import React, { useRef } from "react";
import styles from "./MaterialListCard.module.scss";
import { IconClose, IconFlag, IconNext } from "src/ui/assets/icons";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { numDecl } from "src/shared/utils/numDecl.ts";
import { Material } from "src/features/journal/pages/MaterialsPage/Material.ts";
import { IconBrickPerspective } from "src/features/journal/pages/MaterialsPage/assets";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { formatDate, formatTime } from "src/shared/utils/date.ts";
import { layoutStore } from "src/app/AppStore.ts";

interface UserItemCardProps {
    onClick?: () => void;
    isOpen?: boolean;
    material: Material;
}

const MaterialListCard = observer(({ onClick, isOpen, material }: UserItemCardProps) => {
    const ref = useRef<HTMLDivElement | null>(null);

    function handleCard(event: React.MouseEvent<HTMLDivElement>) {
        if (ref.current && !ref.current.contains(event.target as Node) && onClick) {
            onClick();
        }
        if (!ref.current && onClick) {
            onClick();
        }
    }

    const isMobile = layoutStore.isMobile;
    return (
        <div
            className={clsx(styles.container, { [styles.isOpen]: isOpen && !isMobile })}
            onClick={handleCard}
        >
            <div className={styles.imgBlock}>
                <IconBrickPerspective />
            </div>
            <div className={clsx(styles.infoBlock)}>
                <div
                    style={{
                        display: "flex",
                    }}
                >
                    {material.waybill.laboratoryAnalysisRequired && (
                        <div className={styles.laboratoryBadge}>Нужен лабораторный анализ</div>
                    )}
                </div>
                <Tooltip text={material?.waybill.materialName} requireOverflow={true}>
                    <div className={styles.name}>
                        {material?.waybill.materialName}
                        {material.waybill.volume && ", "}
                        {material.waybill.volume && (
                            <span
                                style={{
                                    color: "var(--objects-text-neutral-quaternary, #5F6A81)",
                                }}
                            >
                                {material.waybill.volume} м
                                <sup
                                    style={{
                                        marginTop: -10,
                                        display: "inline-block",
                                        translate: "0 3px",
                                    }}
                                >
                                    3
                                </sup>
                            </span>
                        )}
                    </div>
                </Tooltip>
                {(material.waybill.deliveryDateTime || material.waybill.invoiceNumber) && (
                    <div className={styles.otherInfo}>
                        {material.waybill.deliveryDateTime && (
                            <Typo variant={"bodyL"} type={"tertiary"} mode={"neutral"}>
                                {formatDate(material.waybill.deliveryDateTime)} /{" "}
                                {formatTime(material.waybill.deliveryDateTime)}
                            </Typo>
                        )}
                        {material.waybill.deliveryDateTime && material.waybill.invoiceNumber && (
                            <div
                                style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 4,
                                    backgroundColor: "#B0B0B0",
                                }}
                            />
                        )}
                        {material.waybill.invoiceNumber && (
                            <Typo variant={"bodyL"} type={"tertiary"} mode={"neutral"}>
                                №{material.waybill.invoiceNumber}
                            </Typo>
                        )}
                    </div>
                )}
            </div>
            {!isMobile && (
                <div className={styles.buttonsBlock}>
                    <Tooltip text={isOpen ? "Закрыть" : "Открыть"}>
                        <div className={styles.icon}>{isOpen ? <IconClose /> : <IconNext />}</div>
                    </Tooltip>
                </div>
            )}
        </div>
    );
});

export default MaterialListCard;
