import styles from "./Media.module.scss";
import {
    IconBasket,
    IconError,
    IconImage,
    IconImport,
    IconPhotoGrid,
    IconPlus,
    IconSwap,
    IconUserRounded,
    IconVideo,
} from "src/ui/assets/icons";
import React, { CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Alert } from "src/ui/components/solutions/Alert/Alert.tsx";
import { Backlight } from "src/ui/components/controls/Backlight/Backlight.tsx";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";
import { layoutStore } from "src/app/AppStore.ts";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { clsx } from "clsx";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";
import { observer } from "mobx-react-lite";

const defaultImageFormats = ["png", "jpg", "jpeg", "webp", "gif"];
const defaultVideoFormats = ["mp4", "webm", "ogg"];
const defaultDocFormats = ["pdf", "pptx"];

export const Media = observer(
    (props: {
        type: "image" | "video" | "photoGrid" | "doc";
        resolution?: [number, number];
        maxSizeMB?: number;
        url?: string | null;
        onSelectFile?: (file: File) => void;
        onRemoveFile?: () => void;
        style?: CSSProperties;
        showBacklight?: boolean;
        formName?: string;
        imgStyle?: CSSProperties;
        enableCropper?: boolean;
        cropperAspectRatio?: number;
        disableOverlay?: boolean;
        plusPlaceholder?: boolean;
        readonly?: boolean;
    }) => {
        const fileInputRef = useRef<HTMLInputElement>(null);
        const [showOverlay, setShowOverlay] = useState(false);
        const [dragActive, setDragActive] = useState(false);
        const [hover, setHover] = useState(false);
        const dropzoneRef = useRef<HTMLDivElement>(null);
        const [error, setError] = useState<{ type: string } | null>(null);
        const [showCropper, setShowCropper] = useState(false);
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const cropperRef = useRef<ReactCropperElement>(null);
        const allowedFormats =
            props.type === "image" || props.type === "photoGrid"
                ? defaultImageFormats
                : props.type === "doc"
                  ? defaultDocFormats
                  : defaultVideoFormats;
        const containerRef = useRef<HTMLDivElement>(null);
        const [collapseButtons, setCollapseButtons] = useState(false);
        const multipleInsertFileInputRef = useRef<HTMLInputElement>(null);
        const [actionsOverlayActive, setActionsOverlayActive] = useState(false);
        const isMobile = layoutStore.isMobile;

        useEffect(() => {
            if (showOverlay) {
                setError(null);
                setDragActive(false);
                setSelectedFile(null);
                setShowCropper(false);
                document.addEventListener("dragenter", handleDocumentDragEnter);
                document.addEventListener("dragleave", handleDocumentDragLeave);
            }
            return () => {
                document.removeEventListener("dragenter", handleDocumentDragEnter);
                document.removeEventListener("dragleave", handleDocumentDragLeave);
            };
        }, [showOverlay]);

        useEffect(() => {
            if (dragActive) {
                document.addEventListener("drop", handleDrop);
                document.addEventListener("dragover", handleDragOver);
            }
            return () => {
                document.removeEventListener("drop", handleDrop);
                document.removeEventListener("dragover", handleDragOver);
            };
        }, [dragActive]);

        useEffect(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, [props.url]);

        useEffect(() => {
            const elem = containerRef.current;
            if (elem) {
                const observer = new ResizeObserver(() => {
                    setCollapseButtons(!!elem.offsetWidth && elem.offsetWidth <= 130);
                });
                observer.observe(elem);
                return () => {
                    if (elem) {
                        observer.unobserve(elem);
                    }
                };
            }
        }, [containerRef.current]);

        const handleDrop = async (e: DragEvent) => {
            setDragActive(false);
            e.preventDefault();
            const file = e.dataTransfer?.files.item(0);
            if (file) {
                const format = file.name.split(".").pop()?.toLowerCase();
                if (!format || !allowedFormats.map((f) => f.toLowerCase()).includes(format)) {
                    setError({ type: "WRONG_FORMAT" });
                    return;
                }
                if (props.maxSizeMB && file.size > props.maxSizeMB * 1024 * 1024) {
                    setError({ type: "MAX_SIZE" });
                    return;
                }
                setDragActive(false);
                if (
                    props.type === "image" &&
                    props.enableCropper &&
                    format !== "gif" &&
                    !(format === "webp" && (await isAnimatedWebP(file)))
                ) {
                    setSelectedFile(file);
                    setShowCropper(true);
                } else {
                    props.onSelectFile?.(file);
                    setShowOverlay(false);
                }
            } else {
                setError({ type: "WRONG_FORMAT" });
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDocumentDragEnter = () => {
            setError(null);
            setDragActive(true);
        };

        const handleDocumentDragLeave = (e: DragEvent) => {
            if (
                e.relatedTarget &&
                (e.target === dropzoneRef.current || e.relatedTarget === dropzoneRef.current)
            ) {
                return;
            }
            setDragActive(false);
        };

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files[0]) {
                const file = files[0];
                const format = file.name.split(".").pop()?.toLowerCase();
                if (!format || !allowedFormats.map((f) => f.toLowerCase()).includes(format)) {
                    setError({ type: "WRONG_FORMAT" });
                    return;
                }
                if (props.maxSizeMB && file.size > props.maxSizeMB * 1024 * 1024) {
                    setError({ type: "MAX_SIZE" });
                    return;
                }
                if (
                    props.type === "image" &&
                    props.enableCropper &&
                    format !== "gif" &&
                    !(format === "webp" && (await isAnimatedWebP(file)))
                ) {
                    setSelectedFile(files[0]);
                    setShowCropper(true);
                } else {
                    props.onSelectFile?.(files[0]);
                    setShowOverlay(false);
                }
            } else {
                setError({ type: "WRONG_FORMAT" });
            }
        };

        async function isAnimatedWebP(file: File) {
            try {
                const buffer = await file.arrayBuffer();
                const bytes = new Uint8Array(buffer);

                for (let i = 12; i < bytes.length - 4; i++) {
                    const chunkType = String.fromCharCode(...bytes.slice(i, i + 4));
                    if (chunkType === "ANIM" || chunkType === "ANMF") {
                        return true;
                    }
                }
            } catch (e: any) {
                console.error(e);
            }

            return false;
        }

        const renderPlaceholder = () => {
            // Специальный стартовый экран для документов
            if (props.type === "doc") {
                if (props.readonly) {
                    return (
                        <div
                            className={styles.imagePlaceholderContainer}
                            style={{ cursor: "default" }}
                        >
                            <IconUserRounded
                                className={styles.imagePlaceholder}
                                style={{ width: 48, height: 48 }}
                            />
                        </div>
                    );
                }
                return (
                    <div
                        style={{ width: "100%" }}
                        onClick={() => {
                            setShowOverlay(true);
                            if (isMobile) {
                                if (!fileInputRef.current) return;
                                fileInputRef.current.value = "";
                                fileInputRef.current?.click();
                            }
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <Button
                            size={"large"}
                            fullWidth={true}
                            type={"primary"}
                            mode={"neutral"}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowOverlay(true);
                                if (isMobile) {
                                    if (!fileInputRef.current) return;
                                    fileInputRef.current.value = "";
                                    fileInputRef.current?.click();
                                }
                            }}
                        >
                            Загрузить файл (PDF, PPTX)
                        </Button>
                    </div>
                );
            }

            if (props.plusPlaceholder && ["video", "image"].includes(props.type)) {
                return (
                    <div
                        className={clsx(
                            styles.imagePlaceholderContainer,
                            styles.plusPlaceholderContainer,
                        )}
                        onClick={() => {
                            setShowOverlay(true);
                            if (isMobile) {
                                if (!fileInputRef.current) {
                                    return;
                                }
                                fileInputRef.current.value = "";
                                fileInputRef.current?.click();
                            }
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <IconPlus style={{ width: 48, height: 48 }} />
                    </div>
                );
            } else {
                if (props.readonly) {
                    return (
                        <div
                            className={styles.imagePlaceholderContainer}
                            style={{ cursor: "default" }}
                        >
                            <IconUserRounded
                                className={styles.imagePlaceholder}
                                style={{
                                    width: 48,
                                    height: 48,
                                }}
                            />
                        </div>
                    );
                }
                return (
                    <div
                        className={styles.imagePlaceholderContainer}
                        onClick={() => {
                            setShowOverlay(true);
                            if (isMobile) {
                                if (props.type === "photoGrid") {
                                    return;
                                }
                                if (!fileInputRef.current) {
                                    return;
                                }
                                fileInputRef.current.value = "";
                                fileInputRef.current?.click();
                            }
                        }}
                        onMouseEnter={() => {
                            if (!props.readonly) {
                                setHover(true);
                            }
                        }}
                        onMouseLeave={() => setHover(false)}
                    >
                        {props.type === "image" ? (
                            <IconImage className={styles.imagePlaceholder} />
                        ) : props.type === "photoGrid" ? (
                            <IconPhotoGrid className={styles.imagePlaceholder} />
                        ) : (
                            <IconVideo className={styles.imagePlaceholder} />
                        )}
                        {props.type === "photoGrid" ? (
                            <Button
                                mode={"neutral"}
                                onClick={() => {
                                    setShowOverlay(true);
                                }}
                                hover={hover}
                                size={"small"}
                            >
                                Настроить
                            </Button>
                        ) : (
                            <Tooltip
                                text={collapseButtons ? "Загрузить" : undefined}
                                container={document.body}
                            >
                                <Button
                                    mode={"neutral"}
                                    onClick={() => {
                                        setShowOverlay(true);
                                    }}
                                    iconBefore={<IconImport />}
                                    hover={hover}
                                    size={"small"}
                                >
                                    {collapseButtons ? undefined : "Загрузить"}
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                );
            }
        };

        return (
            <div>
                {props.formName && (
                    <Typo variant={"subheadXL"} type={"quaternary"} style={{ marginBottom: 12 }}>
                        {props.formName}
                    </Typo>
                )}
                <div
                    className={clsx(styles.container, props.readonly && styles.readonly, {
                        [styles.typeDoc]: props.type === "doc",
                    })}
                    style={{
                        ...props.style,
                        height: props.style?.height,
                    }}
                    ref={containerRef}
                >
                    {props.url ? (
                        props.type === "photoGrid" ? (
                            <></>
                        ) : props.type === "image" ? (
                            <img src={props.url ?? ""} alt={""} style={props.imgStyle} />
                        ) : props.type === "video" ? (
                            <video
                                src={props.url ?? ""}
                                muted={true}
                                loop={true}
                                controls={false}
                                autoPlay={true}
                                width={"100%"}
                                style={{ objectFit: "cover" }}
                            />
                        ) : props.type === "doc" ? (
                            <Flex
                                align={"center"}
                                justify={"center"}
                                style={{ width: "100%", height: "100%" }}
                            >
                                <Button
                                    mode={"neutral"}
                                    size={"small"}
                                    onClick={() => {
                                        if (props.url) {
                                            window.open(props.url, "_blank", "noopener,noreferrer");
                                        }
                                    }}
                                >
                                    Открыть документ
                                </Button>
                            </Flex>
                        ) : null
                    ) : (
                        renderPlaceholder()
                    )}
                    {props.onSelectFile && (
                        <input
                            type="file"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={allowedFormats.map((f) => `.${f}`).join(",")}
                        />
                    )}
                    {props.url && !props.disableOverlay && (
                        <div className={styles.actionsOverlayBg}></div>
                    )}
                    {props.url && !props.disableOverlay && !props.readonly && (
                        <div
                            className={styles.actionsOverlay}
                            onMouseUp={() => {
                                setActionsOverlayActive(true);
                            }}
                            onMouseLeave={() => {
                                setActionsOverlayActive(false);
                            }}
                        >
                            <div className={styles.actionsOverlayContent}>
                                <div
                                    className={styles.actionOverlayButtons}
                                    style={{
                                        pointerEvents:
                                            isMobile && !actionsOverlayActive ? "none" : undefined,
                                    }}
                                >
                                    <Tooltip
                                        text={collapseButtons ? "Заменить" : undefined}
                                        tipPosition={"bottom-center"}
                                        container={document.body}
                                    >
                                        <Button
                                            mode={"neutral"}
                                            onClick={() => {
                                                setShowOverlay(true);
                                                if (isMobile) {
                                                    if (!fileInputRef.current) {
                                                        return;
                                                    }
                                                    fileInputRef.current.value = "";
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                            iconBefore={<IconSwap />}
                                            size={"small"}
                                        >
                                            {collapseButtons ? undefined : "Заменить"}
                                        </Button>
                                    </Tooltip>
                                    {props.onRemoveFile && (
                                        <Tooltip
                                            text={collapseButtons ? "Удалить" : undefined}
                                            container={document.body}
                                        >
                                            <Button
                                                mode={"negative"}
                                                iconBefore={<IconBasket />}
                                                onClick={() => {
                                                    props.onRemoveFile?.();
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = "";
                                                    }
                                                }}
                                                size={"small"}
                                            >
                                                {collapseButtons ? undefined : "Удалить"}
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <Overlay
                        open={showOverlay && props.type === "photoGrid"}
                        title={"Настройка фотосетки"}
                        onClose={() => {
                            setShowOverlay(false);
                        }}
                        closeOnBackdropClick={dragActive}
                        styles={{
                            card: {
                                width: 1074,
                                overflow: "hidden",
                                minHeight: isMobile ? "100dvh" : undefined,
                                height: isMobile ? "100dvh" : undefined,
                                borderRadius: isMobile ? 0 : undefined,
                            },
                        }}
                        draggable={false}
                    >
                        <Flex gap={12}>
                            <Button
                                iconBefore={<IconImage />}
                                type={"outlined"}
                                mode={"neutral"}
                                size={isMobile ? "small" : "large"}
                                fullWidth={isMobile}
                                onClick={() => {
                                    if (!multipleInsertFileInputRef.current) {
                                        return;
                                    }
                                    multipleInsertFileInputRef.current.value = "";
                                    multipleInsertFileInputRef.current?.click();
                                }}
                            >
                                Загрузить несколько
                            </Button>
                        </Flex>
                        <Spacing height={isMobile ? 16 : 24} />
                    </Overlay>

                    <Overlay
                        open={
                            showOverlay && (!isMobile || showCropper) && props.type !== "photoGrid"
                        }
                        title={showCropper ? "Кадрирование" : ""}
                        onClose={() => setShowOverlay(false)}
                        styles={{
                            content: { marginTop: "4px" },
                            card: {
                                width: 650,
                                minHeight: isMobile ? "100dvh" : 320,
                                borderRadius: 8,
                            },
                        }}
                        closeOnBackdropClick={dragActive}
                    >
                        {!showCropper && (
                            <>
                                {!dragActive && (
                                    <Flex justify={"center"} gap={20}>
                                        {props.type === "image" ? (
                                            <IconImage className={styles.imagePlaceholder} />
                                        ) : props.type === "photoGrid" ? (
                                            <IconPhotoGrid className={styles.imagePlaceholder} />
                                        ) : props.type === "doc" ? (
                                            <IconImport className={styles.imagePlaceholder} />
                                        ) : (
                                            <IconVideo className={styles.imagePlaceholder} />
                                        )}
                                        <FlexColumn width={402} gap={12} align={"start"}>
                                            <Typo variant={"bodyXL"} style={{ marginTop: 12 }}>
                                                {props.type === "image"
                                                    ? "Перетащите изображение сюда или"
                                                    : props.type === "doc"
                                                      ? "Перетащите документ сюда или"
                                                      : "Перетащите видео сюда или"}
                                            </Typo>
                                            <Button
                                                mode={"neutral"}
                                                size={"small"}
                                                onClick={() => {
                                                    if (!fileInputRef.current) {
                                                        return;
                                                    }
                                                    fileInputRef.current.value = "";
                                                    fileInputRef.current.click();
                                                }}
                                            >
                                                Выберите файл
                                            </Button>
                                            <Typo
                                                variant={"bodyL"}
                                                mode={"neutral"}
                                                type={"quaternary"}
                                                style={{ marginTop: 4 }}
                                            >
                                                <span className={styles.actionsOverlayContentTitle}>
                                                    Формат:{" "}
                                                </span>
                                                {allowedFormats.join(", ")}
                                                {props.resolution && props.type !== "doc" && (
                                                    <>
                                                        {"\n"}
                                                        <span
                                                            className={
                                                                styles.actionsOverlayContentTitle
                                                            }
                                                        >
                                                            Рекомендуемое разрешение:{" "}
                                                        </span>
                                                        {props.resolution[0]} x{" "}
                                                        {props.resolution[1]}
                                                    </>
                                                )}
                                                {props.maxSizeMB && (
                                                    <>
                                                        {"\n"}
                                                        <span
                                                            className={
                                                                styles.actionsOverlayContentTitle
                                                            }
                                                        >
                                                            Максимальный размер:{" "}
                                                        </span>
                                                        {props.maxSizeMB} МБ
                                                    </>
                                                )}
                                            </Typo>
                                            {error && error.type === "WRONG_FORMAT" && (
                                                <Alert
                                                    mode={"negative"}
                                                    icon={<IconError />}
                                                    title={"Неверный формат файла"}
                                                    style={{ marginTop: 4 }}
                                                />
                                            )}
                                            {error && error.type === "MAX_SIZE" && (
                                                <Alert
                                                    mode={"negative"}
                                                    icon={<IconError />}
                                                    title={`Превышен максимальный размер`}
                                                    style={{ marginTop: 4 }}
                                                />
                                            )}
                                        </FlexColumn>
                                    </Flex>
                                )}
                                {dragActive && (
                                    <div ref={dropzoneRef} className={styles.dropzone}>
                                        <Typo variant={"actionXL"} mode={"brand"} type={"tertiary"}>
                                            {props.type === "image"
                                                ? "Перетащите изображение сюда и отпустите его"
                                                : props.type === "doc"
                                                  ? "Перетащите документ сюда и отпустите его"
                                                  : "Перетащите видео сюда и отпустите его"}
                                        </Typo>
                                    </div>
                                )}
                            </>
                        )}
                        {showCropper && selectedFile && (
                            <FlexColumn
                                gap={28}
                                style={{
                                    paddingTop: 16,
                                }}
                            >
                                <Cropper
                                    ref={cropperRef}
                                    src={URL.createObjectURL(selectedFile)}
                                    style={{
                                        maxHeight: "70vh",
                                        height: "auto",
                                        width: "100%",
                                        marginBottom: "12px",
                                    }}
                                    checkOrientation={false}
                                    viewMode={2}
                                    dragMode={"none"}
                                    background={true}
                                    responsive={true}
                                    autoCropArea={1}
                                    guides={true}
                                    rotatable={true}
                                    aspectRatio={props.cropperAspectRatio}
                                />
                                <Flex gap={16}>
                                    <Button
                                        mode={"brand"}
                                        size={"medium"}
                                        fullWidth={isMobile}
                                        onClick={() => {
                                            cropperRef.current?.cropper
                                                .getCroppedCanvas()
                                                .toBlob((blob) => {
                                                    if (blob) {
                                                        const newFile = new File(
                                                            [blob],
                                                            selectedFile?.name,
                                                            {
                                                                type: selectedFile?.type,
                                                            },
                                                        );
                                                        props.onSelectFile?.(newFile);
                                                        setShowOverlay(false);
                                                        setSelectedFile(null);
                                                        setShowCropper(false);
                                                    } else {
                                                        console.error(
                                                            "failed to get blob from srcCanvas",
                                                        );
                                                    }
                                                }, selectedFile?.type ?? "image/png");
                                        }}
                                    >
                                        Сохранить
                                    </Button>
                                    {!isMobile && (
                                        <Button
                                            mode={"neutral"}
                                            type={"tertiary"}
                                            size={"medium"}
                                            onClick={() => {
                                                setShowCropper(false);
                                                setSelectedFile(null);
                                            }}
                                        >
                                            Выбрать другое изображение
                                        </Button>
                                    )}
                                </Flex>
                            </FlexColumn>
                        )}
                    </Overlay>
                    {props.showBacklight && <Backlight />}
                </div>
            </div>
        );
    },
);
