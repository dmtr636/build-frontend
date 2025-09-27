import { observer } from "mobx-react-lite";
import styles from "./WorksPage.module.scss";
import {
    IconArrowUp,
    IconBarChart,
    IconClose,
    IconEdit,
    IconPlus,
    IconSuccess,
} from "src/ui/assets/icons";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { appStore, objectStore, registryStore, worksStore } from "src/app/AppStore.ts";
import { makeAutoObservable } from "mobx";
import { ObjectDTO } from "src/features/journal/types/Object.ts";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import {
    IconBuildClock,
    IconHardware,
} from "src/features/journal/components/JournalItemCard/assets";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { formatDate } from "src/shared/utils/date.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { clsx } from "clsx";
import { Counter } from "src/ui/components/info/Counter/Counter.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { ProjectWork, ProjectWorkStage } from "src/features/journal/types/ProjectWork.ts";
import { Flex } from "src/ui/components/atoms/Flex/Flex";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import CircularProgress from "src/features/journal/pages/WorksPage/components/CircularProgress.tsx";
import { Divider } from "src/ui/components/atoms/Divider/Divider.tsx";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";

class VM {
    form: ObjectDTO | null = null;
    tab = "works";
    showAddOverlay = false;
    showEditOverlay = false;
    editingWork: ProjectWork | null = null;
    editForm: ProjectWork | null = null;
    addForm: Partial<ProjectWork> = {};
    addFormUnit = "";

    constructor() {
        makeAutoObservable(this);
    }

    get workOptions() {
        const names = registryStore.works.map((work) => work.name);
        const set = new Set(names);
        if (this.addForm.name) {
            set.add(this.addForm.name);
        }
        return [...set].map((name) => ({
            name: name,
            value: name,
        }));
    }
}

