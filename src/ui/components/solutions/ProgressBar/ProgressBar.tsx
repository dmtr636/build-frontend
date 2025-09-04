import styles from "./ProgressBar.module.scss";
import { observer } from "mobx-react-lite";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconClose } from "src/ui/assets/icons";
import { layoutStore } from "src/app/AppStore.ts";

interface Props {
    show: boolean;
    title: string;
    text: string;
    progress: number;
    onCancel: () => void;
}

export const ProgressBar = observer((props: Props) => {
    const isMobile = layoutStore.isMobile;
    return (
        <Overlay
            open={props.show}
            title={
                <>
                    {props.title}
                    <Typo variant={"subheadXL"} type={"primary"}>
                        {props.progress}%
                    </Typo>
                </>
            }
            titleVariant={"subheadXL"}
            titleType={"quaternary"}
            titleMode={"neutral"}
            hideBackdrop={true}
            styles={{
                background: {
                    justifyContent: "end",
                    alignItems: "end",
                    padding: isMobile ? 16 : 40,
                },
            }}
            uploadingOverlay={true}
        >
            <Typo
                variant={"bodyL"}
                type={"tertiary"}
                style={{
                    maxWidth: 326,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {props.text}
            </Typo>
            <Spacing height={8} />
            <Grid gap={8} columns={`${isMobile ? "1fr" : "278px"} auto`}>
                <div className={styles.progressBarContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: (268 * props.progress) / 100 }}
                    />
                </div>
                <Button
                    size={"small"}
                    mode={"neutral"}
                    type={"outlined"}
                    iconBefore={<IconClose />}
                    onClick={props.onCancel}
                />
            </Grid>
        </Overlay>
    );
});
