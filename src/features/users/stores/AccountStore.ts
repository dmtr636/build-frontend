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

    constructor() {
        makeAutoObservable(this);
    }

    get isAdmin() {
        return this.currentUser?.role === "ADMIN";
    }

    setUserIsAdmin() {
        if (this.currentUser) {
            this.currentUser.role = "ADMIN";
            this.currentUser.lastName = "Администратор";
            this.currentUser.firstName = "Тестовый";
            this.currentUser.position = undefined;
        }
    }

    setUserIsContractor() {
        if (this.currentUser) {
            this.currentUser.role = "USER";
            this.currentUser.lastName = "Подрядчик";
            this.currentUser.firstName = "Тестовый";
            this.currentUser.position = "Подрядчик";
        }
    }

    setUserIsCustomer() {
        if (this.currentUser) {
            this.currentUser.role = "USER";

            this.currentUser.lastName = "Заказчик";
            this.currentUser.firstName = "Тестовый";
            this.currentUser.position = "Служба строительного контроля";
        }
    }

    setUserIsInspector() {
        if (this.currentUser) {
            this.currentUser.role = "USER";

            this.currentUser.lastName = "Инспектор";
            this.currentUser.firstName = "Тестовый";
            this.currentUser.position = "Инспектор контрольного органа";
        }
    }

    private _onKeyDown?: (e: KeyboardEvent) => void;

    bindRoleHotkeys() {
        if (this._onKeyDown) return;

        this._onKeyDown = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            const inInput =
                !!t &&
                (t.tagName === "INPUT" ||
                    t.tagName === "TEXTAREA" ||
                    (t as HTMLElement).isContentEditable);

            if (inInput || e.repeat) return;

            switch (e.key) {
                case "F1":
                    e.preventDefault();
                    this.setUserIsAdmin();
                    break;
                case "F2":
                    e.preventDefault();
                    this.setUserIsCustomer();

                    break;
                case "F3":
                    e.preventDefault();

                    this.setUserIsInspector();
                    break;
                case "F4":
                    e.preventDefault();

                    this.setUserIsContractor();
                    break;
                default:
                    return;
            }
        };

        window.addEventListener("keydown", this._onKeyDown);
    }

    unbindRoleHotkeys() {
        if (this._onKeyDown) {
            window.removeEventListener("keydown", this._onKeyDown);
            this._onKeyDown = undefined;
        }
    }

    get isContractor() {
        return this.currentUser?.position === "Подрядчик";
    }

    get isInspector() {
        return this.currentUser?.position === "Инспектор контрольного органа";
    }

    get isCustomer() {
        return this.currentUser?.position === "Служба строительного контроля";
    }

    async authenticate() {
        try {
            const response = await axios.get(endpoints.account);
            this.setUser(response.data);
            this.fetchUserIsOnline(this.currentUser?.id as string);
            return true;
        } catch (error) {
            return false;
        } finally {
            this.setInitialized(true);
        }
    }

    async logout() {
        await this.fetchUserIsOffline();
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

    async deleteUser(id: string) {
        await axios.post(`${endpoints.users}/${id}`);
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

        const isImage = file.type.toLowerCase().startsWith("image/");
        const isConvertibleImage = convertibleImageTypes.includes(file.type.toLowerCase());
        const isVideoType = type === "PROJECT_CONTENT_VIDEO";
        const isDocumentType = type === "PROJECT_DOCUMENT";

        // 1) Видео
        if (isVideoType) {
            const getVideoDimensions = (url: string) => {
                return new Promise<{ width: number; height: number }>((resolve, reject) => {
                    const video = document.createElement("video");
                    const revoke = () => {
                        try {
                            URL.revokeObjectURL(url);
                        } catch {
                            console.error("error while revoking url");
                        }
                    };
                    video.addEventListener(
                        "loadedmetadata",
                        function () {
                            const height = (this as HTMLVideoElement).videoHeight;
                            const width = (this as HTMLVideoElement).videoWidth;
                            revoke();
                            resolve({ height, width });
                        },
                        { once: true },
                    );
                    video.addEventListener(
                        "error",
                        () => {
                            revoke();
                            reject(new Error("Failed to load video metadata"));
                        },
                        { once: true },
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
                onUpload?.(result, 0, 0);
            }
            return result;
        }

        // 2) Документы (PDF, PPTX и т.п.)
        if (isDocumentType) {
            const result = await fileStore.uploadFile(file, type);
            // Для документов размеров нет — отдаем 0,0
            onUpload?.(result, 0, 0);
            return result;
        }

        // 3) Прочие НЕ-конвертируемые форматы
        //    - Если это изображение (webp/gif/svg и т.д.), отдаем их как есть и постараемся получить размеры.
        //    - Если это НЕ изображение (например, документ, архив и т.п.), просто загружаем без размеров.
        if (!isConvertibleImage) {
            const result = await fileStore.uploadFile(file, type);

            if (isImage) {
                const getHeightAndWidthFromDataUrl = (dataURL: string) =>
                    new Promise<{ width: number; height: number }>((resolve, reject) => {
                        const img = new Image();
                        const revoke = () => {
                            try {
                                URL.revokeObjectURL(dataURL);
                            } catch {
                                console.error("error while revoking url");
                            }
                        };
                        img.onload = () => {
                            const width = img.width;
                            const height = img.height;
                            revoke();
                            resolve({ width, height });
                        };
                        img.onerror = (err) => {
                            revoke();
                            reject(err);
                        };
                        img.src = dataURL;
                    });

                try {
                    const { width, height } = await getHeightAndWidthFromDataUrl(
                        URL.createObjectURL(file),
                    );
                    onUpload?.(result, width, height);
                } catch (e) {
                    console.error(e);
                    onUpload?.(result, 0, 0);
                }
            } else {
                // Не изображение — размеров нет
                onUpload?.(result, 0, 0);
            }

            return result;
        }

        // 4) Конвертация конвертируемых изображений (jpeg/jpg/png) в webp
        let width = 0;
        let height = 0;
        const processedFile = await new Promise<File>((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = async () => {
                try {
                    const maxDimensions = getMaxDimensions();

                    // Сохраняем пропорции и не увеличиваем
                    const scale = Math.min(
                        maxDimensions.width / img.width,
                        maxDimensions.height / img.height,
                        1,
                    );

                    const newWidth = Math.round(img.width * scale);
                    const newHeight = Math.round(img.height * scale);

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    width = newWidth;
                    height = newHeight;

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                URL.revokeObjectURL(objectUrl);
                                return reject(new Error("Canvas error"));
                            }
                            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            URL.revokeObjectURL(objectUrl);
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
                    URL.revokeObjectURL(objectUrl);
                    reject(err);
                }
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(objectUrl);
                reject(err);
            };
            img.src = objectUrl;
        });

        const result = await fileStore.uploadFile(processedFile, type);
        onUpload?.(result, width, height);
        return result;
    }
}