const unitMap: Record<string, string> = {
    "Квадратный метр": "кв.м",
    "Погонный метр": "п.м",
    Штука: "шт",
};

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

    useEffect(() => {
        if (!vm.addForm.name) {
            return;
        }
        const workFromRegistry = registryStore.worksNameMap.get(vm.addForm.name ?? "");
        if (workFromRegistry) {
            registryStore.fetchStages(workFromRegistry.id).then(() => {
                if (registryStore.workStages?.length) {
                    vm.addForm.stages = registryStore.workStages.map((stage) => ({
                        id: crypto.randomUUID(),
                        name: stage.stageName,
                        status: "IN_PROGRESS",
                        orderNumber: stage.stageNumber,
                        date: null,
                    }));
                } else {
                    vm.addForm.stages = [];
                }
            });
        }
    }, [vm.addForm.name]);

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

    const tasksAreaContentRef = useRef<HTMLDivElement | null>(null);
    const [showGradient, setShowGradient] = useState(false);

    useEffect(() => {
        if (tasksAreaContentRef.current) {
            setShowGradient(
                tasksAreaContentRef.current.scrollHeight >
                    tasksAreaContentRef.current.clientHeight &&
                    tasksAreaContentRef.current.scrollTop <
                        tasksAreaContentRef.current.scrollHeight -
                            tasksAreaContentRef.current.clientHeight,
            );
        }
    }, [tasksAreaContentRef]);

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
                            options={worksStore.workVersions.map((version) => ({
                                name: formatDate(version.createdAt),
                                value: version.versionNumber,
                            }))}
                            value={worksStore.currentWorkVersion}
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
                                    vm.addForm = {};
                                    vm.addForm.workVersion = {
                                        workId: "",
                                        active: true,
                                        startDate: "",
                                        endDate: "",
                                        versionNumber: 1,
                                        createdAt: "",
                                    };
                                    vm.addForm.projectId = currentObj?.id ?? "";
                                    vm.showAddOverlay = true;
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
                    <div
                        className={styles.tasksAreaContent}
                        ref={tasksAreaContentRef}
                        onScroll={() => {
                            if (!tasksAreaContentRef.current) {
                                return;
                            }
                            setShowGradient(
                                tasksAreaContentRef.current.scrollHeight >
                                    tasksAreaContentRef.current.clientHeight &&
                                    tasksAreaContentRef.current.scrollTop <
                                        tasksAreaContentRef.current.scrollHeight -
                                            tasksAreaContentRef.current.clientHeight,
                            );
                        }}
                    >
                        {!!worksStore.worksFormOnCheck.length && (
                            <Typo
                                variant={"subheadM"}
                                type={"tertiary"}
                                mode={"neutral"}
                                style={{ marginBottom: 8, marginTop: 16 }}
                            >
                                На проверке у службы строительного контроля
                            </Typo>
                        )}
                        {!!worksStore.worksFormOnCheck.length && (
                            <FlexColumn gap={20}>
                                {worksStore.worksFormOnCheck.map((item) => (
                                    <WorkCard work={item} key={item.id} vm={vm} />
                                ))}
                            </FlexColumn>
                        )}
                        {!!worksStore.worksFormInProgress.length && (
                            <Typo
                                variant={"subheadM"}
                                type={"tertiary"}
                                mode={"neutral"}
                                style={{ marginBottom: 8, marginTop: 16 }}
                            >
                                В процессе
                            </Typo>
                        )}
                        {!!worksStore.worksFormInProgress.length && (
                            <FlexColumn gap={20}>
                                {worksStore.worksFormInProgress.map((item) => (
                                    <WorkCard work={item} key={item.id} vm={vm} />
                                ))}
                            </FlexColumn>
                        )}
                        {!!worksStore.finishedWorksForm.length && (
                            <Typo
                                variant={"subheadM"}
                                type={"tertiary"}
                                mode={"neutral"}
                                style={{ marginBottom: 8, marginTop: 16 }}
                            >
                                Завершённые
                            </Typo>
                        )}
                        {!!worksStore.finishedWorksForm.length && (
                            <FlexColumn gap={20}>
                                {worksStore.finishedWorksForm.map((item) => (
                                    <WorkCard work={item} key={item.id} vm={vm} />
                                ))}
                            </FlexColumn>
                        )}
                    </div>
                    {showGradient && <div className={styles.gradient} />}
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
            {vm.showAddOverlay && (
                <Overlay
                    title={"Добавить работу"}
                    open={vm.showAddOverlay}
                    onClose={() => (vm.showAddOverlay = false)}
                    actions={[
                        <Flex justify={"end"} gap={16} key={"0"}>
                            <Button
                                mode={"neutral"}
                                type={"secondary"}
                                onClick={() => {
                                    vm.showAddOverlay = false;
                                    vm.addForm = {};
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                loading={worksStore.loading}
                                disabled={
                                    !vm.addForm.name ||
                                    !vm.addForm.plannedVolume ||
                                    !vm.addForm.workVersion?.startDate ||
                                    !vm.addForm.workVersion.endDate
                                }
                                mode={"neutral"}
                                type={"primary"}
                                onClick={async () => {
                                    vm.addForm.stages = vm.addForm.stages?.filter(
                                        (stage) => !!stage.name,
                                    );
                                    vm.addForm.stages?.forEach((stage, index) => {
                                        stage.orderNumber = index + 1;
                                    });
                                    const result = await worksStore.createWork(vm.addForm);
                                    if (result) {
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Работа добавлена",
                                        );
                                        vm.showAddOverlay = false;
                                    }
                                }}
                            >
                                Добавить
                            </Button>
                        </Flex>,
                    ]}
                    styles={{
                        card: {
                            width: 564,
                        },
                    }}
                >
                    <FlexColumn gap={16}>
                        <Autocomplete
                            options={vm.workOptions}
                            value={vm.addForm?.name}
                            onValueChange={(value) => {
                                const workFromRegistry = registryStore.worksNameMap.get(
                                    value ?? "",
                                );
                                if (workFromRegistry) {
                                    vm.addFormUnit = workFromRegistry.unit ?? "";
                                } else {
                                    vm.addFormUnit = "";
                                }
                                vm.addForm.name = value || undefined;
                            }}
                            size={"large"}
                            addButtonLabel={"Добавить"}
                            onAddButtonClick={(value) => {
                                vm.addForm.name = value;
                            }}
                            zIndex={100}
                            placeholder={"Введите или выберите из списка"}
                            formName={"Наименование работы"}
                            required={true}
                        />
                        <Input
                            onChange={(event) => {
                                vm.addForm.plannedVolume = event.target.value
                                    ? Number(event.target.value)
                                    : undefined;
                            }}
                            value={vm.addForm.plannedVolume ?? ""}
                            size={"large"}
                            placeholder={"Введите число"}
                            formName={`План${vm.addFormUnit ? ` (${unitMap[vm.addFormUnit] || vm.addFormUnit.toLowerCase()})` : ""}`}
                            number={true}
                            required={true}
                        />
                        {!!registryStore.workStages?.length &&
                            registryStore.worksNameMap.has(vm.addForm.name ?? "") && (
                                <div className={styles.stages}>
                                    <Typo variant={"subheadXL"}>Этапы</Typo>
                                    {vm.addForm.stages?.map((stage) => (
                                        <WorkStageRow
                                            key={stage.id}
                                            workStage={stage}
                                            onDelete={() => {
                                                vm.addForm.stages = vm.addForm.stages?.filter(
                                                    (_stage) => _stage.id !== stage.id,
                                                );
                                                vm.addForm.stages?.forEach((stage, index) => {
                                                    stage.orderNumber = index + 1;
                                                });
                                            }}
                                        />
                                    ))}
                                    <div>
                                        <Button
                                            type={"text"}
                                            iconBefore={<IconPlus />}
                                            onClick={() => {
                                                if (!vm.addForm.stages) {
                                                    vm.addForm.stages = [];
                                                }
                                                vm.addForm.stages?.push({
                                                    id: crypto.randomUUID(),
                                                    orderNumber: vm.addForm.stages.length + 1,
                                                    name: "",
                                                    date: null,
                                                    status: "IN_PROGRESS",
                                                });
                                            }}
                                        >
                                            Добавить этап
                                        </Button>
                                    </div>
                                </div>
                            )}
                        <Grid gap={16} columns={"1fr 1fr"}>
                            <DatePicker
                                value={vm.addForm.workVersion?.startDate ?? null}
                                onChange={(value) => {
                                    if (!vm.addForm.workVersion) {
                                        return;
                                    }
                                    vm.addForm.workVersion.startDate = value ?? "";
                                }}
                                disableTime={true}
                                size={"large"}
                                formName={"Начало исполнения"}
                                width={242}
                                zIndex={100}
                                required={true}
                            />
                            <DatePicker
                                value={vm.addForm.workVersion?.endDate ?? null}
                                onChange={(value) => {
                                    if (!vm.addForm.workVersion) {
                                        return;
                                    }
                                    vm.addForm.workVersion.endDate = value ?? "";
                                }}
                                disableTime={true}
                                size={"large"}
                                formName={"Завершение"}
                                width={242}
                                zIndex={100}
                                required={true}
                            />
                        </Grid>
                    </FlexColumn>
                </Overlay>
            )}
        </div>
    );
});

