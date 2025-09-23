import React, { useLayoutEffect, useMemo, useState } from "react";
import styles from "./ObjectUsersPage.module.scss";
import { IconGroupBuild, IconPlus } from "src/ui/assets/icons";
import { appStore } from "src/app/AppStore.ts";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import CompanyCardItem from "src/features/journal/components/CompanyCardItem/CompanyCardItem.tsx";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { Divider } from "src/ui/components/atoms/Divider/Divider.tsx";
import { observer } from "mobx-react-lite";
import UserCardItem from "src/features/journal/components/UserCardItem/UserCardItem.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

const ObjectUsersPage = observer(() => {
    const organisationOptions = appStore.organizationsStore.organizations.map((org) => ({
        name: org.name,
        value: org.id,
    }));
    useLayoutEffect(() => {
        appStore.userStore.fetchOnlineUser();
    }, []);
    const [customerOrganizations, setCustomerOrganizations] = useState<string | null>(null);
    const [contractorOrganizations, setContractorOrganizations] = useState<string | null>(null);
    const [responsibleCutomerUser, setResponsibleCutomerUser] = useState<string | null>(null);
    const [responibleContractorUser, setResponsibleContractorUser] = useState<string | null>(null);
    const [customArrayUser, setCustomArrayUser] = useState<string[]>([]);
    const [contractorArrayUser, setContractorArrayUser] = useState<string[]>([]);
    const customerOrg = appStore.organizationsStore.organizationById(customerOrganizations);
    const contractorOrg = appStore.organizationsStore.organizationById(contractorOrganizations);
    const respCustUser = appStore.userStore.userById(responsibleCutomerUser);
    const respContrUser = appStore.userStore.userById(responibleContractorUser);

    const users = appStore.userStore.users;
    const usersOptions = users.map((org) => ({
        name: getFullName(org),
        value: org.id,
    }));
    const usersOnline = appStore.userStore.usersOnline;
    const onlineIds = Object.entries<any>(usersOnline)
        .filter(([_, value]) => value.status === "online")
        .map(([id]) => id);
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconGroupBuild />
                </div>
                Участники
            </div>
            <div className={styles.content}>
                <div className={styles.itemForm}>
                    <div className={styles.formName}>Заказчик</div>
                    <div style={{ width: "100%" }}>
                        {customerOrganizations && customerOrg ? (
                            <CompanyCardItem
                                onClear={() => setCustomerOrganizations(null)}
                                organization={customerOrg}
                            />
                        ) : (
                            <Autocomplete
                                size={"large"}
                                iconBefore={<IconPlus />}
                                formName={"Организация"}
                                placeholder={"Введите название или выберите из списка"}
                                options={organisationOptions.filter(
                                    (org) => org.value !== contractorOrganizations,
                                )}
                                value={customerOrganizations}
                                onValueChange={setCustomerOrganizations}
                            />
                        )}
                    </div>
                    <div style={{ width: "100%" }}>
                        <Autocomplete
                            size={"large"}
                            iconBefore={<IconPlus />}
                            formName={"Добавить пользователя в объект"}
                            placeholder={"Введите имя или выберите из списка"}
                            options={usersOptions.filter(
                                (org) => !customArrayUser.some((item) => org.value === item),
                            )}
                            value={null}
                            onValueChange={(value) => {
                                if (customArrayUser.length === 0) {
                                    setResponsibleCutomerUser(value);
                                }
                                setCustomArrayUser((prevState) =>
                                    value ? [...prevState, value] : prevState,
                                );
                            }}
                        />
                    </div>
                    {customArrayUser.length > 0 && (
                        <div>
                            <Divider
                                direction={"horizontal"}
                                type={"secondary"}
                                mode={"neutral"}
                                style={{
                                    margin: "4px -20px",
                                    marginBottom: 24,
                                }}
                            />
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                    marginBottom: 24,
                                }}
                            >
                                <Typo
                                    variant={"subheadXL"}
                                    type={"quaternary"}
                                    style={{ opacity: 0.7 }}
                                >
                                    Ответственный на объекте
                                </Typo>
                                {responsibleCutomerUser && respCustUser ? (
                                    <UserCardItem
                                        enabled={onlineIds.includes(respCustUser.id)}
                                        isResponseUser={true}
                                        onClick={() => setResponsibleCutomerUser(null)}
                                        onClickDelete={() => {
                                            setResponsibleCutomerUser(null);
                                            setCustomArrayUser((prevState) =>
                                                prevState.filter(
                                                    (user) => user !== responsibleCutomerUser,
                                                ),
                                            );
                                        }}
                                        user={respCustUser}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 16,
                                        }}
                                    >
                                        <Autocomplete
                                            size={"large"}
                                            iconBefore={<IconPlus />}
                                            placeholder={"Введите имя или выберите из списка"}
                                            options={customArrayUser.map((org) => ({
                                                name: getFullName(appStore.userStore.userById(org)),
                                                value: org,
                                            }))}
                                            value={null}
                                            onValueChange={setResponsibleCutomerUser}
                                        />
                                    </div>
                                )}
                            </div>
                            {customArrayUser.filter((item) => item !== responsibleCutomerUser)
                                .length > 0 && (
                                <div>
                                    <Typo
                                        variant={"subheadXL"}
                                        type={"quaternary"}
                                        style={{ opacity: 0.7 }}
                                    >
                                        Участники
                                    </Typo>
                                    <div className={styles.usersArray}>
                                        {customArrayUser
                                            .filter((item) => item !== responsibleCutomerUser)
                                            .map((user) => (
                                                <UserCardItem
                                                    key={1}
                                                    enabled={onlineIds.includes(user)}
                                                    user={appStore.userStore.userById(user) as any}
                                                    onClick={() => setResponsibleCutomerUser(user)}
                                                    onClickDelete={() => {
                                                        if (user === responsibleCutomerUser) {
                                                            setResponsibleCutomerUser(null);
                                                        }
                                                        setCustomArrayUser((prevState) =>
                                                            prevState.filter(
                                                                (item) => item !== user,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className={styles.itemForm}>
                    <div className={styles.formName}>Подрядчик</div>
                    <div style={{ width: "100%" }}>
                        {contractorOrganizations && contractorOrg ? (
                            <CompanyCardItem
                                onClear={() => setContractorOrganizations(null)}
                                organization={contractorOrg}
                            />
                        ) : (
                            <Autocomplete
                                size={"large"}
                                iconBefore={<IconPlus />}
                                formName={"Организация"}
                                placeholder={"Введите название или выберите из списка"}
                                options={organisationOptions.filter(
                                    (org) => org.value !== customerOrganizations,
                                )}
                                value={customerOrganizations}
                                onValueChange={setContractorOrganizations}
                            />
                        )}
                    </div>
                    <div style={{ width: "100%" }}>
                        <Autocomplete
                            size={"large"}
                            iconBefore={<IconPlus />}
                            formName={"Добавить пользователя в объект"}
                            placeholder={"Введите имя или выберите из списка"}
                            options={usersOptions.filter(
                                (org) => !contractorArrayUser.some((item) => org.value === item),
                            )}
                            value={null}
                            onValueChange={(value) => {
                                if (contractorArrayUser.length === 0) {
                                    setResponsibleContractorUser(value);
                                }
                                setContractorArrayUser((prevState) =>
                                    value ? [...prevState, value] : prevState,
                                );
                            }}
                        />
                    </div>
                    {contractorArrayUser.length > 0 && (
                        <div>
                            <Divider
                                direction={"horizontal"}
                                type={"secondary"}
                                mode={"neutral"}
                                style={{
                                    margin: "4px -20px",
                                    marginBottom: 24,
                                }}
                            />
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                    marginBottom: 24,
                                }}
                            >
                                <Typo
                                    variant={"subheadXL"}
                                    type={"quaternary"}
                                    style={{ opacity: 0.7 }}
                                >
                                    Ответственный на объекте
                                </Typo>
                                {responibleContractorUser && respContrUser ? (
                                    <UserCardItem
                                        isResponseUser={true}
                                        onClick={() => setResponsibleContractorUser(null)}
                                        onClickDelete={() => {
                                            setResponsibleContractorUser(null);
                                            setContractorArrayUser((prevState) =>
                                                prevState.filter(
                                                    (user) => user !== responibleContractorUser,
                                                ),
                                            );
                                        }}
                                        enabled={onlineIds.includes(respContrUser.id)}
                                        user={respContrUser}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 16,
                                        }}
                                    >
                                        <Autocomplete
                                            size={"large"}
                                            iconBefore={<IconPlus />}
                                            placeholder={"Введите имя или выберите из списка"}
                                            options={contractorArrayUser.map((org) => ({
                                                name: getFullName(appStore.userStore.userById(org)),
                                                value: org,
                                            }))}
                                            value={null}
                                            onValueChange={setResponsibleContractorUser}
                                        />
                                    </div>
                                )}
                            </div>
                            {contractorArrayUser.filter((item) => item !== responibleContractorUser)
                                .length > 0 && (
                                <div>
                                    <Typo
                                        variant={"subheadXL"}
                                        type={"quaternary"}
                                        style={{ opacity: 0.7 }}
                                    >
                                        Участники
                                    </Typo>
                                    <div className={styles.usersArray}>
                                        {contractorArrayUser
                                            .filter((item) => item !== responibleContractorUser)
                                            .map((user) => (
                                                <UserCardItem
                                                    key={1}
                                                    enabled={onlineIds.includes(user)}
                                                    user={appStore.userStore.userById(user) as any}
                                                    onClick={() =>
                                                        setResponsibleContractorUser(user)
                                                    }
                                                    onClickDelete={() => {
                                                        if (user === responsibleCutomerUser) {
                                                            setResponsibleContractorUser(null);
                                                        }
                                                        setContractorArrayUser((prevState) =>
                                                            prevState.filter(
                                                                (item) => item !== user,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ObjectUsersPage;
