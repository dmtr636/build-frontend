import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { ReactNode } from "react";
import styles from "./DeleteOverlay.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { layoutStore } from "src/app/AppStore.ts";

export const DeleteOverlay = (props: {
    open: boolean;
    title: string;
    subtitle: string;
    info?: ReactNode;
    deleteButtonLabel: string;
    onDelete: () => void;
    onCancel: () => void;
    loading?: boolean;
}) => {
    const isMobile = layoutStore.isMobile;

    return (
        <Overlay
            open={props.open}
            title={props.title}
            mode={"negative"}
            onClose={props.onCancel}
            actions={
                isMobile
                    ? [
                          <FlexColumn gap={16} key={1}>
                              <Button
                                  key="cancel"
                                  type={"tertiary"}
                                  mode={"neutral"}
                                  onClick={props.onCancel}
                                  fullWidth={true}
                              >
                                  Отмена
                              </Button>
                              <Button
                                  key="delete"
                                  type={"primary"}
                                  mode={"negative"}
                                  onClick={props.onDelete}
                                  loading={props.loading}
                                  fullWidth={true}
                              >
                                  {props.deleteButtonLabel}
                              </Button>
                          </FlexColumn>,
                      ]
                    : [
                          <Button
                              key="delete"
                              type={"primary"}
                              mode={"negative"}
                              onClick={props.onDelete}
                              loading={props.loading}
                          >
                              {props.deleteButtonLabel}
                          </Button>,
                          <Button
                              key="cancel"
                              type={"tertiary"}
                              mode={"neutral"}
                              onClick={props.onCancel}
                          >
                              Отмена
                          </Button>,
                      ]
            }
            styles={{
                card: {
                    width: 456,
                },
            }}
        >
            <Typo
                variant={"subheadL"}
                className={styles.subtitle}
                mode={"neutral"}
                type={"quaternary"}
            >
                {props.subtitle}
            </Typo>
            {props.info && (
                <div className={styles.info}>
                    <TooltipTypo variant={"actionXL"}>{props.info}</TooltipTypo>
                </div>
            )}
        </Overlay>
    );
};
