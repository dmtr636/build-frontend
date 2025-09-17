import { observer } from "mobx-react-lite";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Organization } from "src/features/organizations/Organization.ts";
import { makeAutoObservable } from "mobx";
import { deepCopy } from "src/shared/utils/deepCopy.ts";
import React, { useEffect, useMemo } from "react";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { appStore, organizationsStore, userStore } from "src/app/AppStore.ts";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { IconBasket, IconError, IconGroup, IconPlus } from "src/ui/assets/icons";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import styles from "./OrganizationForm.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";
import { numDecl } from "src/shared/utils/numDecl.ts";
import UserItemCard from "src/features/organizations/UserItemCard/UserItemCard.tsx";
import { User } from "src/features/users/types/User.ts";
import { DeleteOverlay } from "src/ui/components/segments/overlays/DeleteOverlay/DeleteOverlay.tsx";

interface Props {
    show: boolean;
    setShow: (show: boolean) => void;
    type: "add" | "edit";
    organization?: Organization | null;
}

class ViewModel {
    organization: Organization | null;
    form: Partial<Organization>;

    constructor(props: Props) {
        this.organization = props.organization ?? null;
        this.form = deepCopy(props.organization ?? {});
        makeAutoObservable(this);
    }

    get currentOrgUsers() {
        return this.form.employees ?? [];
    }

    get filteredCurrentOrgUsers() {
        if (!organizationsStore.overlaySearch) {
            return this.currentOrgUsers;
        }
        return this.currentOrgUsers.filter((u) =>
            getNameInitials(u)
                .toLowerCase()
                .includes(organizationsStore.overlaySearch.toLowerCase()),
        );
    }
}

