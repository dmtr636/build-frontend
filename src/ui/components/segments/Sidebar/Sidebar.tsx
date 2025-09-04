import styles from "./Sidebar.module.scss";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { SidebarRoute } from "src/ui/components/segments/Sidebar/Sidebar.types.ts";
import { IconClose, IconCollapse } from "src/ui/assets/icons";
import { clsx } from "clsx";
import { SidebarMenuItem } from "src/ui/components/segments/Sidebar/SidebarMenuItem/SidebarMenuItem.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { sidebarStore } from "src/ui/components/segments/Sidebar/SidebarStore.ts";
import { layoutStore } from "src/app/AppStore.ts";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";

interface SidebarProps {
    logo: ReactNode;
    routes: (SidebarRoute | ReactNode)[];
    footerRoutes?: (SidebarRoute | ReactNode)[];
    footer?: ReactNode;
    footerCollapsed?: ReactNode;
}

export const SIDEBAR_WIDTH = 240;
export const COLLAPSED_SIDEBAR_WIDTH = 68;

export const Sidebar = observer((props: SidebarProps) => {
    const { logo, routes, footerRoutes }: SidebarProps = props;
    const [showSubmenu, setShowSubmenu] = useState(false);
    const [disableHoverEvents, setDisableHoverEvents] = useState(false);
    const collapsed = sidebarStore.collapsed;
    const isMobile = layoutStore.isMobile;
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [sidebarOverflowed, setSidebarOverflowed] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const onClickOutside = () => {
            setDisableHoverEvents(false);
            setShowSubmenu(false);
        };
        document?.addEventListener("click", onClickOutside);
        return () => document?.removeEventListener("click", onClickOutside);
    }, []);

    useEffect(() => {
        if (!isMobile && ready) {
            localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
        }
    }, [collapsed, ready]);

    useEffect(() => {
        const sidebarElement = sidebarRef.current;
        if (!sidebarElement) {
            return;
        }
        const checkOverflow = () => {
            setSidebarOverflowed(sidebarElement.scrollHeight > sidebarElement.offsetHeight);
        };
        checkOverflow();
        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(sidebarElement);
        return () => resizeObserver.unobserve(sidebarElement);
    }, [sidebarRef.current]);

    useEffect(() => {
        setReady(true);
    }, []);

    const sidebarClassName = clsx(styles.sidebar, {
        [styles.collapsed]: collapsed,
        [styles.withSubmenu]: showSubmenu,
        [styles.overflowed]: sidebarOverflowed,
    });

    const sidebarStyle = {
        width: collapsed
            ? `${COLLAPSED_SIDEBAR_WIDTH + (sidebarOverflowed && !isMobile ? getScrollBarWidth() : 0)}px`
            : `${SIDEBAR_WIDTH + (sidebarOverflowed && !isMobile ? getScrollBarWidth() : 0)}px`,
    };

    const renderRoutes = (routes: (SidebarRoute | ReactNode)[]) => {
        return routes.map((route, index) =>
            route && typeof route === "object" && "path" in route ? (
                <SidebarMenuItem
                    route={route}
                    collapsed={collapsed}
                    showSubmenu={showSubmenu}
                    setShowSubmenu={setShowSubmenu}
                    disableHoverEvents={disableHoverEvents}
                    setDisableHoverEvents={setDisableHoverEvents}
                    key={route.path + route.name}
                />
            ) : (
                <Fragment key={index}>{route}</Fragment>
            ),
        );
    };

    return (
        <div className={sidebarClassName} style={sidebarStyle} ref={sidebarRef}>
            {isMobile ? (
                <div className={styles.header}>
                    <ButtonIcon
                        type={"outlined"}
                        mode={"contrast"}
                        onClick={() => (sidebarStore.collapsed = !sidebarStore.collapsed)}
                        className={styles.collapseButton}
                    >
                        <IconClose />
                    </ButtonIcon>
                </div>
            ) : (
                <div className={styles.header}>
                    {!collapsed && (
                        <NavLink to={"/admin"} className={styles.logo}>
                            {logo}
                        </NavLink>
                    )}
                    <ButtonIcon
                        size={"small"}
                        mode={"contrast"}
                        onClick={() => (sidebarStore.collapsed = !sidebarStore.collapsed)}
                        className={styles.collapseButton}
                    >
                        <IconCollapse />
                    </ButtonIcon>
                </div>
            )}
            <div className={clsx(styles.menu, styles.topMenu)}>{renderRoutes(routes)}</div>
            {footerRoutes && !!footerRoutes.length && (
                <div className={styles.footer}>
                    <div className={styles.menu}>{renderRoutes(footerRoutes)}</div>
                </div>
            )}
            {props.footer && props.footerCollapsed && (
                <div
                    className={styles.footerStickyPanel}
                    style={{ marginTop: "auto", position: "sticky", bottom: 0 }}
                >
                    <div className={clsx(styles.menu, styles.bottomMenu)}>
                        {collapsed ? props.footerCollapsed : props.footer}
                    </div>
                </div>
            )}
        </div>
    );
});
