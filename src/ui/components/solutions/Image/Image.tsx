import styles from "./Image.module.scss";
import { IconBasket, IconImage } from "src/ui/assets/icons";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";

const defaultFormats = ["png", "jpeg", "webp"];

export const Image = (props: {
    formats?: string[];
    resolution?: [number, number];
    url?: string | null;
    onSelectFile?: (file: File) => void;
    onRemoveFile?: () => void;
    style?: CSSProperties;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setSelectedFile(null);
    }, [props.url]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            props.onSelectFile?.(files[0]);
            setSelectedFile(files[0]);
        }
    };

    return (
        <div className={styles.container} style={props.style}>
            {props.url || selectedFile ? (
                <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : (props.url ?? "")}
                    alt={""}
                />
            ) : (
                <div className={styles.imagePlaceholderContainer}>
                    <IconImage className={styles.imagePlaceholder} />
                </div>
            )}
            {props.onSelectFile && (
                <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            )}
            <div className={styles.actionsOverlayBg}></div>
            <div className={styles.actionsOverlay}>
                <div className={styles.actionsOverlayContent}>
                    <Typo variant={"actionL"}>
                        <span className={styles.actionsOverlayContentTitle}>Формат: </span>
                        {(props.formats ?? defaultFormats).join(", ")}
                        {"\n"}
                        {props.resolution && (
                            <>
                                <span className={styles.actionsOverlayContentTitle}>
                                    Разрешение:{" "}
                                </span>
                                {props.resolution[0]} x {props.resolution[1]}
                            </>
                        )}
                    </Typo>
                    <div className={styles.actionOverlayButtons}>
                        {!selectedFile && !props.url ? (
                            <Button mode={"neutral"} onClick={() => fileInputRef.current?.click()}>
                                Выбрать файл
                            </Button>
                        ) : (
                            <>
                                <Button
                                    mode={"neutral"}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Заменить
                                </Button>
                                {props.onRemoveFile && (
                                    <Button
                                        mode={"negative"}
                                        iconBefore={<IconBasket />}
                                        onClick={() => {
                                            props.onRemoveFile?.();
                                            setSelectedFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
