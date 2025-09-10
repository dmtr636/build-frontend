import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import styles from "./EventsPage.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconClose } from "src/ui/assets/icons";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { eventsStore, userStore } from "src/app/AppStore.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { Table } from "src/ui/components/segments/Table/Table.tsx";
import { IEvent } from "src/features/events/Event.ts";
import { getNameInitials } from "src/shared/utils/getFullName.ts";
import { eventActionLocale, eventUserActionLocale } from "src/features/events/eventsLocale.ts";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { Grid } from "src/ui/components/atoms/Grid/Grid.tsx";
import { formatDate, formatDateShort, formatTime } from "src/shared/utils/date.ts";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";

export const EventsPage = observer(() => {
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
                {getNameInitials(user)}
            </Button>
        );
    };

    return (
        <div className={styles.container}>
            <div>
                <div className={styles.filterContainer}>
                    <div className={styles.filterHead}>
                        <span style={{ opacity: 0.6 }}>Фильтры</span>
                        {(!!eventsStore.filters.date ||
                            !!eventsStore.filters.actions.length ||
                            !!eventsStore.filters.objectIds.length ||
                            !!eventsStore.filters.userIds.length) && (
                            <Button
                                onClick={eventsStore.resetFilters}
                                size={"tiny"}
                                type={"outlined"}
                                mode={"neutral"}
                                iconBefore={<IconClose />}
                            >
                                Сбросить
                            </Button>
                        )}
                    </div>
                    <FlexColumn gap={16} style={{ marginTop: 20 }}>
                        Фильтры пока не работают(
                        <DatePicker
                            value={eventsStore.filters.date}
                            onChange={(value) => (eventsStore.filters.date = value)}
                            width={"100%"}
                            placeholder={"За всё время"}
                            size={"large"}
                        ></DatePicker>
                        {/*<MultipleSelect*/}
                        {/*    values={positionValue}*/}
                        {/*    onValuesChange={setPositionValue}*/}
                        {/*    options={usersPositionOptions}*/}
                        {/*    multiple={true}*/}
                        {/*    placeholder={"Все"}*/}
                        {/*    formName={"Должность"}*/}
                        {/*></MultipleSelect>*/}
                        {/*<MultipleSelect*/}
                        {/*    values={rolesValue}*/}
                        {/*    onValuesChange={setRolesValue}*/}
                        {/*    placeholder={"Все"}*/}
                        {/*    options={rolesOptions}*/}
                        {/*    multiple={true}*/}
                        {/*    formName={"Роль в системе"}*/}
                        {/*></MultipleSelect>*/}
                        {/*<MultipleAutocomplete*/}
                        {/*    formName={"Объекты"}*/}
                        {/*    options={rolesOptions}*/}
                        {/*    placeholder={"Все"}*/}
                        {/*    values={rolesValue}*/}
                        {/*    onValuesChange={setRolesValue}*/}
                        {/*    multiple={true}*/}
                        {/*/>*/}
                        {/*<Checkbox*/}
                        {/*    size={"large"}*/}
                        {/*    onChange={setOnlineOnly}*/}
                        {/*    checked={onlineOnly}*/}
                        {/*    title={"Только в сети"}*/}
                        {/*/>*/}
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
                <div className={styles.tableWrapper}>
                    <div className={styles.tableHeader}>
                        <Tabs
                            value={eventsStore.tab}
                            onChange={(value) => (eventsStore.tab = value)}
                            size={"large"}
                            type={"primary"}
                            mode={"accent"}
                            noBottomBorder={true}
                            tabs={[
                                {
                                    name: "Рабочие процеесы",
                                    value: "work",
                                },
                                {
                                    name: "Системные события",
                                    value: "system",
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
                                },
                                {
                                    name: "Дата и время",
                                    field: "date",
                                    width: 152,
                                    sort: true,
                                    render: (data: IEvent) => {
                                        return (
                                            <Grid
                                                columns={"70px auto 50px"}
                                                gap={1}
                                                align={"center"}
                                            >
                                                <Typo variant={"bodyL"}>
                                                    {formatDateShort(data.date)}
                                                </Typo>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="4"
                                                    height="5"
                                                    viewBox="0 0 4 5"
                                                    fill="none"
                                                >
                                                    <circle
                                                        opacity="0.5"
                                                        cx="2"
                                                        cy="2.5"
                                                        r="2"
                                                        fill="#5F6A81"
                                                    />
                                                </svg>
                                                <Typo
                                                    variant={"bodyL"}
                                                    type={"quaternary"}
                                                    mode={"neutral"}
                                                    style={{ textAlign: "center" }}
                                                >
                                                    {formatTime(data.date)}
                                                </Typo>
                                            </Grid>
                                        );
                                    },
                                },
                                ...(eventsStore.tab === "work"
                                    ? [
                                          {
                                              name: "Объект",
                                              field: "objectId",
                                              width: 145,
                                              render: (data: IEvent) => {
                                                  return data.objectId;
                                              },
                                          },
                                      ]
                                    : []),
                                {
                                    name: "Действие",
                                    field: "action",
                                    width: 476,
                                    render: (data: IEvent) => {
                                        if (!data.objectName) {
                                            return "-";
                                        }
                                        return (
                                            <Typo variant={"bodyL"} noWrap={true}>
                                                {eventActionLocale[data.objectName][data.action]}
                                            </Typo>
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>
            </FlexColumn>
        </div>
    );
});
