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

export const eventConstructionViolationActionLocale: Record<string, string> = {
    create: "Создание нарушения",
    update: "Редактирование нарушения",
    delete: "Удаление нарушения",
};

export const eventConstructionWorkActionLocale: Record<string, string> = {
    create: "Создание работы",
    update: "Редактирование работы",
    delete: "Удаление работы",
};

export const projectActionLocale: Record<string, string> = {
    create: "Создание объекта",
    update: "Редактирование объекта",
    delete: "Удаление объекта",
};

export const projectViolationActionLocale: Record<string, string> = {
    create: "Создание нарушения",
    update: "Редактирование нарушения",
    delete: "Удаление нарушения",
};

export const projectWorkActionLocale: Record<string, string> = {
    create: "Создание работы",
    update: "Редактирование работы",
    delete: "Удаление работы",
};

export const projectWorkVersionActionLocale: Record<string, string> = {
    create: "Создание версии работы",
    update: "Редактирование версии работы",
    delete: "Удаление версии работы",
};

export const projectWorkCommentActionLocale: Record<string, string> = {
    create: "Отправка комментария",
    update: "Редактирование комментария",
    delete: "Удаление комментария",
};

export const eventActionLocale = {
    user: eventUserActionLocale,
    organization: eventOrganizationActionLocale,
    "organization-employees": eventOrganizationActionLocale,
    "normative-document": eventNormativeDocumentActionLocale,
    "construction-violation": eventConstructionViolationActionLocale,
    "construction-work": eventConstructionWorkActionLocale,
    "construction-work-stage": eventConstructionWorkActionLocale,
    project: projectActionLocale,
    "project-violation": projectViolationActionLocale,
    "project-work": projectWorkActionLocale,
    "project-work-version": projectWorkVersionActionLocale,
    "project-work-comment": projectWorkCommentActionLocale,
};

export const autocompleteActionLocaleOptions = Object.entries(eventActionLocale)
    .flatMap((entry) =>
        Object.entries(entry[1]).map((entityEntry) => ({
            name: entityEntry[1],
            value: `${entry[0]}.${entityEntry[0]}`,
        })),
    )
    .filter((item, index, array) => array.findIndex((_item) => item.name === _item.name) === index);
