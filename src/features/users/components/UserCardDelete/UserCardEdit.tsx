import React, { memo, useEffect, useState } from "react";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import styles from "./UserCardEdit.module.scss";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { appStore } from "src/app/AppStore.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconBasket, IconChat } from "src/ui/assets/icons";
import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import { PhoneInput } from "src/ui/components/inputs/PhoneInput/PhoneInput.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { AutocompleteOption } from "src/ui/components/inputs/Autocomplete/Autocomplete.types.ts";
import { SingleAutocomplete } from "src/ui/components/inputs/Autocomplete/SingleAutocomplete.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { User } from "src/features/users/types/User.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { observer } from "mobx-react-lite";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { emailValidate } from "src/shared/utils/emailValidate.ts";

interface UserFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    currentUser: User;
}

const normalizePhone = (value?: string | null): string => {
    if (!value || value.trim() === "" || value === "+7") return "";
    return value;
};

const UserCardEdit = memo(({ open, setOpen, currentUser }: UserFormProps) => {
    const [userImg, setUserImg] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [patronymic, setPatronym] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [messager, setMessager] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [workphone, setWorkphone] = useState<string>("");
    const [position, setPositionValue] = useState<string | undefined | null>(undefined);
    const [company, setCompany] = useState<string | null>(null);
    const [role, setRole] = useState<"ROOT" | "ADMIN" | "USER" | undefined>();
    const [openDelModal, setOpenDelModal] = useState<boolean>(false);
    const users = appStore.userStore.users;
    const userPosition = [...new Set(users.filter((u) => u.position).map((u) => u.position))];

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
    const organisations = appStore.organizationsStore.organizations;
    const companyOptions: SelectOption<string>[] = organisations.map((org) => ({
        name: org.name,
        value: org.id,
    }));
    const loginUser = appStore.accountStore.currentUser;
    const canEdit = !(loginUser?.id === currentUser?.id || loginUser?.role !== "USER");
    const resetFields = () => {
        setUserImg(null);
        setFirstName("");
        setLastName("");
        setPatronym("");
        setEmail("");
        setMessager("");
        setPhone("");
        setWorkphone("");
        setPositionValue(undefined);
        setCompany(null);
        setRole(undefined);
    };

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
        organizationId: company,
    };
    const onClick = () => {
        if (userForm)
            appStore.userStore.updateUser(userForm as User).then(() => {
                snackbarStore.showNeutralPositiveSnackbar("Изменения сохранены");
                resetFields();

                setOpen(false);
            });
    };
    useEffect(() => {
        setFirstName(currentUser.firstName ?? "");
        setLastName(currentUser.lastName ?? "");
        setEmail(currentUser.email ?? "");
        setRole(currentUser.role);
        if (currentUser.patronymic) setPatronym(currentUser.patronymic);
        if (currentUser.imageId) setUserImg(currentUser.imageId);
        if (currentUser.workPhone) setWorkphone(currentUser.workPhone);
        if (currentUser.personalPhone) setPhone(currentUser.personalPhone);
        if (currentUser.messenger) setMessager(currentUser.messenger);
        if (currentUser.position) setPositionValue(currentUser.position);
        if (currentUser.organizationId) setCompany(currentUser.organizationId);
        return () => {
            resetFields();
        };
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

    const usersEmail = users.map((user) => user.email);
    const emailIsInvalid =
        !emailValidate(email) || (usersEmail.includes(email) && email !== currentUser?.email);

    return (
        <Overlay
            open={open}
            onClose={() => {
                resetFields();
                setOpen(false);
            }}
            title={"Редактировать пользователя"}
            actions={[
                <div className={styles.footer} key={"1"}>
                    <div>
                        <Button
                            mode={"negative"}
                            iconBefore={<IconBasket />}
                            type={"secondary"}
                            onClick={() => setOpenDelModal(true)}
                        >
                            Удалить
                        </Button>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Button mode={"neutral"} type={"outlined"} onClick={() => setOpen(false)}>
                            Отменить
                        </Button>
                        <Button
                            disabled={
                                !email ||
                                !role ||
                                !firstName ||
                                !lastName ||
                                emailIsInvalid ||
                                (!position && role === "USER") ||
                                !shouldBlockButton()
                            }
                            mode={"neutral"}
                            type={"primary"}
                            onClick={onClick}
                        >
                            Сохранить изменения
                        </Button>
                    </div>
                </div>,
            ]}
        >
            <div className={styles.container}>
                <div>
                    <Media
                        readonly={canEdit}
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
                        <div className={styles.header} style={{ opacity: 0.6 }}>
                            Персональная информация
                        </div>
                        <div className={styles.contentPersonal}>
                            <div className={styles.inputPersonal}>
                                <Input
                                    readonly={canEdit}
                                    required={true}
                                    formName={"Имя"}
                                    placeholder={"Введите имя"}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    value={firstName}
                                />
                            </div>
                            <div className={styles.inputPersonal}>
                                <Input
                                    readonly={canEdit}
                                    required={true}
                                    formName={"Фамилия"}
                                    placeholder={"Введите фамилию"}
                                    onChange={(e) => setLastName(e.target.value)}
                                    value={lastName}
                                />
                            </div>
                            <div className={styles.inputPersonal}>
                                <Input
                                    readonly={canEdit}
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
                            <div className={styles.inputContact}>
                                <SingleAutocomplete
                                    disabled={loginUser?.role === "USER"}
                                    zIndex={9999}
                                    value={company}
                                    onValueChange={(e) => setCompany(e as string)}
                                    options={companyOptions}
                                    multiple={false}
                                    placeholder={"Начните писать или выберите из списка"}
                                    formName={"Организация"}
                                ></SingleAutocomplete>
                            </div>
                            <div className={styles.inputContact}>
                                <SingleAutocomplete
                                    disabled={loginUser?.role === "USER" || role !== "USER"}
                                    required={role === "USER"}
                                    zIndex={9999}
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
                            <div className={styles.inputContact}>
                                <Select
                                    required={true}
                                    zIndex={9999}
                                    key={"12"}
                                    value={role}
                                    disabled={loginUser?.role === "USER"}
                                    onValueChange={(v) => {
                                        setRole(v as "ROOT" | "ADMIN" | "USER");
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
                    <div className={styles.formItem}>
                        <div className={styles.header}>
                            <span style={{ opacity: 0.6 }}>Контакты</span>
                            <div className={styles.divider}></div>
                        </div>
                        <div className={styles.contentContact}>
                            <div className={styles.inputContact}>
                                <EmailInput
                                    readonly={canEdit}
                                    required={true}
                                    formName={"Почта"}
                                    placeholder={"example@mail.com"}
                                    onChange={setEmail}
                                    value={email}
                                    error={
                                        usersEmail.includes(email) && email !== currentUser?.email
                                    }
                                    formText={
                                        usersEmail.includes(email) &&
                                        email !== currentUser?.email &&
                                        "Пользователь с такой почтой уже существует"
                                    }
                                    size={"medium"}
                                />
                            </div>
                            <div className={styles.inputContact}>
                                <Input
                                    readonly={canEdit}
                                    startIcon={<IconChat />}
                                    formName={"Месседжер"}
                                    placeholder={"https://example.com"}
                                    onChange={(e) => setMessager(e.target.value)}
                                    value={messager}
                                />
                            </div>

                            <div className={styles.inputContact}>
                                <PhoneInput
                                    readonly={canEdit}
                                    formName={"Рабочий телефон"}
                                    placeholder={"+7"}
                                    onChange={setWorkphone}
                                    value={workphone}
                                    size={"medium"}
                                />
                            </div>
                            <div className={styles.inputContact}>
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
                </div>
            </div>

            <Overlay
                open={openDelModal}
                mode={"negative"}
                onClose={() => setOpenDelModal(false)}
                title={"Удаление пользователя"}
                actions={[
                    <Button
                        mode={"negative"}
                        key={2}
                        onClick={async () => {
                            await appStore.userStore.deleteUser(currentUser.id);
                            snackbarStore.showNeutralPositiveSnackbar("Пользователь удален");

                            setOpen(false);
                        }}
                    >
                        Удалить
                    </Button>,
                    <Button
                        mode={"neutral"}
                        type={"tertiary"}
                        key={1}
                        onClick={() => setOpenDelModal(false)}
                    >
                        Отмена
                    </Button>,
                ]}
            >
                <div className={styles.textFooter}>
                    {" "}
                    Будет удален пользователь:{" "}
                    <b style={{ color: "black" }}>{getFullName(currentUser)}</b>
                </div>
            </Overlay>
        </Overlay>
    );
});

export default UserCardEdit;
UserCardEdit.displayName = "UserCardEdit";
