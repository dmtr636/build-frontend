import { makeAutoObservable } from "mobx";
import { FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import axios from "axios";
/*
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
*/
export type FileType =
    | "PROFILE_IMAGE"
    | "PROJECT_COVER_IMAGE"
    | "PROJECT_CONTENT_IMAGE"
    | "PROJECT_CONTENT_VIDEO"
    | "REPORT_ATTACHMENT_IMAGE"
    | "REVIEW_IMAGE";

export class FileStore {
    uploading = false;
    uploadProgressPercent = 0;
    uploadingFileName = "";
    uploadAbortController = new AbortController();

    constructor() {
        makeAutoObservable(this);
    }

    async uploadFile(file: File, type: FileType, userId?: string) {
        this.uploading = true;
        this.uploadingFileName = file.name;
        this.uploadProgressPercent = 0;
        const formData = new FormData();
        formData.set("file", file);
        formData.set("type", type);
        if (userId) formData.append("userId", userId);
        try {
            const response = await axios.post<{ id: string }>(
                FILES_ENDPOINT + "/upload",
                formData,
                {
                    onUploadProgress: (event) => {
                        this.uploadProgressPercent = Math.floor((event.progress ?? 0) * 100);
                    },
                    signal: this.uploadAbortController.signal,
                },
            );
            return response.data.id;
        } catch (e) {
            if (!axios.isCancel(e)) {
                console.log("Не удалось загрузить файл");
            }
            return "";
        } finally {
            this.uploadingFileName = "";
            this.uploadProgressPercent = 0;
            this.uploading = false;
        }
    }
}

export const fileStore = new FileStore();
