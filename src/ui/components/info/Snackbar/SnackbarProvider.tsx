import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createPortal } from "react-dom";
import styles from "./SnackbarProvider.module.scss";
import { SnackbarData, snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Snackbar } from "src/ui/components/info/Snackbar/Snackbar.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconClose } from "src/ui/assets/icons";
import { sidebarStore } from "src/ui/components/segments/Sidebar/SidebarStore.ts";
import { layoutStore } from "src/app/AppStore.ts";

export const DEFAULT_SNACKBAR_DELAY_MS = 2500;
export const DEFAULT_SNACKBAR_EXIT_ANIMATION_DURATION_MS = 200;

const SnackbarWithTimer = observer(({ snackbar }: { snackbar: SnackbarData }) => {
    useEffect(() => {
        const exitTimer = setTimeout(
            () => {
                snackbar.removing = true;
            },
            (snackbar.delayMs ?? DEFAULT_SNACKBAR_DELAY_MS) -
                DEFAULT_SNACKBAR_EXIT_ANIMATION_DURATION_MS,
        );
        const removeTimer = setTimeout(() => {
            snackbarStore.remove(snackbar.id);
        }, snackbar.delayMs ?? DEFAULT_SNACKBAR_DELAY_MS);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [snackbar]);

    const getActions = () => {
        const actions = [];
        if (snackbar.actionButtonLabel) {
            actions.push(
                <Button
                    key="actionButton"
                    mode={snackbar.mode === "neutral" ? "contrast" : snackbar.mode}
                    size="small"
                    onClick={(event) => {
                        event.stopPropagation();
                        snackbar.onActionButtonClick?.();
                        snackbarStore.remove(snackbar.id);
                    }}
                >
                    {snackbar.actionButtonLabel}
                </Button>,
            );
        }
        if (snackbar.showCloseButton) {
            actions.push(
                <ButtonIcon
                    type="tertiary"
                    key="closeButton"
                    mode={snackbar.mode === "neutral" ? "contrast" : snackbar.mode}
                    size="small"
                    onClick={() => snackbarStore.remove(snackbar.id)}
                >
                    <IconClose />
                </ButtonIcon>,
            );
        }
        return actions;
    };

    return (
        <Snackbar
            mode={snackbar.mode}
            onClick={() => snackbarStore.remove(snackbar.id)}
            actions={getActions()}
            icon={snackbar.icon}
            removing={snackbar.removing}
            delayMs={snackbar.delayMs}
            isFirst={!snackbar.removing}
        >
            {snackbar.message}
        </Snackbar>
    );
});

export const SnackbarProvider = observer((props: { centered?: boolean }) => {
    const isMobile = layoutStore.isMobile;

    if (!snackbarStore.count) {
        return null;
    }

    return createPortal(
        <div
            className={styles.container}
            style={{
                left: isMobile ? 16 : sidebarStore.collapsed ? 116 : 280,
                right: isMobile
                    ? 16
                    : props.centered
                      ? sidebarStore.collapsed
                          ? 116
                          : 280
                      : undefined,
            }}
        >
            {snackbarStore.snackbars.map((snackbar) => (
                <SnackbarWithTimer key={snackbar.id} snackbar={snackbar} />
            ))}
        </div>,
        document.body,
    );
});
