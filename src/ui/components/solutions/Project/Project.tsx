import styles from "./Project.module.scss";
import { ReactNode } from "react";
import { clsx } from "clsx";
import { IconDrag, IconImage, IconLink } from "src/ui/assets/icons";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { NavLink } from "react-router-dom";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface IProps {
    imageUrl?: string | null;
    name: string;
    category?: string | null;
    withoutCategory?: boolean;
    actions: ReactNode[];
    onClick?: () => void;
    href?: string;
    dragMode?: boolean;
    externalUrl?: string;
}

export const Project = (props: IProps) => {
    const renderExternalUrlStatus = () => {
        if (!props.externalUrl) {
            return null;
        }

        const getDomain = () => {
            const splittedUrl = props.externalUrl?.split("://") ?? [];
            return splittedUrl?.pop()?.split("/").shift();
        };

        const domain = getDomain();

        if (!domain) {
            return null;
        }

        return (
            <div className={styles.externalUrlStatus}>
                <Status size={"tiny"} mode={"brand"} iconBefore={<IconLink />}>
                    {domain}
                </Status>
            </div>
        );
    };

    const renderContent = () => {
        return (
            <>
                {props.imageUrl && (
                    <div className={styles.image}>
                        <img src={props.imageUrl} alt={""} />
                        {renderExternalUrlStatus()}
                    </div>
                )}
                {!props.imageUrl && (
                    <div className={styles.imagePlaceholderBg}>
                        <IconImage className={styles.imagePlaceholder} />
                        {renderExternalUrlStatus()}
                    </div>
                )}
                <div className={styles.content}>
                    <TooltipTypo variant={"subheadXL"}>{props.name}</TooltipTypo>
                    {props.category ? (
                        <TooltipTypo variant={"bodyXL"} className={styles.category}>
                            {props.category}
                        </TooltipTypo>
                    ) : (
                        <Typo variant={"bodyXL"} className={styles.category}>
                            Без категории
                        </Typo>
                    )}
                    <div
                        className={styles.actions}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        {props.dragMode ? (
                            <Button
                                iconBefore={<IconDrag />}
                                fullWidth={true}
                                mode={"neutral"}
                                type={"outlined"}
                                style={{ pointerEvents: "none" }}
                            />
                        ) : (
                            props.actions
                        )}
                    </div>
                </div>
            </>
        );
    };

    if (props.href) {
        return (
            <NavLink
                to={props.href}
                className={clsx(styles.container, {
                    [styles.withoutCategory]: props.withoutCategory,
                    [styles.dragMode]: props.dragMode,
                })}
                onClick={props.onClick}
            >
                {renderContent()}
            </NavLink>
        );
    } else {
        return (
            <button
                className={clsx(styles.container, {
                    [styles.withoutCategory]: props.withoutCategory,
                    [styles.dragMode]: props.dragMode,
                })}
                onClick={!props.dragMode ? props.onClick : undefined}
            >
                {renderContent()}
            </button>
        );
    }
};
