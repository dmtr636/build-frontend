import { observer } from "mobx-react-lite";
import styles from "./OrganizationsPage.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    IconBasket,
    IconCheckmark,
    IconClose,
    IconEdit,
    IconError,
    IconFlag,
    IconGroup,
    IconPlus,
    IconSorting,
} from "src/ui/assets/icons";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { appStore, eventsStore, organizationsStore, userStore } from "src/app/AppStore.ts";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import OrganizationListCard from "src/features/organizations/OrganizationListCard/OrganizationListCard.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { Badge } from "src/ui/components/info/Badge/Badge.tsx";
import { numDecl } from "src/shared/utils/numDecl.ts";
import { Status } from "src/ui/components/info/Status/Status.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";
import { useNavigate } from "react-router-dom";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import UserItemCard from "src/features/organizations/UserItemCard/UserItemCard.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { Helmet } from "react-helmet";
import { Divider } from "src/ui/components/atoms/Divider/Divider.tsx";

export const OrganizationsPage = observer(() => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(false);
    const orgCardRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const usersOnline = appStore.userStore.usersOnline;
    useLayoutEffect(() => {
        appStore.userStore.fetchOnlineUser();
    }, []);
    const isSelected = (field: string, order: "asc" | "desc") =>
        organizationsStore.sort.field === field && organizationsStore.sort?.direction === order;

    const dropDownSortOptions: DropdownListOption<string>[] = [
        {
            name: "По алфавиту",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По алфавиту</div>,
        },
        {
            name: "От А - Я",
            mode: "neutral",
            pale: true,
            disabled: isSelected("name", "asc"),
            iconAfter: isSelected("name", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "name",
                    direction: "asc",
                };
            },
        },
        {
            name: "От Я - А",
            mode: "neutral",
            pale: true,
            disabled: isSelected("name", "desc"),
            iconAfter: isSelected("name", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "name",
                    direction: "desc",
                };
            },
        },
        {
            name: "По дате создания",
            mode: "neutral",
            renderOption: () => <div className={styles.renderHeader}>По дате создания</div>,
        },
        {
            name: "Сначала новые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("date", "desc"),
            iconAfter: isSelected("date", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "date",
                    direction: "desc",
                };
            },
        },
        {
            name: "Сначала старые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("date", "asc"),
            iconAfter: isSelected("date", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "date",
                    direction: "asc",
                };
            },
        },
        {
            name: "По количеству сотрудников",
            mode: "neutral",
            renderOption: () => (
                <div className={styles.renderHeader}>По количеству сотрудников</div>
            ),
        },
        {
            name: "По возрастанию",
            mode: "neutral",
            pale: true,
            disabled: isSelected("count", "asc"),
            iconAfter: isSelected("count", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "count",
                    direction: "asc",
                };
            },
        },
        {
            name: "По убыванию",
            mode: "neutral",
            pale: true,
            disabled: isSelected("count", "desc"),
            iconAfter: isSelected("count", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "count",
                    direction: "desc",
                };
            },
        },
    ];

    const currentOrg = organizationsStore.currentOrg;
    const availableUsers = organizationsStore.currentOrgAvailableUsers;
    const scrollBarWidth = useMemo(() => getScrollBarWidth(), []);

    useEffect(() => {
        const el = orgCardRef.current;
        if (!el) {
            setShowBottomGradient(false);
            return;
        }

        const updateGradientVisibility = () => {
            const hasVerticalScroll = el.scrollHeight > el.clientHeight + 1;
            const scrolledToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            setShowBottomGradient(hasVerticalScroll && !scrolledToBottom);
        };

        updateGradientVisibility();
        el.addEventListener("scroll", updateGradientVisibility, { passive: true });
        window.addEventListener("resize", updateGradientVisibility, { passive: true });
        return () => {
            el.removeEventListener("scroll", updateGradientVisibility);
            window.removeEventListener("resize", updateGradientVisibility);
        };
        // Re-evaluate when the current organization or its users list changes
    }, [
        organizationsStore.currentOrganizationId,
        organizationsStore.filteredCurrentOrgUsers.length,
    ]);

    return (
        <div className={styles.container}>
            <Helmet>
                <title>Организации – Build</title>
            </Helmet>
            <div className={styles.leftCol}>
                <div className={styles.searchRow}>
                    <Button
                        fullWidth={true}
                        size={"large"}
                        mode={"neutral"}
                        iconBefore={<IconPlus />}
                        onClick={() => {}}
                    >
                        Новая организация
                    </Button>
                    <ExplorationInput
                        onInputChange={(value) => (organizationsStore.search = value)}
                        inputValue={organizationsStore.search}
                        size={"large"}
                        inputPlaceholder={"Найти по названию"}
                    />
                    <SingleDropdownList
                        show={showSortDropdown}
                        setShow={setShowSortDropdown}
                        options={dropDownSortOptions}
                        maxHeight={500}
                        hideTip={true}
                        tipPosition={"top-right"}
                    >
                        <span>
                            <Tooltip header={showSortDropdown ? "" : "Сортировка"} delay={500}>
                                <Button
                                    size={"large"}
                                    iconBefore={showSortDropdown ? <IconClose /> : <IconSorting />}
                                    type={showSortDropdown ? "primary" : "outlined"}
                                    mode={"neutral"}
                                ></Button>
                            </Tooltip>
                        </span>
                    </SingleDropdownList>
                </div>
                {organizationsStore.search && !organizationsStore.filteredOrganizations.length && (
                    <div className={styles.containerError}>
                        <IconError className={styles.iconError} />
                        <Typo
                            variant={"actionXL"}
                            mode={"neutral"}
                            type={"secondary"}
                            className={styles.errorText}
                        >
                            Не нашли организаций <br />с таким названием
                        </Typo>
                        <Button
                            style={{ marginTop: 32 }}
                            type={"primary"}
                            mode={"neutral"}
                            size={"small"}
                            onClick={() => {
                                organizationsStore.search = "";
                            }}
                        >
                            Сбросить
                        </Button>
                    </div>
                )}
                <div className={styles.orgList}>
                    {organizationsStore.filteredOrganizations.map((org) => (
                        <OrganizationListCard
                            key={org.id}
                            organization={org}
                            isOpen={organizationsStore.currentOrganizationId === org.id}
                            onClick={() => {
                                if (organizationsStore.currentOrganizationId === org.id) {
                                    organizationsStore.currentOrganizationId = null;
                                } else {
                                    organizationsStore.currentOrganizationId = org.id;
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
            {organizationsStore.currentOrganizationId && currentOrg && (
                <div
                    ref={orgCardRef}
                    className={`${styles.orgCard} ${showBottomGradient ? styles.showBottomGradient : ""}`}
                >
                    <Tooltip header={"Редактировать"} delay={500}>
                        <Button
                            className={styles.editButton}
                            size={"small"}
                            type={"outlined"}
                            mode={"neutral"}
                            iconBefore={<IconEdit />}
                            onClick={() => {}}
                        />
                    </Tooltip>
                    <Tooltip header={"Удалить"} delay={500}>
                        <Button
                            className={styles.deleteButton}
                            size={"small"}
                            type={"outlined"}
                            mode={"negative"}
                            iconBefore={<IconBasket />}
                            onClick={() => {}}
                        />
                    </Tooltip>
                    <div className={styles.orgCardHeader}>
                        <div className={styles.logoArea}>
                            {currentOrg.imageId ? (
                                <img
                                    className={styles.logo}
                                    src={fileUrl(currentOrg.imageId)}
                                    alt={currentOrg.name}
                                />
                            ) : (
                                <IconFlag className={styles.logo} />
                            )}
                        </div>
                        <Typo variant={"subheadM"} className={styles.name}>
                            {currentOrg.name}
                        </Typo>
                        <div className={styles.badge}>
                            {currentOrg?.employeeIds.length || "Пока нет"}{" "}
                            {numDecl(currentOrg?.employeeIds.length, [
                                "сотрудник",
                                "сотрудника",
                                "сотрудников",
                            ])}
                        </div>
                    </div>
                    <FlexColumn gap={12}>
                        <Autocomplete
                            options={availableUsers
                                .map((u) => ({
                                    name: getNameInitials(u),
                                    value: u.id,
                                }))
                                .filter((u) => !!u.name)}
                            value={null}
                            onValueChange={() => {}}
                            onOptionClick={async (value) => {
                                if (value) {
                                    await organizationsStore.addUserToOrganization(
                                        currentOrg,
                                        value,
                                    );
                                }
                                snackbarStore.showNeutralPositiveSnackbar(
                                    "Пользователь добавлен в организацию",
                                );
                            }}
                            disableChangeHandler={true}
                            onAddButtonClick={() => {}}
                            addButtonLabel={"Добавить пользователя"}
                            formName={"Добавить пользователя в организацию"}
                            placeholder={"Введите имя или выберите из списка"}
                            iconBefore={<IconPlus />}
                        />
                        {!!organizationsStore.currentOrgUsers.length && (
                            <>
                                <Divider
                                    direction={"horizontal"}
                                    type={"secondary"}
                                    mode={"neutral"}
                                    style={{
                                        margin: "4px -20px",
                                    }}
                                />
                                <ExplorationInput
                                    onInputChange={(v) => (organizationsStore.cardSearch = v)}
                                    inputValue={organizationsStore.cardSearch}
                                    size={"medium"}
                                    inputPlaceholder={"Найти по имени"}
                                />
                            </>
                        )}
                        {!organizationsStore.currentOrgUsers.length && (
                            <div className={styles.noUsersInOrg}>
                                <IconGroup className={styles.icon} />
                                <Typo variant={"actionXL"} type={"secondary"} mode={"neutral"}>
                                    Пока нет пользователей <br />в организации
                                </Typo>
                            </div>
                        )}
                        {!!organizationsStore.currentOrgUsers.length &&
                            !organizationsStore.filteredCurrentOrgUsers.length && (
                                <div className={styles.noUsersInOrg}>
                                    <IconError className={styles.icon} />
                                    <Typo variant={"actionXL"} type={"secondary"} mode={"neutral"}>
                                        Не нашли пользователя <br />с таким именем
                                    </Typo>
                                </div>
                            )}
                        {!!organizationsStore.currentOrgUsers.length && (
                            <FlexColumn
                                gap={8}
                                style={{
                                    marginTop: 12,
                                }}
                            >
                                {organizationsStore.filteredCurrentOrgUsers.map((u) => (
                                    <UserItemCard
                                        user={u}
                                        onClick={() => {
                                            window.open(`/admin/users/${u.id}`, "_blank");
                                        }}
                                        name={getFullName(u)}
                                        key={u.id}
                                        image={u.imageId}
                                        position={u.position}
                                        enabled={usersOnline[u.id]?.status === "online"}
                                    />
                                ))}
                            </FlexColumn>
                        )}
                    </FlexColumn>
                </div>
            )}
        </div>
    );
});
