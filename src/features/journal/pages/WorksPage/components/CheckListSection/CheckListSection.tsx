import styles from "./CheckListSection.module.scss";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconArrowUp } from "src/ui/assets/icons";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { IChecklistSection } from "src/features/journal/types/ProjectWork.ts";
import { accountStore, worksStore } from "src/app/AppStore.ts";
import { Divider } from "src/ui/components/atoms/Divider/Divider.tsx";

export const CheckListSection = observer(
    (props: { section: IChecklistSection; finished?: boolean }) => {
        const [collapsed, setCollapsed] = useState(false);

        if (!worksStore.checkListTitles.includes(props.section.title)) {
            return;
        }

        return (
            <div className={styles.card}>
                <Flex gap={12} align={"center"}>
                    <Button
                        mode={"neutral"}
                        type={"outlined"}
                        size={"small"}
                        onClick={() => {
                            setCollapsed(!collapsed);
                        }}
                    >
                        <IconArrowUp
                            style={{
                                transition: "transform 0.1s",
                                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </Button>
                    <Checkbox
                        onChange={() => {}}
                        title={props.section.title
                            .replace("1. ", "")
                            .replace("2. ", "")
                            .replace("3. ", "")
                            .replace("4. ", "")
                            .replace("5. ", "")}
                        size={"large"}
                        checked={props.section.items.every((item) => !!item.answer)}
                        color={props.finished ? "positive" : "neutral"}
                        disabled={true}
                    />
                </Flex>
                <div className={styles.workCardStages}>
                    {props.section.items.map((item, i) => (
                        <>
                            <Flex gap={16} key={i} align={"start"}>
                                <Checkbox
                                    onChange={(checked) => {
                                        item.answer = checked ? "YES" : null;
                                    }}
                                    onClick={() => {
                                        if (item.answer) {
                                            item.answer = null;
                                        }
                                    }}
                                    size={"medium"}
                                    checked={!!item.answer}
                                    intermediate={
                                        item.answer === "NOT_REQUIRED"
                                            ? "minus"
                                            : item.answer === "NO"
                                              ? "plus"
                                              : undefined
                                    }
                                    color={
                                        item.answer === "YES"
                                            ? "positive"
                                            : item.answer === "NO"
                                              ? "negative"
                                              : "neutral"
                                    }
                                    title={item.text}
                                    style={{
                                        flexGrow: 1,
                                        alignItems: "start",
                                        gap: 12,
                                    }}
                                    plusIconRotated={true}
                                    disabled={props.finished}
                                />
                                <Flex
                                    gap={8}
                                    style={{
                                        opacity:
                                            item.answer ||
                                            (!accountStore.isContractor && !accountStore.isAdmin)
                                                ? 0
                                                : 1,
                                    }}
                                >
                                    <Button
                                        size={"tiny"}
                                        type={"outlined"}
                                        mode={"neutral"}
                                        onClick={() => {
                                            item.answer = "NOT_REQUIRED";
                                        }}
                                    >
                                        Не требуется
                                    </Button>
                                    <Button
                                        size={"tiny"}
                                        type={"secondary"}
                                        mode={"negative"}
                                        onClick={() => {
                                            item.answer = "NO";
                                        }}
                                    >
                                        Нет
                                    </Button>
                                </Flex>
                            </Flex>
                            {i !== props.section.items.length - 1 && (
                                <Divider
                                    direction={"horizontal"}
                                    type={"tertiary"}
                                    noMargin={true}
                                />
                            )}
                        </>
                    ))}
                </div>
            </div>
        );
    },
);
