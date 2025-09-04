export interface ApiException {
    error: {
        code: ApiExceptionCode;
        data?: Record<string, string | number | object>;
        message?: string;
    };
}

export type ApiExceptionCode =
    | "AlreadyExistsException"
    | "ApiException"
    | "AuthenticationException"
    | "ExpiredException"
    | "ForbiddenException"
    | "InvalidCodeException"
    | "InvalidDataException"
    | "InvalidPasswordException"
    | "LoginFailedException"
    | "NotFoundException"
    | "RelatedObjectNotFoundException"
    | "ThrottledException"
    | "ValidationError";
