import styles from "./Drawer.module.scss";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconClose } from "src/ui/assets/icons";
import { Tab, Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: (onClose: () => void) => ReactNode[];
    tabs?: Tab[];
    closeOnBackdropClick?: boolean;
}

export const DRAWER_CONTAINER_ID = "DRAWER_CONTAINER";

export const Drawer = (props: DrawerProps) => {
    const { open, onClose, title, children, actions, tabs, closeOnBackdropClick }: DrawerProps =
        props;
    const [closing, setClosing] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.value);

    const handleClose = () => {
        setClosing(true);
    };

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className={clsx(styles.background, { [styles.closing]: closing })}
            onClick={(event) => {
                if (event.target === event.currentTarget && closeOnBackdropClick) {
                    handleClose();
                }
            }}
        >
            <div
                id={DRAWER_CONTAINER_ID}
                className={clsx(styles.drawer, {
                    [styles.closing]: closing,
                })}
                onAnimationEnd={(event) => {
                    if (event.animationName === styles.drawerExitAnim) {
                        onClose?.();
                        setClosing(false);
                    }
                }}
            >
                <div className={clsx(styles.header, { [styles.withTabs]: !!tabs?.length })}>
                    <div className={styles.titleRow}>
                        <Typo variant={"h4"} className={styles.title}>
                            {title}
                        </Typo>
                        <ButtonIcon
                            className={styles.closeIcon}
                            onClick={handleClose}
                            type={"outlined"}
                            mode={"neutral"}
                            size={"small"}
                        >
                            <IconClose />
                        </ButtonIcon>
                    </div>
                    {!!tabs?.length && activeTab && (
                        <div className={styles.tabs}>
                            <Tabs
                                tabs={tabs}
                                value={activeTab}
                                onChange={setActiveTab}
                                size={"large"}
                            />
                        </div>
                    )}
                </div>
                <div className={styles.content}>{children}</div>
                <div className={styles.actions}>
                    {actions?.(() => handleClose())?.map((action, index) => (
                        <div key={index}>{action}</div>
                    ))}
                </div>
            </div>
        </div>,
        document.body,
    );
};
