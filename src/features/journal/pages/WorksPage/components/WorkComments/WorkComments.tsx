import { observer } from "mobx-react-lite";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { accountStore, appStore, userStore, worksStore } from "src/app/AppStore.ts";
import styles from "./WorkComments.module.scss";
import {
    IconAttach,
    IconClose,
    IconDocument,
    IconDote,
    IconError,
    IconImage,
    IconImport,
    IconUp,
    IconUser,
    IconVideo,
} from "src/ui/assets/icons";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import TextArea from "src/ui/components/inputs/Textarea/TextArea.tsx";
import { makeAutoObservable } from "mobx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { FileDto } from "src/features/journal/types/Object.ts";
import { fileStore } from "src/features/users/stores/FileStore.ts";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { formatDate, formatTime } from "src/shared/utils/date.ts";
import clsx from "clsx";
import { GET_FILES_ENDPOINT } from "src/shared/api/endpoints.ts";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";
import { getFullName, getNameInitials } from "src/shared/utils/getFullName.ts";

class VM {
    text = "";
    fileDTOs: FileDto[] = [];

    constructor() {
        makeAutoObservable(this);
    }
}

export const WorkComments = observer(
    (props: { work: ProjectWork; show: boolean; setShow: (show: boolean) => void }) => {
        const vm = useMemo(() => new VM(), [props.work.id]);
        const fileInputRef = useRef<HTMLInputElement>(null);

        useLayoutEffect(() => {
            if (props.work.id) {
                worksStore.fetchWorkComments(props.work.id);
            }
        }, [props.work.id]);

        const comments = worksStore.workComments;

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files[0]) {
                await fileStore.uploadFile(files[0], "PROJECT_DOCUMENT", undefined, (fileDto) => {
                    vm.fileDTOs.push(fileDto);
                });
            }
        };

        const getFileDtoImage = (file: FileDto) => {
            const defaultImageFormats = ["png", "jpg", "jpeg", "webp", "gif"];
            const defaultVideoFormats = ["mp4", "webm", "ogg"];
            if (defaultImageFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
                return <IconImage style={{ opacity: 0.6 }} />;
            }
            if (defaultVideoFormats.includes(file.originalFileName?.split(".")?.pop() ?? "")) {
                return <IconVideo style={{ opacity: 0.6 }} />;
            }
            return <IconDocument style={{ opacity: 0.6 }} />;
        };

        return (
            <Overlay
                open={props.show}
                onClose={() => props.setShow(false)}
                title={props.work.name}
                titleNoWrap={true}
                smallPadding={true}
                styles={{
                    content: {
                        padding: "16px 20px",
                    },
                    card: {
                        width: 460,
                    },
                    actions: {
                        padding: 20,
                        borderTop: "1px solid var(--objects-stroke-neutral-tertiary, #E8EAED)",
                        background: "#F9FAFB",
                    },
                    header: {
                        padding: "24px 20px",
                        borderBottom: "1px solid var(--objects-stroke-neutral-secondary, #D6D9E0)",
                    },
                }}
                extraFooterHeight={107}
                gradientTopPosition={84}
                actions={[
                    <div className={styles.footer} key={"1"}>
                        <FlexColumn
                            gap={8}
                            style={{
                                overflow: "hidden",
                            }}
                        >
                            <TextArea
                                value={vm.text}
                                onChange={(event) => (vm.text = event.target.value)}
                                height={150}
                                placeholder={"Введите текст"}
                            />
                            {vm.fileDTOs.length > 0 && (
                                <FlexColumn gap={10}>
                                    {vm.fileDTOs.map((fileDTO, index) => (
                                        <Grid
                                            gap={16}
                                            columns={"1fr auto"}
                                            align={"center"}
                                            key={index}
                                        >
                                            <Button
                                                type={"text"}
                                                size={"small"}
                                                iconBefore={getFileDtoImage(fileDTO)}
                                                align={"start"}
                                                style={{
                                                    overflow: "hidden",
                                                }}
                                                onClick={async () => {
                                                    const response = await fetch(
                                                        fileUrl(fileDTO.id) as string,
                                                    );
                                                    const blob = await response.blob();
                                                    const blobUrl =
                                                        window.URL.createObjectURL(blob);

                                                    const link = document.createElement("a");
                                                    link.href = blobUrl;
                                                    link.download =
                                                        fileDTO.originalFileName || "file";
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.remove();
                                                    window.URL.revokeObjectURL(blobUrl);
                                                }}
                                            >
                                                {fileDTO.originalFileName}
                                            </Button>
                                            <IconClose
                                                className={styles.deleteFileIcon}
                                                onClick={() => {
                                                    vm.fileDTOs.splice(index, 1);
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </FlexColumn>
                            )}
                        </FlexColumn>
                        <FlexColumn gap={8}>
                            <Button
                                size={"small"}
                                mode={"neutral"}
                                disabled={!vm.text && !vm.fileDTOs.length}
                                loading={worksStore.loading}
                                onClick={async () => {
                                    await worksStore.createComment({
                                        workId: props.work.id,
                                        files: vm.fileDTOs,
                                        text: vm.text ?? "",
                                        authorId: accountStore.currentUser?.id ?? "",
                                    });
                                    vm.fileDTOs = [];
                                    vm.text = "";
                                    snackbarStore.showNeutralPositiveSnackbar(
                                        "Комментарий отправлен",
                                    );
                                }}
                            >
                                <IconUp />
                            </Button>
                            <Button
                                size={"small"}
                                mode={"neutral"}
                                type={"outlined"}
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                        fileInputRef.current.click();
                                    }
                                }}
                            >
                                <IconAttach />
                            </Button>
                            <input
                                type="file"
                                style={{ display: "none" }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </FlexColumn>
                    </div>,
                ]}
            >
                {!comments.length && !worksStore.loading && (
                    <div className={styles.noUsersInOrg}>
                        <IconError className={styles.icon} />
                        <Typo variant={"actionXL"} type={"secondary"} mode={"neutral"}>
                            Комментариев пока нет
                        </Typo>
                    </div>
                )}
                <div className={styles.comments}>
                    {comments.map((comment, index) => (
                        <div key={index} className={styles.commentCard}>
                            <div className={clsx(styles.container)}>
                                <div className={styles.imgBlock}>
                                    {userStore.usersMap.get(comment.authorId)?.imageId ? (
                                        <img
                                            className={styles.userImg}
                                            src={`${GET_FILES_ENDPOINT}/${userStore.usersMap.get(comment.authorId)?.imageId}`}
                                        />
                                    ) : (
                                        <div className={styles.noUser}>
                                            <IconUser />
                                        </div>
                                    )}
                                    <div className={styles.enabledContainer}>
                                        <div
                                            className={clsx(styles.enabled, {
                                                [styles.online]:
                                                    userStore.usersOnline[comment.authorId]
                                                        ?.status === "online",
                                            })}
                                        ></div>
                                    </div>
                                </div>
                                <div className={clsx(styles.infoBlock)}>
                                    <Tooltip
                                        text={getFullName(userStore.usersMap.get(comment.authorId))}
                                    >
                                        <div className={styles.name}>
                                            {getNameInitials(
                                                userStore.usersMap.get(comment.authorId),
                                            )}
                                        </div>
                                    </Tooltip>
                                    <div className={styles.otherInfo}>
                                        {userStore.usersMap.get(comment.authorId)?.position && (
                                            <Tooltip
                                                text={
                                                    userStore.usersMap.get(comment.authorId)
                                                        ?.position
                                                }
                                            >
                                                <div>
                                                    {
                                                        userStore.usersMap.get(comment.authorId)
                                                            ?.position
                                                    }
                                                </div>
                                            </Tooltip>
                                        )}
                                        {userStore.usersMap.get(comment.authorId)?.position &&
                                            userStore.usersMap.get(comment.authorId)
                                                ?.organizationId && (
                                                <IconDote className={styles.dote} />
                                            )}
                                        {userStore.usersMap.get(comment.authorId)?.organizationId &&
                                            appStore.organizationsStore.organizationById(
                                                userStore.usersMap.get(comment.authorId)
                                                    ?.organizationId ?? "",
                                            )?.name}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.commentCardText}>
                                <Typo variant={"bodyM"}>{comment.text}</Typo>
                                {comment.files.map((fileDTO, index) => (
                                    <div key={index}>
                                        <Button
                                            key={index}
                                            type={"text"}
                                            size={"small"}
                                            iconBefore={getFileDtoImage(fileDTO)}
                                            align={"start"}
                                            iconAfter={<IconImport />}
                                            style={{
                                                overflow: "hidden",
                                            }}
                                            onClick={async () => {
                                                const response = await fetch(
                                                    fileUrl(fileDTO.id) as string,
                                                );
                                                const blob = await response.blob();
                                                const blobUrl = window.URL.createObjectURL(blob);

                                                const link = document.createElement("a");
                                                link.href = blobUrl;
                                                link.download = fileDTO.originalFileName || "file";
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                window.URL.revokeObjectURL(blobUrl);
                                            }}
                                        >
                                            {fileDTO.originalFileName}
                                        </Button>
                                    </div>
                                ))}
                                <Flex gap={8} align={"center"}>
                                    <Typo variant={"bodyM"} type={"quaternary"} mode={"neutral"}>
                                        {formatDate(comment.createdAt)}
                                    </Typo>
                                    <div
                                        style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 4,
                                            backgroundColor: "#B0B0B0",
                                        }}
                                    />
                                    <Typo variant={"bodyM"} type={"quaternary"} mode={"neutral"}>
                                        {formatTime(comment.createdAt)}
                                    </Typo>
                                </Flex>
                            </div>
                        </div>
                    ))}
                </div>
            </Overlay>
        );
    },
);
