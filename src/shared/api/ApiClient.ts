import axios, { GenericAbortSignal } from "axios";
import { ApiException, ApiExceptionCode } from "src/shared/api/ApiException.ts";
import {
    defaultExceptionCodeLocalization,
    errorLocalization,
} from "src/shared/locale/errorLocalization.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { ApiResponse } from "src/shared/api/ApiResponse.ts";

export type ExceptionCodeLocalization = Partial<Record<ApiExceptionCode, string>>;

export class ApiClient {
    private readonly exceptionCodeLocalization: ExceptionCodeLocalization;
    private readonly disableSnackbar;

    constructor(params?: {
        exceptionCodeLocalization?: ExceptionCodeLocalization;
        disableSnackbar?: boolean;
    }) {
        this.exceptionCodeLocalization = {
            ...defaultExceptionCodeLocalization,
            ...params?.exceptionCodeLocalization,
        };
        this.disableSnackbar = params?.disableSnackbar ?? false;
    }

    async post<T>(
        endpoint: string,
        data?: object | object[],
        params?: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
        },
    ): Promise<ApiResponse<T>> {
        try {
            const response = await axios.post<T>(endpoint, data);
            return {
                data: response.data,
                status: true,
            };
        } catch (error) {
            const errorData = this.handleError(
                error,
                params ?? {
                    exceptionCodeLocalization: this.exceptionCodeLocalization,
                    disableSnackbar: this.disableSnackbar,
                },
            );
            return {
                error: errorData?.error,
                status: false,
            };
        }
    }

    async get<T>(
        endpoint: string,
        params?: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
        },
    ): Promise<ApiResponse<T>> {
        try {
            const response = await axios.get<T>(endpoint);
            return {
                data: response.data,
                status: true,
            };
        } catch (error) {
            const errorData = this.handleError(
                error,
                params ?? {
                    exceptionCodeLocalization: this.exceptionCodeLocalization,
                    disableSnackbar: this.disableSnackbar,
                },
            );
            return {
                error: errorData?.error,
                status: false,
            };
        }
    }

    async put<T>(
        endpoint: string,
        data?: object | object[],
        params?: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
            signal?: GenericAbortSignal;
        },
    ): Promise<ApiResponse<T>> {
        try {
            const response = await axios.put<T>(endpoint, data, {
                signal: params?.signal,
            });
            return {
                data: response.data,
                status: true,
            };
        } catch (error) {
            const errorData = this.handleError(
                error,
                params ?? {
                    exceptionCodeLocalization: this.exceptionCodeLocalization,
                    disableSnackbar: this.disableSnackbar,
                },
            );
            return {
                error: errorData?.error,
                status: false,
            };
        }
    }

    async delete(
        endpoint: string,
        id: string | number,
        params?: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
        },
    ): Promise<ApiResponse<null>> {
        try {
            const response = await axios.delete(endpoint + "/" + id);
            return {
                data: response.data,
                status: true,
            };
        } catch (error) {
            const errorData = this.handleError(
                error,
                params ?? {
                    exceptionCodeLocalization: this.exceptionCodeLocalization,
                    disableSnackbar: this.disableSnackbar,
                },
            );
            return {
                error: errorData?.error,
                status: false,
            };
        }
    }

    private handleError(
        error: unknown,
        params: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
        },
    ) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data;
            if (this.isApiException(errorData)) {
                this.handleApiException(errorData, params);
                return errorData;
            } else {
                if (axios.isCancel(error)) {
                    return;
                }
                if (!params.disableSnackbar) {
                    // TODO: disable only api errors
                    snackbarStore.showNegativeSnackbar(errorLocalization.requestFailed);
                }
            }
        } else {
            console.error(error);
            if (!params.disableSnackbar) {
                snackbarStore.showNegativeSnackbar(errorLocalization.unknownError);
            }
        }
    }

    private isApiException(data: { error?: { code?: string } }): data is ApiException {
        return !!data?.error?.code;
    }

    private handleApiException(
        apiException: ApiException,
        params: {
            exceptionCodeLocalization?: ExceptionCodeLocalization;
            disableSnackbar?: boolean;
        },
    ) {
        const message =
            this.exceptionCodeLocalization[apiException.error.code] ??
            errorLocalization.unknownError;
        if (!params.disableSnackbar) {
            snackbarStore.showNegativeSnackbar(message);
        }
    }
}
