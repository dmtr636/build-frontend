import { ApiExceptionCode } from "src/shared/api/ApiException.ts";

export const defaultExceptionCodeLocalization: Record<ApiExceptionCode, string> = {
    AlreadyExistsException: "Объект уже существует",
    ApiException: "Неизвестная ошибка",
    AuthenticationException: "Ошибка авторизации",
    ExpiredException: "Срок действия кода истёк",
    ForbiddenException: "Действие не разрешено",
    InvalidCodeException: "Неверный код",
    InvalidDataException: "Неверно заполнены поля",
    InvalidPasswordException: "Неверный пароль",
    LoginFailedException: "Ошибка авторизации",
    NotFoundException: "Объект не найден",
    RelatedObjectNotFoundException: "Связанный объект не найден",
    ThrottledException: "Произошла ошибка. Повторите попытку позже",
    ValidationError: "Неверно заполнены поля",
};

export const errorLocalization = {
    requestFailed: "Не удалось выполнить запрос",
    unknownError: "Неизвестная ошибка",
};
