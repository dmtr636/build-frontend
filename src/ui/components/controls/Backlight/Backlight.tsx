import styles from "./Backlight.module.scss";
import { observer } from "mobx-react-lite";
import { CSSProperties } from "react";

export const Backlight = observer((props: { style?: CSSProperties }) => {
    return <div className={styles.backlight} style={props.style} />;
});
