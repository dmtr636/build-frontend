export const eventUserActionLocale: Record<string, string> = {
    create: "Создание пользователя",
    update: "Редактирование пользователя",
    delete: "Удаление пользователя",
};

export const eventOrganizationActionLocale: Record<string, string> = {
    create: "Создание организации",
    update: "Редактирование организации",
    delete: "Удаление организации",
};

export const eventNormativeDocumentActionLocale: Record<string, string> = {
    create: "Создание нормативного документа",
    update: "Редактирование нормативного документа",
    delete: "Удаление нормативного документа",
};

export const eventActionLocale = {
    user: eventUserActionLocale,
    organization: eventOrganizationActionLocale,
    "organization-employees": eventOrganizationActionLocale,
    "normative-document": eventNormativeDocumentActionLocale,
};

export const autocompleteActionLocaleOptions = Object.entries(eventActionLocale)
    .flatMap((entry) =>
        Object.entries(entry[1]).map((entityEntry) => ({
            name: entityEntry[1],
            value: `${entry[0]}.${entityEntry[0]}`,
        })),
    )
    .filter((item, index, array) => array.findIndex((_item) => item.name === _item.name) === index);
