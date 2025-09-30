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
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

export const OpeningCheckListSections = observer(
    (props: { sections: IChecklistSection[]; finished?: boolean }) => {
        const [collapsed, setCollapsed] = useState(false);

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
                        title={"Акт открытия работ"}
                        size={"large"}
                        checked={props.sections.every((section) =>
                            section.items.every((item) => !!item.answer),
                        )}
                        color={props.finished ? "positive" : "neutral"}
                        disabled={true}
                    />
                </Flex>
                {!collapsed && (
                    <div className={styles.workCardStages}>
                        {props.sections.map((section) => (
                            <>
                                <Typo
                                    variant={"subheadL"}
                                    type={"quaternary"}
                                    mode={"neutral"}
                                    style={{ opacity: 0.6 }}
                                >
                                    {section.orderIndex}. {section.title}
                                </Typo>
                                {section.items.map((item, i) => (
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
                                                title={`${item.itemNumber}. ${item.text}`}
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
                                                        (!accountStore.isContractor &&
                                                            !accountStore.isAdmin)
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
                                        {i !== section.items.length - 1 && (
                                            <Divider
                                                direction={"horizontal"}
                                                type={"tertiary"}
                                                noMargin={true}
                                            />
                                        )}
                                    </>
                                ))}
                            </>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);
