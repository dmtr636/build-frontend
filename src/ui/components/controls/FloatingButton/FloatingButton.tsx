import { ButtonProps } from "src/ui/components/controls/Button/Button.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { clsx } from "clsx";
import styles from "./FloatingButton.module.scss";
import { CSSProperties } from "react";
import { layoutStore } from "src/app/AppStore.ts";

type FloatingButtonProps = Omit<ButtonProps, "iconBefore" | "iconAfter" | "counter"> & {
    containerStyle?: CSSProperties;
};

export const FloatingButton = (props: FloatingButtonProps) => {
    const isMobile = layoutStore.isMobile;

    return (
        <div className={styles.floatingButtonContainer} style={props.containerStyle}>
            <ButtonIcon
                {...props}
                type={props.type ?? "primary"}
                size={isMobile ? "medium" : "huge"}
                className={clsx(styles.floatingButton, props.className)}
            >
                {props.children}
            </ButtonIcon>
        </div>
    );
};
