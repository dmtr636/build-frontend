import { observer } from "mobx-react-lite";
import { RegistryHeader } from "src/features/registry/components/RegistryHeader/RegistryHeader.tsx";
import { organizationsStore, registryStore } from "src/app/AppStore.ts";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { NormativeDocument } from "src/features/registry/types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconEdit, IconError } from "src/ui/assets/icons";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import styles from "src/features/organizations/OrganizationsPage.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import React, { useEffect } from "react";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Helmet } from "react-helmet";

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
                onAdd={() => {}}
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
            {!!registryStore.filteredDocuments.length && (
                <Table<NormativeDocument>
                    data={registryStore.filteredDocuments}
                    tableSettings={registryStore.documentsTableSettings}
                    onChangeTableSettings={(settings) => {
                        registryStore.documentsTableSettings = settings;
                    }}
                    dynamicRowHeight={true}
                    headerRowHasBorderRadius={true}
                    onRowClick={(_data) => {
                        console.log("data");
                    }}
                    tableHeaderRowStickyTop={119}
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
        </FlexColumn>
    );
});
