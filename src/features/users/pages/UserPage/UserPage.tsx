import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UserPage.module.scss";
import { appStore, layoutStore } from "src/app/AppStore.ts";
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
import { emailValidate } from "src/shared/utils/emailValidate.ts";

const normalizePhone = (value?: string | null): string => {
    if (!value || value.trim() === "" || value === "+7") return "";
    return value;
};
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
    const [position, setPositionValue] = useState<string | undefined | null>(null);
    const [company, setCompany] = useState<string | null>(null);
    const [role, setRole] = useState<"ADMIN" | "USER" | undefined>();
    const users = appStore.userStore.users;
    const userPosition = [...new Set(users.filter((u) => u.position).map((u) => u.position))];
    const loginUser = appStore.accountStore.currentUser;
    const canEdit = !(loginUser?.id === currentUser?.id || loginUser?.role !== "USER");
    const usersPositionOptions: AutocompleteOption<string>[] = userPosition.map((user) => ({
        name: user ?? "",
        value: user ?? "",
    }));
    const rolesOptions: SelectOption<"ADMIN" | "USER">[] = [
        { value: "ADMIN", name: "Администратор" },
        {
            value: "USER",
            name: "Пользователь",
        },
    ];
    const organisations = appStore.organizationsStore.organizations;
    const companyOptions: SelectOption<string>[] = organisations.map((org) => ({
        name: org.name,
        value: org.id,
    }));
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
        if (currentUser?.organizationId) setCompany(currentUser.organizationId);
    }, [currentUser]);
    useEffect(() => {
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
        if (currentUser?.organizationId) setCompany(currentUser.organizationId);
    }, [currentUser]);

    const shouldBlockButton = (): boolean => {
        return (
            userImg !== (currentUser?.imageId ?? null) ||
            firstName !== (currentUser?.firstName ?? "") ||
            lastName !== (currentUser?.lastName ?? "") ||
            patronymic !== (currentUser?.patronymic ?? "") ||
            email !== (currentUser?.email ?? "") ||
            messager !== (currentUser?.messenger ?? "") ||
            normalizePhone(phone) !== normalizePhone(currentUser?.personalPhone) ||
            normalizePhone(workphone) !== normalizePhone(currentUser?.workPhone) ||
            position !== currentUser?.position ||
            company !== currentUser?.organizationId ||
            role !== currentUser?.role
        );
    };
    const userForm: Partial<User> = {
        ...currentUser,

        firstName,
        lastName,
        patronymic,
        role: role as "ADMIN" | "USER",
        position: position ?? null,
        messenger: messager,
        workPhone: workphone,
        personalPhone: phone,
        email: email,
        imageId: userImg ?? undefined,
        organizationId: company,
        login: email,
    };
    const onClick = () => {
        if (userForm)
            appStore.userStore.updateUser(userForm as User).then(() => {
                snackbarStore.showNeutralPositiveSnackbar("Изменения сохранены");
            });
    };

    const usersEmail = users.map((user) => user.email);
    const emailIsInvalid =
        !emailValidate(email) || (usersEmail.includes(email) && email !== currentUser?.email);
    useLayoutEffect(() => {
        layoutStore.setHeaderProps({ title: "Профиль", buttonBack: false, showNotification: true });
    }, []);
    const isMobile = layoutStore.isMobile;
    return (
        <div className={styles.body}>
            <div className={styles.headerTop}>
                <div className={clsx(styles.headerItem, styles.active)}>Данные</div>
                <div className={styles.headerItem} style={{ opacity: 0.3 }}>
                    Нет объектов
                </div>
            </div>
            <div className={styles.userForm}>
                <div className={styles.container}>
                    {isMobile ? (
                        <img className={styles.mobileImg} src={fileUrl(userImg)} />
                    ) : (
                        <div>
                            <Media
                                type={"image"}
                                readonly={canEdit}
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
                    )}
                    <div className={styles.formContainer}>
                        <div className={styles.formItem}>
                            {!isMobile && (
                                <div
                                    className={styles.header}
                                    style={{ opacity: 0.6, marginBottom: 16 }}
                                >
                                    Персональная информация
                                </div>
                            )}
                            <div className={styles.contentPersonal}>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        readonly={canEdit || isMobile}
                                        required={!isMobile}
                                        formName={"Имя"}
                                        placeholder={"Введите имя"}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        value={firstName}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        readonly={canEdit || isMobile}
                                        required={!isMobile}
                                        formName={"Фамилия"}
                                        placeholder={"Введите фамилию"}
                                        onChange={(e) => setLastName(e.target.value)}
                                        value={lastName}
                                    />
                                </div>
                                <div className={styles.inputPersonal}>
                                    <Input
                                        readonly={canEdit || isMobile}
                                        formName={"Отчество"}
                                        placeholder={"Введите отчество"}
                                        onChange={(e) => setPatronym(e.target.value)}
                                        value={patronymic}
                                    />
                                </div>
                            </div>
                        </div>
                        {!isMobile && (
                            <div className={styles.formItem}>
                                <div className={styles.header}>
                                    <span style={{ opacity: 0.6 }}>Роль</span>
                                    <div className={styles.divider}></div>
                                </div>
                                <div className={styles.contentContact} style={{ marginBottom: 0 }}>
                                    <div className={styles.inputPersonal}>
                                        <SingleAutocomplete
                                            disabled={loginUser?.role === "USER" || role !== "USER"}
                                            zIndex={9999}
                                            required={role === "USER"}
                                            value={position}
                                            onValueChange={(e) => setPositionValue(e)}
                                            options={usersPositionOptions}
                                            multiple={false}
                                            placeholder={
                                                role === "USER"
                                                    ? "Начните писать или выберите из списка"
                                                    : ""
                                            }
                                            formName={"Должность"}
                                        ></SingleAutocomplete>
                                    </div>
                                    <div className={styles.inputPersonal}>
                                        <Select
                                            disabled={loginUser?.role === "USER"}
                                            required={true}
                                            zIndex={9999}
                                            key={"12"}
                                            value={role}
                                            onValueChange={(v) => {
                                                setRole(v as "ADMIN" | "USER");
                                                if (v !== "USER") setPositionValue(null);
                                            }}
                                            options={rolesOptions}
                                            multiple={false}
                                            placeholder={"Выберите из списка"}
                                            formName={"В системе"}
                                        ></Select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isMobile && (
                            <div className={styles.formItem}>
                                <div className={styles.header}>
                                    <span style={{ opacity: 0.6 }}>Группы</span>
                                    <div className={styles.divider}></div>
                                </div>
                                <div className={styles.contentContact} style={{ marginBottom: 0 }}>
                                    <div className={styles.inputPersonal}>
                                        <SingleAutocomplete
                                            zIndex={9999}
                                            disabled={canEdit}
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
                        )}
                        {!isMobile && (
                            <div className={styles.formItem}>
                                <div className={styles.header}>
                                    <span style={{ opacity: 0.6 }}>Контакты</span>
                                    <div className={styles.divider}></div>
                                </div>
                                <div className={styles.contentContact}>
                                    <div className={styles.inputPersonal}>
                                        <Input
                                            readonly={canEdit}
                                            startIcon={<IconChat />}
                                            formName={"Мессенджер"}
                                            placeholder={"https://example.com"}
                                            onChange={(e) => setMessager(e.target.value)}
                                            value={messager}
                                        />
                                    </div>
                                    <div className={styles.inputPersonal}>
                                        <EmailInput
                                            readonly={canEdit}
                                            required={true}
                                            formName={"Почта"}
                                            placeholder={"example@mail.com"}
                                            onChange={setEmail}
                                            value={email}
                                            size={"medium"}
                                            error={
                                                usersEmail.includes(email) &&
                                                email !== currentUser?.email
                                            }
                                            formText={
                                                usersEmail.includes(email) &&
                                                email !== currentUser?.email &&
                                                "Пользователь с такой почтой уже существует"
                                            }
                                        />
                                    </div>

                                    <div className={styles.inputPersonal}>
                                        <PhoneInput
                                            readonly={canEdit}
                                            formName={"Рабочий телефон"}
                                            placeholder={"+7"}
                                            onChange={setWorkphone}
                                            value={workphone}
                                            size={"medium"}
                                        />
                                    </div>
                                    <div className={styles.inputPersonal}>
                                        <PhoneInput
                                            readonly={canEdit}
                                            formName={"Личный телефон"}
                                            placeholder={"+7"}
                                            onChange={setPhone}
                                            value={phone}
                                            size={"medium"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
                                        emailIsInvalid ||
                                        !role ||
                                        !firstName ||
                                        !lastName ||
                                        !shouldBlockButton() ||
                                        (!position && role === "USER")
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
                    {isMobile && (
                        <div style={{ marginTop: "auto", marginBottom: 24 }}>
                            <Button
                                mode={"negative"}
                                type={"secondary"}
                                fullWidth={true}
                                onClick={() => appStore.accountStore.logout()}
                            >
                                Выйти из аккаунта
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default UserPage;
