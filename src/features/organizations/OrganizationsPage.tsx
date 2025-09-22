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
import { appStore, layoutStore, organizationsStore } from "src/app/AppStore.ts";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SingleDropdownList } from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import OrganizationListCard from "src/features/organizations/OrganizationListCard/OrganizationListCard.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { numDecl } from "src/shared/utils/numDecl.ts";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";
import { useNavigate, useParams } from "react-router-dom";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import UserItemCard from "src/features/organizations/UserItemCard/UserItemCard.tsx";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { Helmet } from "react-helmet";
import { Divider } from "src/ui/components/atoms/Divider/Divider.tsx";
import { OrganizationForm } from "src/features/organizations/OrganizationForm/OrganizationForm.tsx";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";
import UserForm from "src/features/users/components/UserForm/UserForm.tsx";
import { clsx } from "clsx";
import { IconPlaceholderArrow, IconPlaceholderFlag } from "src/features/organizations/assets";

export const OrganizationsPage = observer(() => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const orgCardRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const usersOnline = appStore.userStore.usersOnline;
    const params = useParams<{ id: string }>();

    useLayoutEffect(() => {
        appStore.userStore.fetchOnlineUser();
    }, []);

    useLayoutEffect(() => {
        organizationsStore.currentOrganizationId = params.id || null;
    }, [params.id]);

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
            disabled: isSelected("createdAt", "desc"),
            iconAfter: isSelected("createdAt", "desc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "createdAt",
                    direction: "desc",
                };
            },
        },
        {
            name: "Сначала старые",
            mode: "neutral",
            pale: true,
            disabled: isSelected("createdAt", "asc"),
            iconAfter: isSelected("createdAt", "asc") ? <IconCheckmark /> : undefined,
            onClick: () => {
                organizationsStore.sort = {
                    field: "createdAt",
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
                <FlexColumn
                    gap={12}
                    className={clsx(
                        styles.searchRowWrapper,
                        layoutStore.scrolled && styles.windowScrolled,
                    )}
                >
                    <div className={styles.searchRow}>
                        <Button
                            fullWidth={true}
                            size={"large"}
                            mode={"neutral"}
                            iconBefore={<IconPlus />}
                            onClick={() => {
                                organizationsStore.showAddOverlay = true;
                            }}
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
                                        iconBefore={
                                            showSortDropdown ? <IconClose /> : <IconSorting />
                                        }
                                        type={showSortDropdown ? "primary" : "outlined"}
                                        mode={"neutral"}
                                    ></Button>
                                </Tooltip>
                            </span>
                        </SingleDropdownList>
                    </div>
                    {organizationsStore.filteredOrganizations.length > 0 && (
                        <div className={styles.headFilters}>
                            <div className={styles.count}>
                                <span style={{ opacity: 0.6 }}>Отображается</span>
                                <span className={styles.countItem}>
                                    {organizationsStore.filteredOrganizations.length}{" "}
                                    {numDecl(organizationsStore.filteredOrganizations.length, [
                                        "организация",
                                        "организации",
                                        "организаций",
                                    ])}
                                </span>
                            </div>

                            <div className={styles.count} style={{ marginLeft: "auto" }}>
                                <span style={{ opacity: 0.6 }}>Сортируется</span>
                                <span className={styles.countItem}>
                                    {organizationsStore.sort.field === "name" &&
                                        `По алфавиту, от ${organizationsStore.sort.direction === "asc" ? "А - Я" : "Я - А"}`}
                                    {organizationsStore.sort.field === "createdAt" &&
                                        `По дате создания, ${organizationsStore.sort.direction === "asc" ? "сначала старые" : "сначала новые"}`}
                                    {organizationsStore.sort.field === "count" &&
                                        `По количеству сотрудников, ${organizationsStore.sort.direction === "asc" ? "по возрастанию" : "по убыванию"}`}
                                </span>
                            </div>
                        </div>
                    )}
                </FlexColumn>

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
                                    navigate(`/admin/organizations`, { replace: true });
                                } else {
                                    organizationsStore.currentOrganizationId = org.id;
                                    navigate(`/admin/organizations/${org.id}`, { replace: true });
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
            {!currentOrg && (
                <div className={clsx(styles.orgCard, styles.placeholder)}>
                    <FlexColumn gap={6} align={"center"} style={{ position: "absolute" }}>
                        <IconPlaceholderArrow
                            style={{
                                position: "absolute",
                                top: -65,
                                transform: "translate(-10px, 0)",
                            }}
                        />
                        <IconPlaceholderFlag />

                        <Typo
                            variant={"subheadXL"}
                            type={"tertiary"}
                            mode={"neutral"}
                            style={{ textAlign: "center" }}
                        >
                            {"Выберите организацию\nиз списка"}
                        </Typo>
                    </FlexColumn>
                </div>
            )}
            {organizationsStore.currentOrganizationId && currentOrg && (
                <div ref={orgCardRef} className={`${styles.orgCard}`}>
                    <Tooltip header={"Редактировать"} delay={500}>
                        <Button
                            className={styles.editButton}
                            size={"small"}
                            type={"outlined"}
                            mode={"neutral"}
                            iconBefore={<IconEdit />}
                            onClick={() => {
                                organizationsStore.editingOrganization = currentOrg;
                            }}
                        />
                    </Tooltip>
                    <Tooltip header={"Удалить"} delay={500}>
                        <Button
                            className={styles.deleteButton}
                            size={"small"}
                            type={"outlined"}
                            mode={"negative"}
                            iconBefore={<IconBasket />}
                            onClick={() => {
                                organizationsStore.deletingOrganization = currentOrg;
                                organizationsStore.showDeleteOverlay = true;
                            }}
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
                            {currentOrg?.employees.length || "Пока нет"}{" "}
                            {numDecl(currentOrg?.employees.length, [
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
                                snackbarStore.showNeutralPositiveSnackbar("Пользователь добавлен");
                            }}
                            disableChangeHandler={true}
                            onAddButtonClick={() => {
                                setShowUserForm(true);
                            }}
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
                            <FlexColumn gap={8}>
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
            {showBottomGradient && organizationsStore.currentOrganizationId && currentOrg && (
                <div className={styles.orgCardGradient} />
            )}
            <OrganizationForm
                show={organizationsStore.showAddOverlay}
                setShow={(show) => (organizationsStore.showAddOverlay = show)}
                type={"add"}
            />
            <OrganizationForm
                show={!!organizationsStore.editingOrganization}
                setShow={(show) =>
                    (organizationsStore.editingOrganization = show
                        ? organizationsStore.editingOrganization
                        : null)
                }
                type={"edit"}
                organization={organizationsStore.editingOrganization}
            />
            <DeleteOverlay
                open={organizationsStore.showDeleteOverlay}
                title={"Удалить организацию"}
                subtitle={"Будет удалена организация"}
                bottomSubtitle={
                    "Учётные записи пользователей останутся в системе, но они будут отвязаны от организации."
                }
                info={organizationsStore.deletingOrganization?.name}
                deleteButtonLabel={"Удалить"}
                onDelete={async () => {
                    if (organizationsStore.deletingOrganization) {
                        await organizationsStore.deleteOrganization(
                            organizationsStore.deletingOrganization,
                        );
                        snackbarStore.showNeutralSnackbar("Организация удалена", {
                            showCloseButton: true,
                            icon: <IconBasket />,
                        });
                        organizationsStore.deletingOrganization = null;
                        organizationsStore.showDeleteOverlay = false;
                    }
                }}
                loading={organizationsStore.loading}
                onCancel={() => (organizationsStore.showDeleteOverlay = false)}
            />
            {showUserForm && (
                <UserForm
                    open={showUserForm}
                    setOpen={setShowUserForm}
                    initialOrgId={currentOrg?.id}
                />
            )}
        </div>
    );
});
