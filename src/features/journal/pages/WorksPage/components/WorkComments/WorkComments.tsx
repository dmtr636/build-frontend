import { observer } from "mobx-react-lite";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";
import React, { useLayoutEffect, useMemo } from "react";
import { worksStore } from "src/app/AppStore.ts";
import styles from "./WorkComments.module.scss";
import { IconAttach, IconBarChart, IconError, IconUp } from "src/ui/assets/icons";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import TextArea from "src/ui/components/inputs/Textarea/TextArea.tsx";
import { makeAutoObservable } from "mobx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconBuildArrow } from "src/features/users/components/UserCard/assets";

class VM {
    text = "";

    constructor() {
        makeAutoObservable(this);
    }
}

export const WorkComments = observer(
    (props: { work: ProjectWork; show: boolean; setShow: (show: boolean) => void }) => {
        const vm = useMemo(() => new VM(), [props.work.id]);

        useLayoutEffect(() => {
            if (props.work.id) {
                worksStore.fetchWorkComments(props.work.id);
            }
        }, [props.work.id]);

        const comments = worksStore.workComments;

        return (
            <Overlay
                open={props.show}
                onClose={() => props.setShow(false)}
                title={props.work.name}
                titleNoWrap={true}
                styles={{
                    card: {
                        width: 460,
                    },
                    actions: {
                        padding: 20,
                        borderTop: "1px solid var(--objects-stroke-neutral-tertiary, #E8EAED)",
                        background: "#F9FAFB",
                    },
                }}
                actions={[
                    <div className={styles.footer} key={"1"}>
                        <TextArea
                            value={vm.text}
                            onChange={(event) => (vm.text = event.target.value)}
                            height={150}
                            placeholder={"Введите текст"}
                        />
                        <FlexColumn gap={8}>
                            <Button size={"small"} mode={"neutral"} disabled={!vm.text}>
                                <IconUp />
                            </Button>
                            <Button size={"small"} mode={"neutral"} type={"outlined"}>
                                <IconAttach />
                            </Button>
                        </FlexColumn>
                    </div>,
                ]}
            >
                {!comments.length && !worksStore.loading && (
                    <div className={styles.noUsersInOrg}>
                        <IconError className={styles.icon} />
                        <Typo variant={"actionXL"} type={"secondary"} mode={"neutral"}>
                            Комментариев пока нет
                        </Typo>
                    </div>
                )}
            </Overlay>
        );
    },
);
