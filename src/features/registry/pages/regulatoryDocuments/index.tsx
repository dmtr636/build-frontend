import { observer } from "mobx-react-lite";
import { RegistryHeader } from "src/features/registry/components/RegistryHeader/RegistryHeader.tsx";
import { organizationsStore, registryStore } from "src/app/AppStore.ts";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { NormativeDocument } from "src/features/registry/types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconBasket, IconEdit, IconError } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import styles from "src/features/organizations/OrganizationsPage.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import React, { useEffect } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Helmet } from "react-helmet";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import { deepEquals } from "src/shared/utils/deepEquals.ts";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import * as vm from "node:vm";

export const RegulatoryDocuments = observer(() => {
    useEffect(() => {
        if (!registryStore.documents.length) {
            registryStore.fetchAllDocuments();
        }
    }, []);

    return (
        <FlexColumn
            style={{
                paddingBottom: "40px",
            }}
        >
            <RegistryHeader
                search={registryStore.documentsSearch}
                onSearch={(value) => (registryStore.documentsSearch = value)}
                searchPlaceholder={"Поиск по положению или наименованию"}
                onAdd={() => {
                    registryStore.showAddOverlay = true;
                }}
            />
            {registryStore.documentsSearch && !registryStore.filteredDocuments.length && (
                <div className={styles.containerError}>
                    <IconError className={styles.iconError} />
                    <Typo
                        variant={"actionXL"}
                        mode={"neutral"}
                        type={"secondary"}
                        className={styles.errorText}
                    >
                        Не нашли документов <br />с таким параметрами
                    </Typo>
                    <Button
                        style={{ marginTop: 32 }}
                        type={"primary"}
                        mode={"neutral"}
                        size={"small"}
                        onClick={() => {
                            registryStore.documentsSearch = "";
                        }}
                    >
                        Сбросить
                    </Button>
                </div>
            )}
            {(!!registryStore.filteredDocuments.length || !registryStore.documentsSearch) && (
                <Table<NormativeDocument>
                    data={registryStore.filteredDocuments}
                    tableSettings={registryStore.documentsTableSettings}
                    onChangeTableSettings={(settings) => {
                        registryStore.documentsTableSettings = settings;
                    }}
                    dynamicRowHeight={true}
                    headerRowHasBorderRadius={true}
                    onRowClick={(data) => {
                        registryStore.editingDocument = data;
                        registryStore.documentsForm = deepCopy(data);
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
                            render: (_data: NormativeDocument, hovered?: boolean) => {
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
                            name: "Положение",
                            field: "statement",
                            width: 315,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: NormativeDocument) => {
                                return data.regulation;
                            },
                        },
                        {
                            name: "Наименование документа",
                            field: "name",
                            width: 885,
                            sort: false,
                            wrap: true,
                            resizable: false,
                            render: (data: NormativeDocument) => {
                                return data.name;
                            },
                        },
                    ]}
                />
            )}
            <Overlay
                open={registryStore.showAddOverlay}
                mode={"neutral"}
                title={"Добавить нормативный документ"}
                onClose={() => {
                    registryStore.documentsForm = {};
                    registryStore.showAddOverlay = false;
                }}
                styles={{
                    card: {
                        width: 564,
                    },
                }}
                actions={[
                    <Flex
                        key={"1"}
                        gap={16}
                        width={"500px"}
                        justify={"end"}
                        style={{
                            marginTop: 40,
                        }}
                    >
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={() => {
                                registryStore.documentsForm = {};
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
                                !registryStore.documentsForm.name ||
                                !registryStore.documentsForm.regulation
                            }
                            onClick={async () => {
                                await registryStore.addDocument(registryStore.documentsForm);
                                snackbarStore.showNeutralPositiveSnackbar("Документ добавлен");
                                registryStore.showAddOverlay = false;
                                registryStore.documentsForm = {};
                            }}
                        >
                            Добавить
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Input
                        onChange={(event) =>
                            (registryStore.documentsForm.regulation = event.target.value)
                        }
                        value={registryStore.documentsForm.regulation ?? ""}
                        placeholder={"Введите положение"}
                        size={"large"}
                        required={true}
                        formName={"Положение"}
                    />
                    <Input
                        onChange={(event) =>
                            (registryStore.documentsForm.name = event.target.value)
                        }
                        value={registryStore.documentsForm.name ?? ""}
                        placeholder={"Введите наименование"}
                        size={"large"}
                        required={true}
                        formName={"Наименование документа"}
                    />
                </FlexColumn>
            </Overlay>

            <Overlay
                open={!!registryStore.editingDocument}
                mode={"neutral"}
                title={"Редактировать нормативный документ"}
                onClose={() => {
                    registryStore.documentsForm = {};
                    registryStore.editingDocument = null;
                }}
                styles={{
                    card: {
                        width: 564,
                    },
                }}
                actions={[
                    <Flex
                        key={"1"}
                        gap={16}
                        width={"500px"}
                        justify={"space-between"}
                        style={{
                            marginTop: 40,
                        }}
                    >
                        <Button
                            type={"secondary"}
                            mode={"negative"}
                            onClick={() => {
                                registryStore.deletingDocument = registryStore.editingDocument;
                            }}
                        >
                            Удалить
                        </Button>
                        <Button
                            style={{ marginLeft: "auto" }}
                            type={"secondary"}
                            mode={"neutral"}
                            onClick={() => {
                                registryStore.documentsForm = {};
                                registryStore.editingDocument = null;
                            }}
                        >
                            Отменить
                        </Button>
                        <Button
                            type={"primary"}
                            mode={"neutral"}
                            loading={registryStore.loading}
                            disabled={
                                !registryStore.documentsForm.name ||
                                !registryStore.documentsForm.regulation ||
                                deepEquals(
                                    registryStore.documentsForm,
                                    registryStore.editingDocument,
                                )
                            }
                            onClick={async () => {
                                await registryStore.updateDocument(registryStore.documentsForm);
                                snackbarStore.showNeutralPositiveSnackbar("Документ сохранён");
                                registryStore.documentsForm = {};
                                registryStore.editingDocument = null;
                            }}
                        >
                            Сохранить изменения
                        </Button>
                    </Flex>,
                ]}
            >
                <FlexColumn gap={16}>
                    <Input
                        onChange={(event) =>
                            (registryStore.documentsForm.regulation = event.target.value)
                        }
                        value={registryStore.documentsForm.regulation ?? ""}
                        placeholder={"Введите положение"}
                        size={"large"}
                        required={true}
                        formName={"Положение"}
                    />
                    <Input
                        onChange={(event) =>
                            (registryStore.documentsForm.name = event.target.value)
                        }
                        value={registryStore.documentsForm.name ?? ""}
                        placeholder={"Введите наименование"}
                        size={"large"}
                        required={true}
                        formName={"Наименование документа"}
                    />
                </FlexColumn>
            </Overlay>
            <DeleteOverlay
                open={!!registryStore.deletingDocument}
                title={"Удалить нормативный документ"}
                subtitle={"Будет удалён нормативный документ"}
                info={registryStore.deletingDocument?.name}
                deleteButtonLabel={"Удалить"}
                onDelete={async () => {
                    if (registryStore.deletingDocument) {
                        await registryStore.deleteDocument(registryStore.deletingDocument);
                        snackbarStore.showNeutralSnackbar("Документ удален", {
                            showCloseButton: true,
                            icon: <IconBasket />,
                        });
                        registryStore.deletingDocument = null;
                        registryStore.editingDocument = null;
                    }
                }}
                loading={registryStore.loading}
                onCancel={() => (registryStore.deletingDocument = null)}
            />
        </FlexColumn>
    );
});
