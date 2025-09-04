import { transformUrl } from "src/shared/utils/transformUrl.ts";

export const fileUrl = (fileId?: string | null) =>
    fileId ? transformUrl(`/cdn/files/${fileId}`) : undefined;