export const WorkStageRow = observer(
    (props: { workStage: ProjectWorkStage; onDelete: () => void }) => {
        return (
            <Grid columns={"12px 1fr auto"} gap={12} align={"center"}>
                <Typo
                    variant={"actionL"}
                    style={{
                        textAlign: "center",
                    }}
                >
                    {props.workStage.orderNumber}
                </Typo>
                <Input
                    onChange={(event) => {
                        props.workStage.name = event.target.value;
                    }}
                    value={props.workStage.name}
                    placeholder={"Введите описание этапа"}
                />
                <Tooltip header={"Удалить этап"} delay={500}>
                    <Button
                        type={"outlined"}
                        mode={"neutral"}
                        iconBefore={<IconClose />}
                        onClick={props.onDelete}
                    />
                </Tooltip>
            </Grid>
        );
    },
);

export const WorkCard = observer((props: { work: ProjectWork; vm: VM }) => {
    const [collapsed, setCollapsed] = useState(false);

    const progressStages = props.work.stages.filter((stage) => stage.status !== "FINISHED");
    const finishedStages = props.work.stages.filter((stage) => stage.status === "FINISHED");

    const renderStage = (stage: ProjectWorkStage, index: number, stages: ProjectWorkStage[]) => {
        return (
            <FlexColumn gap={16}>
                <Checkbox
                    onChange={(checked) => {
                        if (checked) {
                            stage.status = "READY_TO_CHECK";
                        } else {
                            stage.status = "IN_PROGRESS";
                        }
                    }}
                    size={"medium"}
                    checked={stage.status !== "IN_PROGRESS"}
                    title={stage.name}
                    disabled={props.work.status === "ON_CHECK" || props.work.status === "FINISHED"}
                />
                {index !== stages.length - 1 && (
                    <Divider
                        direction={"horizontal"}
                        type={"tertiary"}
                        noMargin={true}
                        style={{
                            marginBottom: 16,
                        }}
                    />
                )}
            </FlexColumn>
        );
    };

    const workVersion =
        props.work.workVersions[
            Math.min(worksStore.currentWorkVersion, props.work.workVersions.length) - 1
        ];

    return (
        <div className={styles.workCard}>
            <div
                className={styles.workCardHeader}
                style={{
                    gridTemplateColumns:
                        !!progressStages.length || !!finishedStages.length
                            ? "auto 1fr auto"
                            : "1fr auto",
                }}
            >
                {(!!progressStages.length || !!finishedStages.length) && (
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
                )}
                <Checkbox
                    onChange={(checked) => {
                        if (checked) {
                            props.work.status = "READY_TO_CHECK";
                        } else {
                            props.work.status = "IN_PROGRESS";
                        }
                    }}
                    title={props.work.name}
                    size={"large"}
                    checked={props.work.status !== "IN_PROGRESS"}
                    disabled={
                        props.work.stages.some(
                            (stage) =>
                                stage.status === "IN_PROGRESS" || stage.status === "ON_CHECK",
                        ) ||
                        props.work.status === "ON_CHECK" ||
                        props.work.status === "FINISHED"
                    }
                    style={
                        {
                            // pointerEvents: props.work.status === "IN_PROGRESS" ? undefined : "none",
                        }
                    }
                />
                <Flex gap={8} align={"center"}>
                    <CircularProgress value={props.work.completionPercent} />
                    <Typo variant={"subheadM"}>{props.work.completionPercent}%</Typo>
                </Flex>
            </div>
            {(!!progressStages.length || !!finishedStages.length) && !collapsed && (
                <div className={styles.workCardStages}>
                    {!!progressStages.length && (
                        <Typo
                            variant={"subheadL"}
                            type={"quaternary"}
                            mode={"neutral"}
                            style={{ opacity: 0.8, marginBottom: 16 }}
                        >
                            Этапы
                        </Typo>
                    )}
                    {progressStages.map(renderStage)}
                    {!!progressStages.length && !!finishedStages.length && <Spacing height={22} />}
                    {!!finishedStages.length && (
                        <Typo
                            variant={"subheadL"}
                            type={"quaternary"}
                            mode={"neutral"}
                            style={{ opacity: 0.8, marginBottom: 16 }}
                        >
                            Завершено
                        </Typo>
                    )}
                    {finishedStages.map(renderStage)}
                </div>
            )}
            <div className={styles.workCardBottomPanel}>
                <Flex gap={8} align={"center"}>
                    <DatePicker
                        value={workVersion.startDate}
                        onChange={(value) => {
                            workVersion.endDate = value || workVersion.endDate;
                        }}
                        disableClear={true}
                        disableTime={true}
                        size={"medium"}
                        width={133}
                        style={{
                            height: 36,
                        }}
                        inputStyle={{
                            fontSize: 12,
                        }}
                        inputContentStyle={{
                            padding: "0 12px",
                            gap: 4,
                        }}
                        placeholder={"ДД.ММ.ГГГГ"}
                    />
                    <div
                        style={{
                            width: 12,
                            borderTop: "1px solid var(--objects-stroke-neutral-primary)",
                        }}
                    />
                    <DatePicker
                        value={workVersion.startDate}
                        onChange={(value) => {
                            workVersion.endDate = value || workVersion.endDate;
                        }}
                        disableClear={true}
                        disableTime={true}
                        size={"medium"}
                        width={133}
                        style={{
                            height: 36,
                        }}
                        inputStyle={{
                            fontSize: 12,
                        }}
                        inputContentStyle={{
                            padding: "0 12px",
                            gap: 4,
                        }}
                        placeholder={"ДД.ММ.ГГГГ"}
                    />
                </Flex>
                <Flex gap={6} align={"center"}>
                    <Input
                        onChange={(event) => {
                            props.work.plannedVolume = event.target.value
                                ? Number(event.target.value)
                                : null;
                        }}
                        size={"medium"}
                        value={props.work.plannedVolume ?? ""}
                        number={true}
                        placeholder={"План"}
                        style={{
                            height: 36,
                            width: 70,
                        }}
                        inputContentStyle={{
                            padding: "0 12px",
                            gap: 4,
                        }}
                        inputStyle={{
                            textAlign: "center",
                        }}
                    />
                    <Input
                        onChange={(event) => {
                            props.work.actualVolume = event.target.value
                                ? Number(event.target.value)
                                : null;
                        }}
                        size={"medium"}
                        value={props.work.actualVolume ?? ""}
                        number={true}
                        placeholder={"Факт"}
                        style={{
                            height: 36,
                            width: 70,
                        }}
                        inputContentStyle={{
                            padding: "0 12px",
                            gap: 4,
                        }}
                        inputStyle={{
                            textAlign: "center",
                        }}
                    />
                    <div
                        style={{
                            borderRadius: 8,
                            background: "#E9E9E9",
                            height: 36,
                            padding: "0 12px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            pointerEvents: "none",
                        }}
                    >
                        <Typo variant={"actionM"}>
                            {unitMap[props.work.volumeUnit] || props.work.volumeUnit || "кв.м"}
                        </Typo>
                    </div>
                </Flex>
                <Flex gap={12} align={"center"}>
                    <Button type={"outlined"} size={"small"} mode={"neutral"}>
                        Комментарии
                    </Button>
                    <Button
                        type={"secondary"}
                        size={"small"}
                        mode={"neutral"}
                        iconBefore={<IconEdit />}
                        onClick={() => {
                            props.vm.showEditOverlay = true;
                            props.vm.editingWork = props.work;
                            props.vm.editForm = deepCopy(props.work);
                        }}
                    />
                </Flex>
            </div>
        </div>
    );
});
