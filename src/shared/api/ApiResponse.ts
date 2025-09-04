import { ApiException } from "src/shared/api/ApiException.ts";

export type ApiResponse<T> =
    | {
          data: T;
          status: true;
      }
    | {
          error?: ApiException["error"];
          status: false;
      };
