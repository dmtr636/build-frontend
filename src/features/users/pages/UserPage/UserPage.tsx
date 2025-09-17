import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UserPage.module.scss";
import { appStore } from "src/app/AppStore.ts";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { SingleAutocomplete } from "src/ui/components/inputs/Autocomplete/SingleAutocomplete.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import { IconChat } from "src/ui/assets/icons";
import { PhoneInput } from "src/ui/components/inputs/PhoneInput/PhoneInput.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { AutocompleteOption } from "src/ui/components/inputs/Autocomplete/Autocomplete.types.ts";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { observer } from "mobx-react-lite";
import { clsx } from "clsx";
import { User } from "src/features/users/types/User.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

const UserPage = observer(() => {
    const { id } = useParams();
    const currentUser = appStore.userStore.users.find((user) => user.id === id);
    const navigate = useNavigate();

    const [userImg, setUserImg] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [patronymic, setPatronym] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [messager, setMessager] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [workphone, setWorkphone] = useState<string>("");
    const [position, setPositionValue] = useState<string | undefined | null>(undefined);
    const [company, setCompany] = useState<string>("");
    const [role, setRole] = useState<"ROOT" | "ADMIN" | "USER" | undefined>();
    const users = appStore.userStore.users;
    const userPosition = [...new Set(users.filter((u) => u.position).map((u) => u.position))];
    const currentUserIsAdmin = appStore.accountStore.currentUser?.role !== "USER";

    const usersPositionOptions: AutocompleteOption<string>[] = userPosition.map((user) => ({
        name: user ?? "",
        value: user ?? "",
    }));
    const rolesOptions: SelectOption<"ROOT" | "ADMIN" | "USER">[] = [
        { value: "ADMIN", name: "Администратор" },
        {
            value: "USER",
            name: "Пользователь",
        },
        {
            value: "ROOT",
            name: "ROOT",
        },
    ];
    const companyOptions: SelectOption<string>[] = [
        { value: "Яндекс", name: "Яндекс" },
        {
            value: "Самолет",
            name: "Самолет",
        },
        {
            value: "DOGMA",
            name: "DOGMA",
        },
    ];
    const setInitialValue = useCallback(() => {
        setFirstName(currentUser?.firstName ?? "");
        setLastName(currentUser?.lastName ?? "");
        setEmail(currentUser?.email ?? "");
        setRole(currentUser?.role);
        if (currentUser?.patronymic) setPatronym(currentUser.patronymic);
        if (currentUser?.imageId) setUserImg(currentUser.imageId);
        if (currentUser?.workPhone) setWorkphone(currentUser.workPhone);
        if (currentUser?.personalPhone) setPhone(currentUser.personalPhone);
        if (currentUser?.messenger) setMessager(currentUser.messenger);
        if (currentUser?.position) setPositionValue(currentUser.position);
    }, [currentUser]);
    useEffect(() => {
        console.log(currentUser);
        setInitialValue();
    }, [currentUser]);
    const shouldBlockButton = (): boolean => {
        return (
            userImg !== (currentUser?.imageId ?? null) ||
            firstName !== (currentUser?.firstName ?? "") ||
            lastName !== (currentUser?.lastName ?? "") ||
            patronymic !== (currentUser?.patronymic ?? "") ||
            email !== (currentUser?.email ?? "") ||
            messager !== (currentUser?.messenger ?? "") ||
            phone !== (currentUser?.personalPhone ?? "") ||
            workphone !== (currentUser?.workPhone ?? "") ||
            position !== (currentUser?.position ?? null) ||
            company !== (currentUser?.company ?? "") ||
            role !== currentUser?.role
        );
    };
    if (!currentUser) {
        navigate("/admin/users");
    }
    const userForm: Partial<User> = {
        ...currentUser,

        firstName,
        lastName,
        patronymic,
        role: role as "ROOT" | "ADMIN" | "USER",
        position: position ?? "",
        messenger: messager,
        workPhone: workphone,
        personalPhone: phone,
        email: email,
        imageId: userImg ?? undefined,
        login: email,
    };
    const onClick = () => {
        if (userForm)
            appStore.userStore.updateUser(userForm as User).then(() => {
                snackbarStore.showPositiveSnackbar("Пользователь изменен");
            });
    };
    return (
        <div className={styles.body}>
            <div className={styles.header}>
                <div className={clsx(styles.headerItem, styles.active)}>Данные</div>
                <div className={styles.headerItem} style={{ opacity: 0.3 }}>
                    Нет объектов
                </div>
            </div>
            <div className={styles.userForm}>
                <div className={styles.container}>
                    <div>
                        <Media
                            type={"image"}
                            style={{ width: 150, height: 170 }}
                            url={fileUrl(userImg)}
                            onSelectFile={async (file) => {
                                const imageId = await appStore.accountStore.uploadMediaFile(
                                    file,
                                    "PROFILE_IMAGE",
                                );
                                setUserImg(imageId);
                            }}
                            onRemoveFile={() => {
                                setUserImg(null);
                            }}
                            resolution={[160, 192]}
                            maxSizeMB={100}
                        />
                    </div>
                    <div className={styles.formContainer}>
                        <div className={styles.formItem}>
                            <div
                                className={styles.header}
                                style={{ opacity: 0.6, marginBottom: 16 }}
                            >
                                Персональная информация
                            </div>
                            <div className={styles.contentPersonal}>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        required={true}
                                        formName={"Имя"}
                                        placeholder={"Введите имя"}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        value={firstName}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        required={true}
                                        formName={"Фамилия"}
                                        placeholder={"Введите фамилию"}
                                        onChange={(e) => setLastName(e.target.value)}
                                        value={lastName}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        formName={"Отчество"}
                                        placeholder={"Введите отчество"}
                                        onChange={(e) => setPatronym(e.target.value)}
                                        value={patronymic}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.formItem}>
                            <div className={styles.header}>
                                <span style={{ opacity: 0.6 }}>Роль</span>
                                <div className={styles.divider}></div>
                            </div>
                            <div className={styles.contentContact} style={{ marginBottom: 0 }}>
                                <div className={styles.inputPersonal}>
                                    <SingleAutocomplete
                                        disabled={!currentUserIsAdmin}
                                        zIndex={9999}
                                        value={position}
                                        onValueChange={(e) => setPositionValue(e)}
                                        options={usersPositionOptions}
                                        multiple={false}
                                        placeholder={"Начните писать или выберите из списка"}
                                        formName={"Должность"}
                                    ></SingleAutocomplete>
                                </div>
                                <div className={styles.inputPersonal}>
                                    <Select
                                        disabled={!currentUserIsAdmin}
                                        required={true}
                                        zIndex={9999}
                                        key={"12"}
                                        value={role}
                                        onValueChange={(v) => {
                                            setRole(v as "ROOT" | "ADMIN" | "USER");
                                        }}
                                        options={rolesOptions}
                                        multiple={false}
                                        placeholder={"Выберите из списка"}
                                        formName={"В системе"}
                                    ></Select>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formItem}>
                            <div className={styles.header}>
                                <span style={{ opacity: 0.6 }}>Группы</span>
                                <div className={styles.divider}></div>
                            </div>
                            <div className={styles.contentContact} style={{ marginBottom: 0 }}>
                                <div className={styles.inputPersonal}>
                                    <SingleAutocomplete
                                        zIndex={9999}
                                        value={company}
                                        onValueChange={(e) => setCompany(e as string)}
                                        options={companyOptions}
                                        multiple={false}
                                        placeholder={"Начните писать или выберите из списка"}
                                        formName={"Организация"}
                                    ></SingleAutocomplete>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formItem}>
                            <div className={styles.header}>
                                <span style={{ opacity: 0.6 }}>Контакты</span>
                                <div className={styles.divider}></div>
                            </div>
                            <div className={styles.contentContact}>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        startIcon={<IconChat />}
                                        formName={"Мессенджер"}
                                        placeholder={"https://example.com"}
                                        onChange={(e) => setMessager(e.target.value)}
                                        value={messager}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <EmailInput
                                        required={true}
                                        formName={"Почта"}
                                        placeholder={"example@mail.com"}
                                        onChange={setEmail}
                                        value={email}
                                        size={"medium"}
                                    />
                                </div>

                                <div className={styles.inputPersonal}>
                                    <PhoneInput
                                        formName={"Рабочий телефон"}
                                        placeholder={"+7"}
                                        onChange={setWorkphone}
                                        value={workphone}
                                        size={"medium"}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <PhoneInput
                                        formName={"Личный телефон"}
                                        placeholder={"+7"}
                                        onChange={setPhone}
                                        value={phone}
                                        size={"medium"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {shouldBlockButton() && (
                        <div className={styles.footer}>
                            <div style={{ display: "flex", gap: 16 }}>
                                <Button
                                    mode={"neutral"}
                                    type={"outlined"}
                                    onClick={() => setInitialValue()}
                                >
                                    Отменить
                                </Button>
                                <Button
                                    disabled={
                                        !email ||
                                        !role ||
                                        !firstName ||
                                        !lastName ||
                                        !shouldBlockButton()
                                    }
                                    mode={"neutral"}
                                    type={"primary"}
                                    onClick={onClick}
                                >
                                    Сохранить изменения
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default UserPage;
