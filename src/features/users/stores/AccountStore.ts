import { makeAutoObservable } from "mobx";
import axios from "axios";
import { endpoints, LOGOUT_ENDPOINT } from "src/shared/api/endpoints.ts";
import { ApiClient } from "src/shared/api/ApiClient.ts";

import { User } from "src/features/users/types/User.ts";
import { fileStore, FileType } from "src/features/users/stores/FileStore.ts";

export class AccountStore {
    currentUser: User | null = null;
    initialized = false;
    updating = false;
    private apiClient = new ApiClient();
    updateAbortController = new AbortController();
    users: User[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async authenticate() {
        try {
            const response = await axios.get(endpoints.account);
            this.setUser(response.data);
            this.fetchUserIsOnline(this.currentUser?.id as string);
            console.log(this.currentUser);
            return true;
        } catch (error) {
            return false;
        } finally {
            this.setInitialized(true);
        }
    }

    async logout() {
        this.fetchUserIsOffline();
        await axios.post(LOGOUT_ENDPOINT);

        this.setUser(null);
    }

    async update(user: User) {
        this.updateAbortController = new AbortController();
        this.setUpdating(true);
        const response = await this.apiClient.put<User>(endpoints.account, user, {
            signal: this.updateAbortController.signal,
        });
        if (response.status) {
            this.setUser(response.data);
        }
        this.setUpdating(false);
        return response;
    }

    async fetchUserIsOnline(id: string) {
        axios.put(`${endpoints.users}/${id}/status/online`, {});
    }

    async createUser(user: User) {
        const response = await axios.post(endpoints.users, user);
        this.users = response.data;
    }

    async fetchUserIsOffline(useBeacon = false) {
        const url = `${endpoints.users}/${this.currentUser?.id as string}/status/offline`;

        if (useBeacon && navigator.sendBeacon) {
            try {
                const blob = new Blob([JSON.stringify({})], { type: "application/json" });
                navigator.sendBeacon(url, blob);
                return;
            } catch (e) {
                console.error("sendBeacon error", e);
            }
        }

        try {
            await axios.put(url, {});
        } catch (e) {
            console.error("axios error", e);
        }
    }

    setUpdating(updating: boolean) {
        this.updating = updating;
    }

    setUser(user: User | null) {
        this.currentUser = user;
    }

    setInitialized(initialized: boolean) {
        this.initialized = initialized;
    }

    async uploadMediaFile(
        file: File,
        type: FileType,
        onUpload?: (imageId: string, width: number, height: number) => void,
    ) {
        const convertibleImageTypes = ["image/jpeg", "image/jpg", "image/png"];

        const getMaxDimensions = (): { width: number; height: number } => {
            switch (type) {
                case "PROFILE_IMAGE":
                    return { width: 256, height: 256 };
                case "PROJECT_COVER_IMAGE":
                    return { width: 1920, height: 1920 };
                case "REPORT_ATTACHMENT_IMAGE":
                    return { width: 5120, height: 1440 };
                case "PROJECT_CONTENT_IMAGE":
                    return { width: 1920, height: 50000 };
                default:
                    return { width: Infinity, height: Infinity };
            }
        };

        if (type === "PROJECT_CONTENT_VIDEO") {
            const getVideoDimensions = (url: string) => {
                return new Promise<{ width: number; height: number }>((resolve) => {
                    const video = document.createElement("video");
                    video.addEventListener(
                        "loadedmetadata",
                        function () {
                            const height = this.videoHeight;
                            const width = this.videoWidth;

                            resolve({ height, width });
                        },
                        false,
                    );
                    video.src = url;
                });
            };

            const result = await fileStore.uploadFile(file, type);
            try {
                const { width, height } = await getVideoDimensions(URL.createObjectURL(file));
                onUpload?.(result, width, height);
            } catch (e) {
                console.error(e);
            }
            return result;
        }

        if (!convertibleImageTypes.includes(file.type.toLowerCase())) {
            const getHeightAndWidthFromDataUrl = (dataURL: string) =>
                new Promise<{ width: number; height: number }>((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            height: img.height,
                            width: img.width,
                        });
                    };
                    img.src = dataURL;
                });
            const result = await fileStore.uploadFile(file, type);
            try {
                const { width, height } = await getHeightAndWidthFromDataUrl(
                    URL.createObjectURL(file),
                );
                onUpload?.(result, width, height);
            } catch (e) {
                console.error(e);
            }
            return result;
        }

        let width = 0;
        let height = 0;
        const processedFile = await new Promise<File>((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const maxDimensions = getMaxDimensions();

                    // Рассчет нового размера с сохранением пропорций
                    const scale = Math.min(
                        maxDimensions.width / img.width,
                        maxDimensions.height / img.height,
                        1, // Максимальный scale = 1 (не увеличиваем изображение)
                    );

                    const newWidth = img.width * scale;
                    const newHeight = img.height * scale;

                    // Создание canvas для ресайза
                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    width = newWidth;
                    height = newHeight;

                    // Конвертация в WebP с качеством 90%
                    canvas.toBlob(
                        async (blob) => {
                            if (!blob) return reject(new Error("Canvas error"));

                            // Сохраняем оригинальное имя с заменой расширения
                            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

                            resolve(
                                new File([blob], newName, {
                                    type: "image/webp",
                                    lastModified: Date.now(),
                                }),
                            );
                        },
                        "image/webp",
                        0.9,
                    );
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });

        const result = await fileStore.uploadFile(processedFile, type);
        onUpload?.(result, width, height);
        return result;
    }
}
