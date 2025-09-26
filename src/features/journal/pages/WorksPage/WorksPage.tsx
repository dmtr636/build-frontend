import { observer } from "mobx-react-lite";
import styles from "./WorksPage.module.scss";
import { IconBarChart, IconPlus, IconSuccess } from "src/ui/assets/icons";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { appStore, objectStore, worksStore } from "src/app/AppStore.ts";
import { makeAutoObservable } from "mobx";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import {
    IconBuildClock,
    IconHardware,
} from "src/features/journal/components/JournalItemCard/assets";
import { icon } from "leaflet";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { formatDate } from "src/shared/utils/date.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { clsx } from "clsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";

class VM {
    form: ObjectDTO | null = null;
    tab = "works";

    constructor() {
        makeAutoObservable(this);
    }
}

export const WorksPage = observer(() => {
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");
    const vm = useMemo(() => new VM(), []);

    useLayoutEffect(() => {
        if (currentObj) {
            vm.form = deepCopy(currentObj);
            worksStore.fetchWorks(currentObj.id);
        } else {
            vm.form = null;
        }
    }, [currentObj]);

    const statusOptions: SelectOption<string>[] = [
        { name: "Ожидание", value: "AWAIT", listItemIcon: <IconBuildClock /> },
        {
            name: "Стройка",
            value: "IN_PROGRESS",
            listItemIcon: <IconHardware />,
        },
        { name: "Завершён", value: "COMPLETE", listItemIcon: <IconSuccess /> },
    ];

    const showSaveButton = !deepEquals(vm.form, currentObj);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconBarChart />
                </div>
                Состав работ
            </div>
            <div className={styles.grid}>
                <div className={styles.leftCol}>
                    <div className={styles.leftColCard}>
                        <Select
                            options={statusOptions}
                            value={vm.form?.status}
                            formName={"Статус"}
                            onValueChange={(value) => {
                                if (value && vm.form) {
                                    vm.form.status = value;
                                }
                            }}
                            disableClear={true}
                        />
                        <div className={styles.periodsCol}>
                            <div className={styles.periodCard}>
                                <Typo variant={"subheadM"} type={"quaternary"} mode={"neutral"}>
                                    Плановое начало работ
                                </Typo>
                                <Typo variant={"bodyM"}>
                                    {formatDate(vm.form?.plannedPeriod?.start ?? "") || "-"}
                                </Typo>
                            </div>
                        </div>
                        <div className={styles.periodCard}>
                            <Typo variant={"subheadM"} type={"quaternary"} mode={"neutral"}>
                                Плановое завершение
                            </Typo>
                            <Typo variant={"bodyM"}>
                                {formatDate(vm.form?.plannedPeriod?.end ?? "") || "-"}
                            </Typo>
                        </div>
                    </div>
                    <div className={styles.leftColCard}>
                        <Select
                            options={[
                                {
                                    name: "26.09.2025",
                                    value: "26.09.2025",
                                },
                            ]}
                            value={"26.09.2025"}
                            formName={"Версия графика"}
                            size={"large"}
                            onValueChange={(value) => {
                                console.log(value);
                            }}
                            disableClear={true}
                        />
                    </div>
                    <Alert
                        mode={"positive"}
                        icon={<IconSuccess />}
                        title={"Срок в работах соответствует планам"}
                        subtitle={
                            "Планируется, что объект будет готов к сроку планового завершения"
                        }
                    />
                </div>
                <div className={styles.tasksArea}>
                    <div className={styles.tasksAreaHeader}>
                        <div
                            className={styles.tasksAreaHeaderTab}
                            onClick={() => {
                                vm.tab = "works";
                            }}
                        >
                            <Typo
                                variant={"h5"}
                                className={clsx(styles.text, vm.tab === "works" && styles.active)}
                            >
                                Работы
                            </Typo>
                            <Button
                                iconBefore={<IconPlus />}
                                size={"small"}
                                mode={"neutral"}
                                type={"primary"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                            />
                        </div>
                        <div
                            className={styles.tasksAreaHeaderTab}
                            onClick={() => {
                                vm.tab = "checklists";
                            }}
                        >
                            <Typo
                                variant={"h5"}
                                className={clsx(
                                    styles.text,
                                    vm.tab === "checklists" && styles.active,
                                )}
                            >
                                Чек-листы
                            </Typo>
                            <Counter value={3} mode={"neutral"} size={"medium"} />
                        </div>
                    </div>
                </div>
            </div>
            {showSaveButton && currentObj && (
                <div className={styles.footer}>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Button
                            mode={"neutral"}
                            type={"outlined"}
                            onClick={() => {
                                if (currentObj) {
                                    vm.form = deepCopy(currentObj);
                                }
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            mode={"neutral"}
                            type={"primary"}
                            onClick={async () => {
                                if (currentObj && vm.form) {
                                    currentObj.status = vm.form?.status;
                                    await objectStore.updateObject(currentObj);
                                    snackbarStore.showNeutralPositiveSnackbar(
                                        "Изменения сохранены",
                                    );
                                }
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
});
