import styles from "./Header.module.scss";
import { Fragment, ReactNode, useState } from "react";
import { IconBack, IconBurger } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { layoutStore } from "src/app/AppStore.ts";
import { observer } from "mobx-react-lite";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { sidebarStore } from "src/ui/components/segments/Sidebar/SidebarStore.ts";

export interface HeaderProps {
    title: ReactNode;
    notification?: ReactNode;
    avatar?: ReactNode;
    actions?: ReactNode[];
    titleRowActions?: ReactNode[];
    titleStatus?: ReactNode;
    onBack?: () => void;
    sticky?: boolean;
    scrolling?: boolean;
    scrollingToTop?: boolean;
}

export const Header = observer((props: HeaderProps) => {
    const { title, notification, avatar, actions, onBack, sticky, titleRowActions }: HeaderProps =
        props;
    const [scrollbarWidth] = useState(() => getScrollBarWidth());
    const isMobile = layoutStore.isMobile;

    return (
        <>
            <div
                className={clsx(styles.header, {
                    [styles.scrolling]: props.scrolling,
                    [styles.scrollingToTop]: props.scrollingToTop,
                })}
                style={{
                    marginRight: `-${scrollbarWidth}px`,
                }}
            >
                <div className={styles.titleRow}>
                    <div className={styles.title} style={{ maxWidth: "67%" }}>
                        {onBack && !isMobile && (
                            <ButtonIcon
                                className={styles.backButton}
                                type={"outlined"}
                                mode={"neutral"}
                                onClick={onBack}
                            >
                                <IconBack />
                            </ButtonIcon>
                        )}
                        {isMobile && (
                            <Button
                                iconBefore={<IconBurger />}
                                mode={"neutral"}
                                onClick={() => {
                                    sidebarStore.collapsed = !sidebarStore.collapsed;
                                }}
                            />
                        )}
                        <TooltipTypo variant={isMobile ? "actionL" : "h4"}>{title}</TooltipTypo>
                        {props.titleStatus && (
                            <div className={styles.titleStatus}>{props.titleStatus}</div>
                        )}
                    </div>
                    <div className={styles.titleRowActions}>
                        {titleRowActions?.map((action, index) => (
                            <Fragment key={index}>{action}</Fragment>
                        ))}
                        {notification}
                        {avatar}
                    </div>
                </div>
            </div>
            {!!actions?.length && (
                <div
                    className={clsx(styles.secondHeader, {
                        [styles.scrolling]: props.scrolling,
                        [styles.scrollingToTop]: props.scrollingToTop,
                    })}
                    style={{
                        marginRight: `-${scrollbarWidth}px`,
                    }}
                >
                    <div className={styles.actionsRow}>
                        {actions?.map((action, index) => <Fragment key={index}>{action}</Fragment>)}
                    </div>
                </div>
            )}
        </>
    );
});
