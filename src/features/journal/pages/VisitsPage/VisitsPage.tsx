import { observer } from "mobx-react-lite";
import styles from "./VisitsPage.module.scss";
import { IconBadge, IconClose, IconCopy, IconError, IconUpdate } from "src/ui/assets/icons";
import React, { useEffect, useLayoutEffect } from "react";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Popover } from "src/ui/components/solutions/Popover/Popover.tsx";
import { useParams, useSearchParams } from "react-router-dom";
import { accountStore, appStore, userStore, visitsStore } from "src/app/AppStore.ts";
import LZString from "lz-string";
import { Helmet } from "react-helmet";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Chip } from "src/ui/components/controls/Chip/Chip.tsx";
import { formatDateShort, formatTime } from "src/shared/utils/date.ts";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { Visit } from "src/features/journal/pages/VisitsPage/Visit.ts";
import { AutocompleteOption } from "src/ui/components/inputs/Autocomplete/Autocomplete.types.ts";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

export const VisitsPage = observer(() => {
    const { id } = useParams();
    const currentObj = appStore.objectStore.ObjectMap.get(id ?? "");
    const [searchParams] = useSearchParams();

    const getUserLink = (userId: string) => {
        const user = userStore.usersMap.get(userId);
        if (!user) {
            return "-";
        }
        return (
            <Button
                type={"text"}
                className={styles.linkButton}
                href={`/admin/users/${user.id}`}
                target={"_blank"}
            >
                {getNameInitials(user) || user.login}
            </Button>
        );
    };

    const hasActiveFilters = visitsStore.hasActiveFilters;

    const userIdSearchParam = searchParams.get("userId");

    const userPosition = [
        ...new Set(userStore.users.filter((u) => u.position).map((u) => u.position)),
    ];
    const usersPositionOptions: AutocompleteOption<string>[] = userPosition.map((user) => ({
        name: user ?? "",
        value: user ?? "",
    }));

    useEffect(() => {
        if (userIdSearchParam) {
            visitsStore.filters.userIds = [userIdSearchParam];
        }
    }, [userIdSearchParam]);

    useLayoutEffect(() => {
        if (id) {
            visitsStore.fetchVisits(id);
        }
    }, [id]);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconBadge />
                </div>
                Визиты
                {accountStore.isAdmin && (
                    <Popover autoCloseDelay={2000} header={"Ссылка скопирована"} mode={"neutral"}>
                        <Button
                            type={"text"}
                            size={"small"}
                            iconBefore={<IconCopy />}
                            style={{
                                marginLeft: "auto",
                            }}
                            onClick={() => {
                                if (!currentObj) {
                                    return;
                                }
                                const data = {
                                    id: currentObj.id,
                                    name: currentObj.name,
                                    number: currentObj.objectNumber,
                                    address: [
                                        currentObj.address?.city,
                                        currentObj.address?.street,
                                        currentObj.address?.house,
                                    ]
                                        .filter(Boolean)
                                        .join(", "),
                                };
                                const compressed = LZString.compressToEncodedURIComponent(
                                    JSON.stringify(data),
                                );
                                const url = `${window.location.origin}/qr/${compressed}`;
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            Ссылка на QR-код для подтверждения местоположения
                        </Button>
                    </Popover>
                )}
            </div>
            <div className={styles.container}>
                <Helmet>
                    <title>{currentObj?.name}</title>
                </Helmet>
                <div>
                    <div className={styles.filterContainer}>
                        <div className={styles.filterHead}>
                            <span style={{ opacity: 0.6 }}>Фильтры</span>
                            {hasActiveFilters && (
                                <Button
                                    onClick={visitsStore.resetFilters}
                                    size={"tiny"}
                                    type={"outlined"}
                                    mode={"neutral"}
                                    iconBefore={<IconUpdate />}
                                >
                                    Сбросить
                                </Button>
                            )}
                        </div>
                        <FlexColumn gap={16} style={{ marginTop: 20 }}>
                            <DatePicker
                                value={visitsStore.filters.date}
                                onChange={(value) => (visitsStore.filters.date = value)}
                                width={"100%"}
                                placeholder={"За всё время"}
                                size={"medium"}
                                disableTime={true}
                                formName={"Дата"}
                                disableFuture={true}
                            ></DatePicker>
                            <MultipleAutocomplete
                                values={visitsStore.filters.userIds}
                                multiple={true}
                                formName={"Пользователь"}
                                size={"medium"}
                                options={userStore.users
                                    .map((user) => ({
                                        name: getNameInitials(user),
                                        value: user.id,
                                    }))
                                    .filter((user) => user.name)}
                                placeholder={"Все"}
                                onValuesChange={(values) => {
                                    visitsStore.filters.userIds = values;
                                }}
                            />
                            <MultipleAutocomplete
                                values={visitsStore.filters.positions}
                                multiple={true}
                                formName={"Должность"}
                                size={"medium"}
                                options={usersPositionOptions}
                                placeholder={"Все"}
                                onValuesChange={(values) => {
                                    visitsStore.filters.positions = values;
                                }}
                                fullWidth={false}
                                tipPosition={"top-left"}
                            />
                        </FlexColumn>
                    </div>
                </div>
                <FlexColumn gap={20}>
                    <ExplorationInput
                        onInputChange={(value) => (visitsStore.search = value)}
                        inputValue={visitsStore.search}
                        size={"large"}
                        inputPlaceholder={"ФИО пользователя, дата, время или должность"}
                    />
                    {hasActiveFilters && (
                        <Flex gap={8} wrap={"wrap"}>
                            {visitsStore.filters.date && (
                                <Chip
                                    size={"small"}
                                    onClick={() => {
                                        visitsStore.filters.date = null;
                                    }}
                                    iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                                >
                                    {formatDateShort(visitsStore.filters.date)}
                                </Chip>
                            )}
                            {visitsStore.filters.userIds.map((userId) => (
                                <Chip
                                    key={userId}
                                    size={"small"}
                                    onClick={() => {
                                        visitsStore.filters.userIds =
                                            visitsStore.filters.userIds.filter(
                                                (id) => id !== userId,
                                            );
                                    }}
                                    iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                                >
                                    {getNameInitials(userStore.usersMap.get(userId))}
                                </Chip>
                            ))}
                            {visitsStore.filters.positions.map((position) => (
                                <Chip
                                    key={position}
                                    size={"small"}
                                    onClick={() => {
                                        visitsStore.filters.positions =
                                            visitsStore.filters.positions.filter(
                                                (id) => id !== position,
                                            );
                                    }}
                                    iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                                >
                                    {position}
                                </Chip>
                            ))}
                        </Flex>
                    )}
                    {(hasActiveFilters || visitsStore.search) &&
                    !visitsStore.filteredVisits.length ? (
                        <div className={styles.containerError}>
                            <IconError className={styles.iconError} />
                            <Typo
                                variant={"actionXL"}
                                mode={"neutral"}
                                type={"secondary"}
                                className={styles.errorText}
                            >
                                Не нашли визитов <br />с выбранными настройками
                            </Typo>
                            <Button
                                style={{ marginTop: 32 }}
                                type={"primary"}
                                mode={"neutral"}
                                size={"small"}
                                onClick={() => {
                                    visitsStore.resetFilters();
                                    visitsStore.search = "";
                                }}
                            >
                                Сбросить
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableWrapper}>
                                <div>
                                    <Table<Visit>
                                        data={visitsStore.filteredVisits}
                                        tableSettings={visitsStore.tableSettings}
                                        onChangeTableSettings={(settings) => {
                                            visitsStore.tableSettings = settings;
                                        }}
                                        activeSortDirection={visitsStore.sort.direction}
                                        activeSortField={visitsStore.sort.field}
                                        setActiveSortDirection={(direction) =>
                                            (visitsStore.sort.direction = direction)
                                        }
                                        setActiveSortField={(activeSort) =>
                                            (visitsStore.sort.field = activeSort)
                                        }
                                        loading={visitsStore.loading}
                                        headerRowHasBorderRadius={true}
                                        columns={[
                                            {
                                                name: "Пользователь",
                                                field: "userId",
                                                width: 190,
                                                sort: true,
                                                index: true,
                                                render: (data: Visit) => {
                                                    return getUserLink(data.user.id);
                                                },
                                                resizable: false,
                                            },
                                            {
                                                name: "Дата и время",
                                                field: "visitDate",
                                                width: 152,
                                                sort: true,
                                                render: (data: Visit) => {
                                                    return (
                                                        <Grid
                                                            columns={"70px 50px"}
                                                            gap={1}
                                                            align={"center"}
                                                        >
                                                            <Typo variant={"bodyL"}>
                                                                {formatDateShort(data.visitDate)}
                                                            </Typo>
                                                            <Typo
                                                                variant={"bodyL"}
                                                                type={"quaternary"}
                                                                mode={"neutral"}
                                                                style={{ textAlign: "center" }}
                                                            >
                                                                {formatTime(data.visitDate)}
                                                            </Typo>
                                                        </Grid>
                                                    );
                                                },
                                                resizable: false,
                                            },
                                            {
                                                name: "Должность",
                                                field: "position",
                                                width: 116,
                                                render: (data: Visit) => {
                                                    if (!data.user.position) {
                                                        return "-";
                                                    }
                                                    const initials = data.user?.position
                                                        ?.split(" ")
                                                        .map((n) => n[0]?.toUpperCase())
                                                        .join("");
                                                    return (
                                                        <Tooltip header={data.user.position}>
                                                            <Typo variant={"bodyL"} noWrap={true}>
                                                                {initials}
                                                            </Typo>
                                                        </Tooltip>
                                                    );
                                                },
                                                resizable: false,
                                            },
                                            {
                                                name: "Нарушения",
                                                field: "violations",
                                                width: 230,
                                                render: (data: Visit) => {
                                                    if (!data.violations.length) {
                                                        return "-";
                                                    }
                                                    return (
                                                        <Flex gap={6}>
                                                            <Button
                                                                type={"text"}
                                                                className={styles.linkButton}
                                                                href={`/admin/journal/${id}/violations`}
                                                                target={"_blank"}
                                                                counter={data.violations.length}
                                                            >
                                                                Найдено
                                                            </Button>
                                                        </Flex>
                                                    );
                                                },
                                                resizable: false,
                                            },
                                            {
                                                name: "Проверки",
                                                field: "works",
                                                width: 230,
                                                render: (data: Visit) => {
                                                    if (!data.works.length) {
                                                        return "-";
                                                    }
                                                    return (
                                                        <Flex gap={6}>
                                                            <Button
                                                                type={"text"}
                                                                className={styles.linkButton}
                                                                href={`/admin/journal/${id}/status`}
                                                                target={"_blank"}
                                                                counter={data.works.length}
                                                            >
                                                                Проверено работ
                                                            </Button>
                                                        </Flex>
                                                    );
                                                },
                                                resizable: false,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </FlexColumn>
            </div>
        </div>
    );
});
