import { observer } from "mobx-react-lite";
import { RegistryHeader } from "src/features/registry/components/RegistryHeader/RegistryHeader.tsx";
import { layoutStore, registryStore } from "src/app/AppStore.ts";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { ConstructionWork, ConstructionWorkStage } from "src/features/registry/types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconBasket, IconClose, IconEdit, IconError, IconPlus } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import styles from "./styles.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import React, { useLayoutEffect } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import TextArea from "src/ui/components/inputs/Textarea/TextArea.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";

export const Works = observer(() => {
    useLayoutEffect(() => {
        if (registryStore.editingWork?.id) {
            registryStore.fetchStages(registryStore.editingWork.id);
        }
    }, [registryStore.editingWork?.id]);

    return (
        <FlexColumn
            style={{
                paddingBottom: "40px",
            }}
        >
            <RegistryHeader
                search={registryStore.worksSearch}
                onSearch={(value) => (registryStore.worksSearch = value)}
                searchPlaceholder={"Поиск по КПГЗ или наименованию"}
                onAdd={() => {
                    registryStore.showAddOverlay = true;
                }}
            />
            {registryStore.worksSearch && !registryStore.filteredWorks.length && (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <Typo
                        variant={"actionXL"}
                        mode={"neutral"}
                        type={"secondary"}
                        className={styles.errorText}
                    >
                        Не нашли работ <br />с таким параметрами
                    </Typo>
                    <Button
                        style={{ marginTop: 32 }}
                        type={"primary"}
                        mode={"neutral"}
                        size={"small"}
                        onClick={() => {
                            registryStore.worksSearch = "";
                        }}
                    >
                        Сбросить
                    </Button>
                </div>
            )}
            {(!!registryStore.filteredWorks.length || !registryStore.worksSearch) && (
                <Table<ConstructionWork>
                    data={registryStore.filteredWorks}
                    tableSettings={registryStore.worksTableSettings}
                    onChangeTableSettings={(settings) => {
                        registryStore.worksTableSettings = settings;
                    }}
                    dynamicRowHeight={true}
                    headerRowHasBorderRadius={layoutStore.scrollTop < 114}
                    onRowClick={(data) => {
                        registryStore.editingWork = data;
                        registryStore.worksForm = deepCopy(data);
                    }}
                    tableHeaderRowStickyTop={119}
                    loading={registryStore.loading}
                    columns={[
                        {
                            name: "",
                            field: "index",
                            width: 41,
                            sort: false,
                            index: false,
                            resizable: false,
                            render: (_data: ConstructionWork, hovered?: boolean) => {
                                return (
                                    <Tooltip header={"Редактировать"}>
                                        <Button
                                            size={"tiny"}
                                            iconBefore={<IconEdit />}
                                            mode={"neutral"}
                                            type={hovered ? "primary" : "tertiary"}
                                            style={{
                                                position: "absolute",
                                                left: 6,
                                            }}
                                        />
                                    </Tooltip>
                                );
                            },
                        },
                        {
                            name: "КПГЗ",
                            field: "classificationCode",
                            width: 116,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionWork) => {
                                return data.classificationCode;
                            },
                        },
                        {
                            name: "Наименование работы",
                            field: "name",
                            width: 901,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionWork) => {
                                return data.name;
                            },
                        },
                        {
                            name: "Единицы измерений",
                            field: "unit",
                            width: 185,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionWork) => {
                                return data.unit;
                            },
                        },
                    ]}
                />
            )}
            <Overlay
                open={registryStore.showAddOverlay}
                mode={"neutral"}
                title={"Добавить работу"}
                onClose={() => {
                    registryStore.worksForm = {};
                    registryStore.worksStagesForm = [];
                    registryStore.workStages = [];
                    registryStore.showAddOverlay = false;
                }}
                styles={{
                    card: {
                        width: 564,
                    },
                }}
                actions={[
                    <Flex key={"1"} gap={16} width={"500px"} justify={"end"}>
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={() => {
                                registryStore.worksForm = {};
                                registryStore.worksStagesForm = [];
                                registryStore.workStages = [];
                                registryStore.showAddOverlay = false;
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            type={"primary"}
                            mode={"neutral"}
                            loading={registryStore.loading}
                            disabled={!registryStore.worksForm.name}
                            onClick={async () => {
                                await registryStore.addWork(registryStore.worksForm);
                                snackbarStore.showNeutralPositiveSnackbar("Работа добавлена");
                                registryStore.showAddOverlay = false;
                                registryStore.worksForm = {};
                                registryStore.worksStagesForm = [];
                                registryStore.workStages = [];
                            }}
                        >
                            Добавить
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Autocomplete
                        options={registryStore.worksCodes.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.worksForm.classificationCode}
                        onValueChange={(v) =>
                            (registryStore.worksForm.classificationCode = v || undefined)
                        }
                        size={"large"}
                        formName={"КПГЗ"}
                        placeholder={"Введите или выберите из списка"}
                        zIndex={100}
                        required={true}
                        addButtonLabel={"Добавить КПГЗ"}
                        onAddButtonClick={(value) => {
                            registryStore.addedWorkCode = value;
                        }}
                    />
                    <TextArea
                        value={registryStore.worksForm.name}
                        onChange={(event) => (registryStore.worksForm.name = event.target.value)}
                        formName={"Наименование работы"}
                        size={"large"}
                        placeholder={"Введите наименование"}
                        height={150}
                        required={true}
                    />
                    <Select
                        options={registryStore.worksUnits.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.worksForm.unit}
                        onValueChange={(v) => (registryStore.worksForm.unit = v || undefined)}
                        size={"large"}
                        formName={"Единица измерения"}
                        placeholder={"Выберите из списка"}
                        required={true}
                        zIndex={100}
                    />
                    <div className={styles.stages}>
                        <FlexColumn gap={8}>
                            <Typo variant={"subheadXL"}>Этапы</Typo>
                            <Typo variant={"bodyM"} type={"quaternary"} mode={"neutral"}>
                                Будут добавляться автоматически при выборе типа работы.
                            </Typo>
                        </FlexColumn>
                        {registryStore.worksStagesForm.map((stage) => (
                            <WorkStageRow
                                key={stage.id}
                                workStage={stage}
                                onDelete={() => {
                                    registryStore.worksStagesForm =
                                        registryStore.worksStagesForm.filter(
                                            (_stage) => _stage.id !== stage.id,
                                        );
                                    registryStore.worksStagesForm.forEach((stage, index) => {
                                        stage.stageNumber = index + 1;
                                    });
                                }}
                            />
                        ))}
                        <div>
                            <Button
                                type={"text"}
                                iconBefore={<IconPlus />}
                                onClick={() => {
                                    registryStore.worksStagesForm.push({
                                        id: crypto.randomUUID(),
                                        workId: "",
                                        stageName: "",
                                        stageNumber: registryStore.worksStagesForm.length + 1,
                                    });
                                }}
                            >
                                Добавить этап
                            </Button>
                        </div>
                    </div>
                </FlexColumn>
            </Overlay>

            <Overlay
                open={!!registryStore.editingWork}
                mode={"neutral"}
                title={"Редактировать работу"}
                onClose={() => {
                    registryStore.worksForm = {};
                    registryStore.editingWork = null;
                    registryStore.worksStagesForm = [];
                    registryStore.workStages = [];
                }}
                styles={{
                    card: {
                        width: 564,
                    },
                }}
                actions={[
                    <Flex key={"1"} gap={16} width={"500px"} justify={"space-between"}>
                        <Button
                            type={"secondary"}
                            mode={"negative"}
                            onClick={() => {
                                registryStore.deletingWork = registryStore.editingWork;
                            }}
                        >
                            Удалить
                        </Button>
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={() => {
                                registryStore.worksForm = {};
                                registryStore.editingWork = null;
                                registryStore.worksStagesForm = [];
                                registryStore.workStages = [];
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            type={"primary"}
                            mode={"neutral"}
                            loading={registryStore.loading}
                            disabled={
                                !registryStore.worksForm.name ||
                                (deepEquals(registryStore.worksForm, registryStore.editingWork) &&
                                    deepEquals(
                                        registryStore.workStages,
                                        registryStore.worksStagesForm.filter((s) => !!s.stageName),
                                    ))
                            }
                            onClick={async () => {
                                await registryStore.updateWork(registryStore.worksForm);
                                snackbarStore.showNeutralPositiveSnackbar("Работа сохранена");
                                registryStore.worksForm = {};
                                registryStore.editingWork = null;
                                registryStore.worksStagesForm = [];
                                registryStore.workStages = [];
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Autocomplete
                        options={registryStore.worksCodes.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.worksForm.classificationCode}
                        onValueChange={(v) =>
                            (registryStore.worksForm.classificationCode = v || undefined)
                        }
                        size={"large"}
                        formName={"КПГЗ"}
                        placeholder={"Введите или выберите из списка"}
                        zIndex={100}
                        required={true}
                        addButtonLabel={"Добавить КПГЗ"}
                        onAddButtonClick={(value) => {
                            registryStore.addedWorkCode = value;
                        }}
                    />
                    <TextArea
                        value={registryStore.worksForm.name}
                        onChange={(event) => (registryStore.worksForm.name = event.target.value)}
                        formName={"Наименование работы"}
                        size={"large"}
                        placeholder={"Введите наименование"}
                        height={150}
                        required={true}
                    />
                    <Select
                        options={registryStore.worksUnits.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.worksForm.unit}
                        onValueChange={(v) => (registryStore.worksForm.unit = v || undefined)}
                        size={"large"}
                        formName={"Единица измерения"}
                        placeholder={"Выберите из списка"}
                        required={true}
                        zIndex={100}
                    />
                    <div className={styles.stages}>
                        <FlexColumn gap={8}>
                            <Typo variant={"subheadXL"}>Этапы</Typo>
                            <Typo variant={"bodyM"} type={"quaternary"} mode={"neutral"}>
                                Будут добавляться автоматически при выборе типа работы.
                            </Typo>
                        </FlexColumn>
                        {registryStore.worksStagesForm.map((stage) => (
                            <WorkStageRow
                                key={stage.id}
                                workStage={stage}
                                onDelete={() => {
                                    registryStore.worksStagesForm =
                                        registryStore.worksStagesForm.filter(
                                            (_stage) => _stage.id !== stage.id,
                                        );
                                    registryStore.worksStagesForm.forEach((stage, index) => {
                                        stage.stageNumber = index + 1;
                                    });
                                }}
                            />
                        ))}
                        <div>
                            <Button
                                type={"text"}
                                iconBefore={<IconPlus />}
                                onClick={() => {
                                    registryStore.worksStagesForm.push({
                                        id: crypto.randomUUID(),
                                        workId: registryStore.editingWork?.id ?? "",
                                        stageName: "",
                                        stageNumber: registryStore.worksStagesForm.length + 1,
                                    });
                                }}
                            >
                                Добавить этап
                            </Button>
                        </div>
                    </div>
                </FlexColumn>
            </Overlay>
            <DeleteOverlay
                open={!!registryStore.deletingWork}
                title={"Удалить работу"}
                subtitle={"Будет удалена работа"}
                info={registryStore.deletingWork?.name}
                deleteButtonLabel={"Удалить"}
                onDelete={async () => {
                    if (registryStore.deletingWork) {
                        await registryStore.deleteWork(registryStore.deletingWork);
                        snackbarStore.showNeutralSnackbar("Работа удалена", {
                            showCloseButton: true,
                            icon: <IconBasket />,
                        });
                        registryStore.deletingWork = null;
                        registryStore.editingWork = null;
                        registryStore.worksForm = {};
                        registryStore.worksStagesForm = [];
                    }
                }}
                loading={registryStore.loading}
                onCancel={() => (registryStore.deletingWork = null)}
            />
        </FlexColumn>
    );
});

export const WorkStageRow = observer(
    (props: { workStage: ConstructionWorkStage; onDelete: () => void }) => {
        return (
            <Grid columns={"12px 1fr auto"} gap={12} align={"center"}>
                <Typo
                    variant={"actionL"}
                    style={{
                        textAlign: "center",
                    }}
                >
                    {props.workStage.stageNumber}
                </Typo>
                <Input
                    onChange={(event) => {
                        props.workStage.stageName = event.target.value;
                    }}
                    value={props.workStage.stageName}
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
