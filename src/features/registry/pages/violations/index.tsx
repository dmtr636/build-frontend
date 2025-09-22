import { observer } from "mobx-react-lite";
import { RegistryHeader } from "src/features/registry/components/RegistryHeader/RegistryHeader.tsx";
import { registryStore } from "src/app/AppStore.ts";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { ConstructionViolation } from "src/features/registry/types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconBasket, IconEdit, IconError } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import styles from "src/features/organizations/OrganizationsPage.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import React, { useEffect } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import TextArea from "src/ui/components/inputs/Textarea/TextArea.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";

export const Violations = observer(() => {
    useEffect(() => {
        if (!registryStore.violations.length) {
            registryStore.fetchAllViolations();
        }
    }, []);

    return (
        <FlexColumn
            style={{
                paddingBottom: "40px",
            }}
        >
            <RegistryHeader
                search={registryStore.violationsSearch}
                onSearch={(value) => (registryStore.violationsSearch = value)}
                searchPlaceholder={"Поиск по категории, виду, типу или наименованию"}
                onAdd={() => {
                    registryStore.showAddOverlay = true;
                }}
            />
            {registryStore.violationsSearch && !registryStore.filteredViolations.length && (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <Typo
                        variant={"actionXL"}
                        mode={"neutral"}
                        type={"secondary"}
                        className={styles.errorText}
                    >
                        Не нашли нарушений <br />с таким параметрами
                    </Typo>
                    <Button
                        style={{ marginTop: 32 }}
                        type={"primary"}
                        mode={"neutral"}
                        size={"small"}
                        onClick={() => {
                            registryStore.violationsSearch = "";
                        }}
                    >
                        Сбросить
                    </Button>
                </div>
            )}
            {(!!registryStore.filteredViolations.length || !registryStore.violationsSearch) && (
                <Table<ConstructionViolation>
                    data={registryStore.filteredViolations}
                    tableSettings={registryStore.violationsTableSettings}
                    onChangeTableSettings={(settings) => {
                        registryStore.violationsTableSettings = settings;
                    }}
                    dynamicRowHeight={true}
                    headerRowHasBorderRadius={true}
                    onRowClick={(data) => {
                        registryStore.editingViolation = data;
                        registryStore.violationsForm = deepCopy(data);
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
                            render: (_data: ConstructionViolation, hovered?: boolean) => {
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
                            name: "Категория",
                            field: "category",
                            width: 234,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionViolation) => {
                                return data.category;
                            },
                        },
                        {
                            name: "Вид",
                            field: "kind",
                            width: 131,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionViolation) => {
                                return data.kind;
                            },
                        },
                        {
                            name: "Тип",
                            field: "severityType",
                            width: 96,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionViolation) => {
                                return data.severityType;
                            },
                        },
                        {
                            name: "Наименование нарушения",
                            field: "name",
                            width: 604,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionViolation) => {
                                return data.name;
                            },
                        },
                        {
                            name: "Регламентированный срок устранения",
                            field: "remediationDueDays",
                            width: 139,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: ConstructionViolation) => {
                                return data.remediationDueDays;
                            },
                        },
                    ]}
                />
            )}
            <Overlay
                open={registryStore.showAddOverlay}
                mode={"neutral"}
                title={"Добавить нарушение"}
                onClose={() => {
                    registryStore.violationsForm = {};
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
                                registryStore.violationsForm = {};
                                registryStore.showAddOverlay = false;
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            type={"primary"}
                            mode={"neutral"}
                            loading={registryStore.loading}
                            disabled={
                                !registryStore.violationsForm.category ||
                                !registryStore.violationsForm.name ||
                                !registryStore.violationsForm.kind ||
                                !registryStore.violationsForm.severityType
                            }
                            onClick={async () => {
                                await registryStore.addViolation(registryStore.violationsForm);
                                snackbarStore.showNeutralPositiveSnackbar("Нарушение добавлено");
                                registryStore.showAddOverlay = false;
                                registryStore.violationsForm = {};
                            }}
                        >
                            Добавить
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Autocomplete
                        options={registryStore.violationCategories.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.violationsForm.category}
                        onValueChange={(v) =>
                            (registryStore.violationsForm.category = v || undefined)
                        }
                        size={"large"}
                        formName={"Категория"}
                        placeholder={"Введите или выберите из списка"}
                        zIndex={100}
                        required={true}
                    />
                    <Grid gap={16} columns={"1fr 1fr"}>
                        <Select
                            options={registryStore.violationKinds.map((c) => ({
                                name: c,
                                value: c,
                            }))}
                            value={registryStore.violationsForm.kind}
                            onValueChange={(v) =>
                                (registryStore.violationsForm.kind = v || undefined)
                            }
                            size={"large"}
                            formName={"Вид"}
                            placeholder={"Выберите вид"}
                            required={true}
                            zIndex={100}
                        />
                        <Select
                            options={registryStore.violationTypes.map((c) => ({
                                name: c,
                                value: c,
                            }))}
                            value={registryStore.violationsForm.severityType}
                            onValueChange={(v) =>
                                (registryStore.violationsForm.severityType = v || undefined)
                            }
                            size={"large"}
                            formName={"Тип"}
                            placeholder={"Выберите тип"}
                            required={true}
                            zIndex={100}
                        />
                    </Grid>
                    <TextArea
                        value={registryStore.violationsForm.name}
                        onChange={(event) =>
                            (registryStore.violationsForm.name = event.target.value)
                        }
                        formName={"Наименование нарушения"}
                        size={"large"}
                        placeholder={"Введите наименование"}
                        height={150}
                        required={true}
                    />
                    <Input
                        onChange={(event) =>
                            (registryStore.violationsForm.remediationDueDays = event.target.value
                                ? Number(event.target.value)
                                : undefined)
                        }
                        value={`${registryStore.violationsForm.remediationDueDays ?? ""}`}
                        placeholder={"Введите число"}
                        size={"large"}
                        formName={"Срок устранения"}
                        number={true}
                    />
                </FlexColumn>
            </Overlay>

            <Overlay
                open={!!registryStore.editingViolation}
                mode={"neutral"}
                title={"Редактировать нарушение"}
                onClose={() => {
                    registryStore.violationsForm = {};
                    registryStore.editingViolation = null;
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
                                registryStore.deletingViolation = registryStore.editingViolation;
                            }}
                        >
                            Удалить
                        </Button>
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={() => {
                                registryStore.violationsForm = {};
                                registryStore.editingViolation = null;
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            type={"primary"}
                            mode={"neutral"}
                            loading={registryStore.loading}
                            disabled={
                                !registryStore.violationsForm.name ||
                                !registryStore.violationsForm.category ||
                                !registryStore.violationsForm.kind ||
                                !registryStore.violationsForm.severityType ||
                                deepEquals(
                                    registryStore.violationsForm,
                                    registryStore.editingViolation,
                                )
                            }
                            onClick={async () => {
                                await registryStore.updateViolation(registryStore.violationsForm);
                                snackbarStore.showNeutralPositiveSnackbar("Нарушение сохранено");
                                registryStore.violationsForm = {};
                                registryStore.editingViolation = null;
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Autocomplete
                        options={registryStore.violationCategories.map((c) => ({
                            name: c,
                            value: c,
                        }))}
                        value={registryStore.violationsForm.category}
                        onValueChange={(v) =>
                            (registryStore.violationsForm.category = v || undefined)
                        }
                        size={"large"}
                        formName={"Категория"}
                        placeholder={"Введите или выберите из списка"}
                        zIndex={100}
                        required={true}
                    />
                    <Grid gap={16} columns={"1fr 1fr"}>
                        <Select
                            options={registryStore.violationKinds.map((c) => ({
                                name: c,
                                value: c,
                            }))}
                            value={registryStore.violationsForm.kind}
                            onValueChange={(v) =>
                                (registryStore.violationsForm.kind = v || undefined)
                            }
                            size={"large"}
                            formName={"Вид"}
                            placeholder={"Выберите вид"}
                            required={true}
                            zIndex={100}
                        />
                        <Select
                            options={registryStore.violationTypes.map((c) => ({
                                name: c,
                                value: c,
                            }))}
                            value={registryStore.violationsForm.severityType}
                            onValueChange={(v) =>
                                (registryStore.violationsForm.severityType = v || undefined)
                            }
                            size={"large"}
                            formName={"Тип"}
                            placeholder={"Выберите тип"}
                            required={true}
                            zIndex={100}
                        />
                    </Grid>
                    <TextArea
                        value={registryStore.violationsForm.name}
                        onChange={(event) =>
                            (registryStore.violationsForm.name = event.target.value)
                        }
                        formName={"Наименование нарушения"}
                        size={"large"}
                        placeholder={"Введите наименование"}
                        height={150}
                        required={true}
                    />
                    <Input
                        onChange={(event) =>
                            (registryStore.violationsForm.remediationDueDays = event.target.value
                                ? Number(event.target.value)
                                : undefined)
                        }
                        value={`${registryStore.violationsForm.remediationDueDays ?? ""}`}
                        placeholder={"Введите число"}
                        size={"large"}
                        formName={"Срок устранения"}
                        number={true}
                    />
                </FlexColumn>
            </Overlay>
            <DeleteOverlay
                open={!!registryStore.deletingViolation}
                title={"Удалить нарушение"}
                subtitle={"Будет удалено нарушение"}
                info={registryStore.deletingViolation?.name}
                deleteButtonLabel={"Удалить"}
                onDelete={async () => {
                    if (registryStore.deletingViolation) {
                        await registryStore.deleteViolation(registryStore.deletingViolation);
                        snackbarStore.showNeutralSnackbar("Нарушение удалено", {
                            showCloseButton: true,
                            icon: <IconBasket />,
                        });
                        registryStore.deletingViolation = null;
                        registryStore.editingViolation = null;
                    }
                }}
                loading={registryStore.loading}
                onCancel={() => (registryStore.deletingViolation = null)}
            />
        </FlexColumn>
    );
});
