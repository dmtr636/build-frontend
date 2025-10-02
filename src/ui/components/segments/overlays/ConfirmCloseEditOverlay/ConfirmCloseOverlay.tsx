import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import styles from "./ConfirmCloseOverlay.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { layoutStore } from "src/app/AppStore.ts";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";

export const ConfirmCloseOverlay = (props: {
    open: boolean;
    onSave: () => void;
    onClose: () => void;
    onCloseWithoutSave: () => void;
    loading?: boolean;
}) => {
    const isMobile = layoutStore.isMobile;

    return (
        <Overlay
            open={props.open}
            title={"Редактирование"}
            onClose={props.onClose}
            mode={"neutral"}
            actions={
                isMobile
                    ? [
                          <FlexColumn gap={16} key={1}>
                              <Button
                                  key="cancel"
                                  type={"tertiary"}
                                  mode={"neutral"}
                                  onClick={props.onCloseWithoutSave}
                                  fullWidth={true}
                              >
                                  Выйти без сохранения
                              </Button>
                              <Button
                                  key="save"
                                  type={"primary"}
                                  mode={"accent"}
                                  onClick={props.onSave}
                                  loading={props.loading}
                                  fullWidth={true}
                              >
                                  Сохранить
                              </Button>
                          </FlexColumn>,
                      ]
                    : [
                          <Button
                              key="save"
                              type={"primary"}
                              mode={"accent"}
                              onClick={props.onSave}
                              loading={props.loading}
                          >
                              Сохранить
                          </Button>,
                          <Button
                              key="cancel"
                              type={"tertiary"}
                              mode={"neutral"}
                              onClick={props.onCloseWithoutSave}
                          >
                              Выйти без сохранения
                          </Button>,
                      ]
            }
        >
            <Typo variant={"subheadL"} className={styles.subtitle}>
                Изменения не сохранены. Вы уверены, что хотите продолжить?
            </Typo>
        </Overlay>
    );
};
