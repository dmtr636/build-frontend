import React, { useEffect, useState } from "react";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import styles from "./UserForm.module.scss";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { appStore } from "src/app/AppStore.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconChat } from "src/ui/assets/icons";
import { EmailInput } from "src/ui/components/inputs/EmailInput/EmailInput.tsx";
import { PhoneInput } from "src/ui/components/inputs/PhoneInput/PhoneInput.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { AutocompleteOption } from "src/ui/components/inputs/Autocomplete/Autocomplete.types.ts";
import { SingleAutocomplete } from "src/ui/components/inputs/Autocomplete/SingleAutocomplete.tsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { User } from "src/features/users/types/User.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { emailValidate } from "src/shared/utils/emailValidate.ts";

interface UserFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialOrgId?: string;
    onSave?: (user: User) => void;
}

const UserForm = ({ open, setOpen, initialOrgId, onSave }: UserFormProps) => {
    const [userImg, setUserImg] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [patronymic, setPatronym] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [messager, setMessager] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [workphone, setWorkphone] = useState<string>("");
    const [position, setPositionValue] = useState<string | undefined | null>(undefined);
    const users = appStore.userStore.users;
    const [role, setRole] = useState<"ROOT" | "ADMIN" | "USER">();
    const userPosition = [...new Set(users?.filter((u) => u.position).map((u) => u.position))];
    const [company, setCompany] = useState<string | null>(null);
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

    useEffect(() => {
        if (initialOrgId) {
            setCompany(initialOrgId);
        }
    }, [initialOrgId]);

    const userForm: Partial<User> = {
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
        organizationId: company,
        login: email,
        password: "kydas-team-password", // TODO: Для тестирования ставим всем юзерам такой пароль, в проде уберём
    };
    const onClick = () => {
        if (userForm)
            appStore.userStore.createUser(userForm as User).then((resposne) => {
                snackbarStore.showPositiveSnackbar("Пользователь создан");
                setOpen(false);
                if (resposne.data) {
                    onSave?.(resposne.data);
                }
            });
    };
    return (
        <Overlay open={open} onClose={() => setOpen(false)} title={"Новый пользователь"}>
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
                        <div className={styles.header} style={{ opacity: 0.6 }}>
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
                            <div className={styles.inputContact}>
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
                            <div className={styles.inputContact}>
                                <SingleAutocomplete
                                    zIndex={9999}
                                    value={position}
                                    onValueChange={(e) => setPositionValue(e)}
                                    options={usersPositionOptions}
                                    multiple={false}
                                    placeholder={"Начните писать или выберите из списка"}
                                    formName={"Должность"}
                                ></SingleAutocomplete>
                            </div>
                            <div className={styles.inputContact}>
                                {/*<MultipleSelect
                                    values={rolesValue}
                                    onValuesChange={setRole}
                                    placeholder={"Все"}
                                    options={rolesOptions}
                                    multiple={true}
                                    formName={"В системе"}
                                ></MultipleSelect>*/}
                                <Select
                                    required={true}
                                    zIndex={9999}
                                    key={"12"}
                                    value={role}
                                    onValueChange={(v) => {
                                        console.log(v);
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
                            <span style={{ opacity: 0.6 }}>Контакты</span>
                            <div className={styles.divider}></div>
                        </div>
                        <div className={styles.contentContact}>
                            <div className={styles.inputContact}>
                                <EmailInput
                                    required={true}
                                    formName={"Почта"}
                                    placeholder={"example@mail.com"}
                                    onChange={setEmail}
                                    value={email}
                                    size={"medium"}
                                />
                            </div>
                            <div className={styles.inputContact}>
                                <Input
                                    startIcon={<IconChat />}
                                    formName={"Месседжер"}
                                    placeholder={"https://example.com"}
                                    onChange={(e) => setMessager(e.target.value)}
                                    value={messager}
                                />
                            </div>

                            <div className={styles.inputContact}>
                                <PhoneInput
                                    formName={"Рабочий телефон"}
                                    placeholder={"+7"}
                                    onChange={setWorkphone}
                                    value={workphone}
                                    size={"medium"}
                                />
                            </div>
                            <div className={styles.inputContact}>
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
                <div className={styles.footer}>
                    <Button mode={"neutral"} type={"outlined"} onClick={() => setOpen(false)}>
                        Отменить
                    </Button>
                    <Button
                        disabled={
                            !email || !role || !firstName || !emailValidate(email) || !lastName
                        }
                        mode={"neutral"}
                        type={"primary"}
                        onClick={onClick}
                    >
                        Создать пользователя
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};

export default UserForm;