export const OrganizationForm = observer((props: Props) => {
    const vm = useMemo(() => new ViewModel(props), [props.organization?.id]);
    const availableUsers = userStore.users.filter(
        (u) => !u.organizationId && !vm.form.employees?.some((e) => e.id === u.id),
    );
    const usersOnline = appStore.userStore.usersOnline;

    useEffect(() => {
        if (!props.show) {
            vm.form = deepCopy(props.organization ?? {});
            organizationsStore.overlaySearch = "";
        }
    }, [props.show]);

    return (
        <>
            <Overlay
                open={props.show}
                title={props.type === "add" ? "Новая организация" : "Редактирование организации"}
                onClose={() => props.setShow(false)}
                styles={{
                    card: {
                        width: 758,
                    },
                }}
            >
                <Flex gap={24}>
                    <Media
                        type={"image"}
                        style={{ width: 200, height: 200 }}
                        url={fileUrl(vm.form.imageId)}
                        onSelectFile={async (file) => {
                            vm.form.imageId = await appStore.accountStore.uploadMediaFile(
                                file,
                                "PROFILE_IMAGE",
                            );
                        }}
                        onRemoveFile={() => {
                            vm.form.imageId = undefined;
                        }}
                        resolution={[200, 200]}
                        maxSizeMB={100}
                        formName={"Логотип организации"}
                    />
                    <FlexColumn gap={20} style={{ marginTop: 38, width: 486 }}>
                        <Input
                            onChange={(e) => (vm.form.name = e.target.value)}
                            value={vm.form.name}
                            formName={"Название организации"}
                            required={true}
                            placeholder={"Введите название организации"}
                        />
                        <Autocomplete
                            zIndex={100}
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
                                    if (!vm.form.employees) {
                                        vm.form.employees = [];
                                    }
                                    if (vm.form.employees) {
                                        const user = userStore.usersMap.get(value);
                                        if (user) {
                                            vm.form.employees.push(user);
                                        }
                                    }
                                }
                            }}
                            disableChangeHandler={true}
                            onAddButtonClick={() => {}}
                            addButtonLabel={"Добавить пользователя"}
                            formName={"Добавить пользователя в организацию"}
                            placeholder={"Введите имя или выберите из списка"}
                            iconBefore={<IconPlus />}
                        />
                    </FlexColumn>
                </Flex>
                {!vm.form.employees?.length && (
                    <div className={styles.noUsersInOrg}>
                        <IconGroup className={styles.icon} />
                        <Typo variant={"actionXL"} type={"secondary"} mode={"neutral"}>
                            Пока нет пользователей <br />в организации
                        </Typo>
                    </div>
                )}
                {!!vm.form.employees?.length && (
                    <FlexColumn
                        style={{
                            marginTop: 20,
                        }}
                    >
                        <ExplorationInput
                            onInputChange={(value) => (organizationsStore.overlaySearch = value)}
                            inputValue={organizationsStore.overlaySearch}
                            size={"medium"}
                            inputPlaceholder={"Найти по имени"}
                        />
                        <Spacing height={12} />
                        {!!vm.currentOrgUsers.length &&
                            !vm.filteredCurrentOrgUsers.length &&
                            organizationsStore.overlaySearch && (
                                <>
                                    <Spacing height={13} />
                                    <div className={styles.noUsersInOrg}>
                                        <IconError className={styles.icon} />
                                        <Typo
                                            variant={"actionXL"}
                                            type={"secondary"}
                                            mode={"neutral"}
                                        >
                                            Не нашли пользователя <br />с таким именем
                                        </Typo>
                                    </div>
                                    <Spacing height={22} />
                                </>
                            )}

                        {!organizationsStore.overlaySearch && (
                            <>
                                <Flex gap={4}>
                                    <Typo
                                        variant={"actionM"}
                                        type={"quaternary"}
                                        mode={"neutral"}
                                        style={{ opacity: 0.6 }}
                                    >
                                        Состоят в организации
                                    </Typo>
                                    <Typo variant={"actionM"} type={"quaternary"} mode={"neutral"}>
                                        {vm.form.employees.length}{" "}
                                        {numDecl(vm.form?.employees.length, [
                                            "пользователя",
                                            "пользователя",
                                            "пользователей",
                                        ])}
                                    </Typo>
                                </Flex>
                                <Spacing height={20} />
                            </>
                        )}
                        {!!vm.filteredCurrentOrgUsers?.length && (
                            <FlexColumn
                                gap={8}
                                style={{
                                    height: organizationsStore.overlaySearch ? 299 : 260,
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    paddingRight: 32,
                                    marginRight: -32,
                                }}
                            >
                                {vm.filteredCurrentOrgUsers?.map((u) => (
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
                                        onDelete={() => {
                                            vm.form.employees = vm.form.employees?.filter(
                                                (e) => e.id !== u.id,
                                            );
                                        }}
                                    />
                                ))}
                                <Spacing height={20} />
                            </FlexColumn>
                        )}
                    </FlexColumn>
                )}
                <div className={styles.gradient} />
                <div className={styles.overlayFooter}>
                    {props.type === "add" ? (
                        <Flex gap={16} justify={"end"} width={"100%"}>
                            <Button
                                type={"outlined"}
                                mode={"neutral"}
                                onClick={() => {
                                    props.setShow(false);
                                }}
                            >
                                Отменить
                            </Button>
                            <Button
                                mode={"neutral"}
                                onClick={async () => {
                                    const result = await organizationsStore.createOrganization(
                                        vm.form,
                                    );
                                    if (result) {
                                        snackbarStore.showNeutralPositiveSnackbar(
                                            "Организация создана",
                                        );
                                        props.setShow(false);
                                    }
                                }}
                                loading={organizationsStore.loading}
                                disabled={!vm.form.name}
                            >
                                Создать организацию
                            </Button>
                        </Flex>
                    ) : (
                        <Flex gap={16} width={"100%"}>
                            <Button
                                mode={"negative"}
                                type={"secondary"}
                                iconBefore={<IconBasket />}
                                onClick={() => {
                                    organizationsStore.deletingOrganization = vm.organization;
                                    organizationsStore.showDeleteOverlay = true;
                                }}
                            >
                                Удалить организацию
                            </Button>
                            {(vm.form.name !== vm.organization?.name ||
                                vm.form.imageId !== vm.organization?.imageId ||
                                vm.form.employees?.some(
                                    (e) => !vm.organization?.employees.find((_e) => _e.id === e.id),
                                ) ||
                                vm.organization?.employees?.some(
                                    (e) => !vm.form?.employees?.find((_e) => _e.id === e.id),
                                )) && (
                                <Flex gap={16} style={{ marginLeft: "auto" }}>
                                    <Button
                                        type={"outlined"}
                                        mode={"neutral"}
                                        onClick={() => {
                                            vm.form = deepCopy(vm.organization ?? {});
                                        }}
                                    >
                                        Отменить
                                    </Button>
                                    <Button
                                        mode={"neutral"}
                                        onClick={async () => {
                                            if (vm.organization) {
                                                await organizationsStore.updateOrganization(
                                                    vm.form as Organization,
                                                    vm.organization,
                                                );
                                                snackbarStore.showNeutralPositiveSnackbar(
                                                    "Изменения сохранены",
                                                );
                                                props.setShow(false);
                                            }
                                        }}
                                        loading={organizationsStore.loading}
                                        disabled={!vm.form.name}
                                    >
                                        Сохранить изменения
                                    </Button>
                                </Flex>
                            )}
                        </Flex>
                    )}
                </div>
            </Overlay>
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
                        organizationsStore.editingOrganization = null;
                        props.setShow(false);
                    }
                }}
                loading={organizationsStore.loading}
                onCancel={() => (organizationsStore.showDeleteOverlay = false)}
            />
        </>
    );
});
