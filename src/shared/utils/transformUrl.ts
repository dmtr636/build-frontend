import { domain } from "src/shared/config/domain.ts";

export const transformUrl = (path: string) => `${domain}${path}`;
