import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import styles from "./EventsPage.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconClose, IconError, IconUpdate } from "src/ui/assets/icons";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import {
    appStore,
    eventsStore,
    objectStore,
    organizationsStore,
    registryStore,
    userStore,
} from "src/app/AppStore.ts";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { IEvent } from "src/features/events/Event.ts";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import {
    autocompleteActionLocaleOptions,
    eventActionLocale,
} from "src/features/events/eventsLocale.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { formatDateShort, formatTime } from "src/shared/utils/date.ts";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { Flex } from "src/ui/components/atoms/Flex/Flex.tsx";
import { Chip } from "src/ui/components/controls/Chip/Chip.tsx";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const EventsPage = observer(() => {
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

    const getObjectLink = (objectId: string, fallbackId?: string) => {
        const object =
            objectStore.ObjectMap.get(objectId) ?? objectStore.ObjectMap.get(fallbackId ?? "");
        if (!object) {
            return "-";
        }
        return (
            <Button
                type={"text"}
                className={styles.linkButton}
                href={`/admin/journal/${object.id}`}
                target={"_blank"}
                style={{
                    maxWidth: "100%",
                }}
            >
                {object.name}
            </Button>
        );
    };

    const hasActiveFilters = eventsStore.hasActiveFilters;

    const userIdSearchParam = searchParams.get("userId");

    useEffect(() => {
        if (userIdSearchParam) {
            eventsStore.filters.userIds = [userIdSearchParam];
        }
    }, [userIdSearchParam]);

    useEffect(() => {
        appStore.eventsStore.fetchEvents();
    }, []);

    return (
        <div className={styles.container}>
            <Helmet>
                <title>История – Build</title>
            </Helmet>
            <div>
                <div className={styles.filterContainer}>
                    <div className={styles.filterHead}>
                        <span style={{ opacity: 0.6 }}>Фильтры</span>
                        {hasActiveFilters && (
                            <Button
                                onClick={eventsStore.resetFilters}
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
                            value={eventsStore.filters.date}
                            onChange={(value) => (eventsStore.filters.date = value)}
                            width={"100%"}
                            placeholder={"За всё время"}
                            size={"medium"}
                            disableTime={true}
                            formName={"Дата"}
                            disableFuture={true}
                        ></DatePicker>
                        <MultipleAutocomplete
                            values={eventsStore.filters.userIds}
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
                                eventsStore.filters.userIds = values;
                            }}
                        />
                        {eventsStore.tab === "work" && (
                            <MultipleAutocomplete
                                values={eventsStore.filters.objectIds}
                                multiple={true}
                                formName={"Объект"}
                                size={"medium"}
                                options={objectStore.objects.map((o) => ({
                                    name: o.name,
                                    value: o.id,
                                }))}
                                placeholder={"Все"}
                                fullWidth={false}
                                tipPosition={"top-left"}
                                onValuesChange={(values) => {
                                    eventsStore.filters.objectIds = values;
                                }}
                            />
                        )}
                        <MultipleAutocomplete
                            values={eventsStore.filters.actions}
                            multiple={true}
                            formName={"Действие"}
                            size={"medium"}
                            options={autocompleteActionLocaleOptions}
                            placeholder={"Все"}
                            onValuesChange={(values) => {
                                eventsStore.filters.actions = values;
                            }}
                            fullWidth={false}
                            tipPosition={"top-left"}
                        />
                    </FlexColumn>
                </div>
            </div>
            <FlexColumn gap={20}>
                <ExplorationInput
                    onInputChange={(value) => (eventsStore.search = value)}
                    inputValue={eventsStore.search}
                    size={"large"}
                    inputPlaceholder={"ФИО пользователя, дата, время или текст действия"}
                />
                {hasActiveFilters && (
                    <Flex gap={8} wrap={"wrap"}>
                        {eventsStore.filters.date && (
                            <Chip
                                size={"small"}
                                onClick={() => {
                                    eventsStore.filters.date = null;
                                }}
                                iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                            >
                                {formatDateShort(eventsStore.filters.date)}
                            </Chip>
                        )}
                        {eventsStore.filters.userIds.map((userId) => (
                            <Chip
                                key={userId}
                                size={"small"}
                                onClick={() => {
                                    eventsStore.filters.userIds =
                                        eventsStore.filters.userIds.filter((id) => id !== userId);
                                }}
                                iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                            >
                                {getNameInitials(userStore.usersMap.get(userId))}
                            </Chip>
                        ))}
                        {eventsStore.filters.objectIds.map((objectId) => (
                            <Chip
                                key={objectId}
                                size={"small"}
                                onClick={() => {
                                    eventsStore.filters.objectIds =
                                        eventsStore.filters.objectIds.filter(
                                            (id) => id !== objectId,
                                        );
                                }}
                                iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                            >
                                {objectId}
                            </Chip>
                        ))}
                        {eventsStore.filters.actions.map((action) => (
                            <Chip
                                key={action}
                                size={"small"}
                                onClick={() => {
                                    eventsStore.filters.actions =
                                        eventsStore.filters.actions.filter((id) => id !== action);
                                }}
                                iconAfter={<IconClose className={styles.chipDeleteIcon} />}
                            >
                                {
                                    eventActionLocale[
                                        action.split(".")[0] as keyof typeof eventActionLocale
                                    ]?.[action.split(".").slice(1).join()]
                                }
                            </Chip>
                        ))}
                    </Flex>
                )}
                {(hasActiveFilters || eventsStore.search) && !eventsStore.filteredEvents.length ? (
                    <div className={styles.containerError}>
                        <IconError className={styles.iconError} />
                        <Typo
                            variant={"actionXL"}
                            mode={"neutral"}
                            type={"secondary"}
                            className={styles.errorText}
                        >
                            Не нашли действий <br />с выбранными настройками
                        </Typo>
                        <Button
                            style={{ marginTop: 32 }}
                            type={"primary"}
                            mode={"neutral"}
                            size={"small"}
                            onClick={() => {
                                eventsStore.resetFilters();
                                eventsStore.search = "";
                            }}
                        >
                            Сбросить
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <div className={styles.tableHeader}>
                                <Tabs
                                    value={eventsStore.tab}
                                    onChange={(value) => {
                                        eventsStore.tab = value;
                                        eventsStore.filters.actions = [];
                                        eventsStore.filters.objectIds = [];
                                    }}
                                    size={"large"}
                                    type={"primary"}
                                    mode={"neutral"}
                                    noBottomBorder={true}
                                    compact={true}
                                    tabs={[
                                        {
                                            name: "Рабочие процессы",
                                            value: "work",
                                            disabled: !eventsStore.filteredEventsWithoutTab.some(
                                                (e) => e.actionType === "work",
                                            ),
                                        },
                                        {
                                            name: "Системные события",
                                            value: "system",
                                            disabled: !eventsStore.filteredEventsWithoutTab.some(
                                                (e) => e.actionType === "system",
                                            ),
                                        },
                                    ]}
                                />
                            </div>
                            <div>
                                <Table<IEvent>
                                    data={eventsStore.filteredEvents}
                                    tableSettings={eventsStore.tableSettings}
                                    onChangeTableSettings={(settings) => {
                                        eventsStore.tableSettings = settings;
                                    }}
                                    activeSortDirection={eventsStore.sort.direction}
                                    activeSortField={eventsStore.sort.field}
                                    setActiveSortDirection={(direction) =>
                                        (eventsStore.sort.direction = direction)
                                    }
                                    setActiveSortField={(activeSort) =>
                                        (eventsStore.sort.field = activeSort)
                                    }
                                    loading={eventsStore.loading}
                                    columns={[
                                        {
                                            name: "Пользователь",
                                            field: "userId",
                                            width: 190,
                                            sort: true,
                                            index: true,
                                            render: (data: IEvent) => {
                                                return getUserLink(data.userId);
                                            },
                                            resizable: false,
                                        },
                                        {
                                            name: "Дата и время",
                                            field: "createdAt",
                                            width: 152,
                                            sort: true,
                                            render: (data: IEvent) => {
                                                return (
                                                    <Grid
                                                        columns={"70px 50px"}
                                                        gap={1}
                                                        align={"center"}
                                                    >
                                                        <Typo variant={"bodyL"}>
                                                            {formatDateShort(data.createdAt)}
                                                        </Typo>
                                                        <Typo
                                                            variant={"bodyL"}
                                                            type={"quaternary"}
                                                            mode={"neutral"}
                                                            style={{ textAlign: "center" }}
                                                        >
                                                            {formatTime(data.createdAt)}
                                                        </Typo>
                                                    </Grid>
                                                );
                                            },
                                            resizable: false,
                                        },
                                        ...(eventsStore.tab === "work"
                                            ? [
                                                  {
                                                      name: "Объект",
                                                      field: "objectId",
                                                      width: 290,
                                                      render: (data: IEvent) => {
                                                          return getObjectLink(
                                                              data.objectId ?? "",
                                                              data.info?.projectId,
                                                          );
                                                      },
                                                      resizable: false,
                                                  },
                                              ]
                                            : []),
                                        {
                                            name: "Действие",
                                            field: "action",
                                            width: 476 - (eventsStore.tab === "work" ? 80 : 0),
                                            render: (data: IEvent) => {
                                                if (!data.objectName) {
                                                    return "-";
                                                }
                                                return (
                                                    <Typo variant={"bodyL"} noWrap={true}>
                                                        {
                                                            eventActionLocale[data.objectName]?.[
                                                                data.action
                                                            ]
                                                        }
                                                        <Typo
                                                            variant={"subheadM"}
                                                            style={{ display: "inline" }}
                                                        >
                                                            {data.objectName === "user" &&
                                                                data.objectId &&
                                                                (userStore.usersMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${userStore.usersMap.get(data.objectId)?.login}»`
                                                                    : ` «${data.info.login}»`)}
                                                            {data.objectName === "organization" &&
                                                                data.objectId &&
                                                                (organizationsStore.organizationsMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${organizationsStore.organizationsMap.get(data.objectId)?.name}»`
                                                                    : data.info.name
                                                                      ? ` «${data.info.name}»`
                                                                      : "")}
                                                            {data.objectName ===
                                                                "organization-employees" &&
                                                                data.objectId &&
                                                                (organizationsStore.organizationsMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${organizationsStore.organizationsMap.get(data.objectId)?.name}»`
                                                                    : data.info.name
                                                                      ? ` «${data.info.name}»`
                                                                      : "")}
                                                            {data.objectName ===
                                                                "normative-document" &&
                                                                data.objectId &&
                                                                (registryStore.documentsMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${registryStore.documentsMap.get(data.objectId)?.name}»`
                                                                    : data.info.name
                                                                      ? ` «${data.info.name}»`
                                                                      : "")}
                                                            {data.objectName ===
                                                                "construction-violation" &&
                                                                data.objectId &&
                                                                (registryStore.violationsMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${registryStore.violationsMap.get(data.objectId)?.name}»`
                                                                    : data.info.name
                                                                      ? ` «${data.info.name}»`
                                                                      : "")}
                                                            {data.objectName ===
                                                                "construction-work" &&
                                                                data.objectId &&
                                                                (registryStore.worksMap.has(
                                                                    data.objectId,
                                                                )
                                                                    ? ` «${registryStore.worksMap.get(data.objectId)?.name}»`
                                                                    : data.info.name
                                                                      ? ` «${data.info.name}»`
                                                                      : "")}
                                                        </Typo>
                                                    </Typo>
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
    );
});
