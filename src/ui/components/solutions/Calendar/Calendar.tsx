import styles from "./Calendar.module.scss";
import { IconArrowLeft, IconArrowRight } from "src/ui/assets/icons";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { SelectButton } from "src/ui/components/inputs/SelectButton/SelectButton.tsx";
import { months, weeks } from "src/ui/components/solutions/Calendar/Calendar.utils.tsx";
import { intRange, intRangeClosed } from "src/shared/utils/intRange.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { DateInput } from "src/ui/components/inputs/DateInput/DateInput.tsx";
import { clsx } from "clsx";
import { layoutStore } from "src/app/AppStore.ts";

export type CalendarChangeReason = "clickDay" | "timeInput";

export interface CalendarProps {
    onChange: (value: string | null, reason?: CalendarChangeReason) => void;
    value?: string | null;
    startYear?: number;
    endYear?: number;
    disableYear?: boolean;
    disableTime?: boolean;
    disableFuture?: boolean;
    disablePast?: boolean;
    mode?: "accent" | "brand";
}

export const Calendar = memo((props: CalendarProps) => {
    const dateInstance = props.value ? new Date(props.value) : new Date();
    const {
        value,
        onChange,
        startYear = 1900,
        endYear = dateInstance.getFullYear() + 5,
        disableYear,
        disableTime,
        disableFuture,
        disablePast,
        mode = "accent",
    }: CalendarProps = props;
    const [todayDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(dateInstance);
    const [year, setYear] = useState(dateInstance.getFullYear());
    const [month, setMonth] = useState(dateInstance.getMonth());
    const [time, setTime] = useState(dateInstance.toLocaleTimeString([], { timeStyle: "short" }));

    const firstDayInMonthIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

    const setShowMonthDropdownRef = useRef<(value: boolean) => void>();
    const setShowYearDropdownRef = useRef<(value: boolean) => void>();

    useLayoutEffect(() => {
        if (value) {
            const dateValue = new Date(value);
            setSelectedDate(dateValue);
            setYear(dateValue.getFullYear());
            setMonth(dateValue.getMonth());
            setTime(dateValue.toLocaleTimeString([], { timeStyle: "short" }));
        }
    }, [value]);

    useEffect(() => {
        const isValidTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(time);
        if (isValidTime) {
            const hours = +time.split(":")[0];
            const minutes = +time.split(":")[1];
            if (selectedDate.getHours() === hours && selectedDate.getMinutes() === minutes) {
                return;
            }
            const newDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                hours,
                minutes,
            );
            setSelectedDate(newDate);
            onChange(newDate.toISOString(), "timeInput");
        }
    }, [time]);

    const isDaySelected = (day: number) =>
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

    return (
        <div
            className={styles.container}
            onClick={() => {
                setShowMonthDropdownRef.current?.(false);
                setShowYearDropdownRef.current?.(false);
            }}
        >
            <div className={styles.header}>
                <ButtonIcon
                    mode={"neutral"}
                    size={"small"}
                    onClick={() => {
                        if (month === 0) {
                            setMonth(11);
                            setYear(year - 1);
                        } else {
                            setMonth(month - 1);
                        }
                    }}
                >
                    <IconArrowLeft />
                </ButtonIcon>

                <SelectButton
                    options={months.map((month, index) => ({ name: month, value: index }))}
                    value={month}
                    onChange={setMonth}
                    mode={"neutral"}
                    buttonType={"tertiary"}
                    buttonSize={"small"}
                    width={121}
                    fullWidth={!layoutStore.isMobile}
                    onRender={(func) => (setShowMonthDropdownRef.current = func)}
                />

                {!disableYear && (
                    <SelectButton
                        options={intRangeClosed(startYear, endYear).map((year) => ({
                            name: `${year}`,
                            value: year,
                        }))}
                        value={year}
                        onChange={setYear}
                        mode={"neutral"}
                        buttonType={"tertiary"}
                        buttonSize={"small"}
                        width={87}
                        fullWidth={!layoutStore.isMobile}
                        onRender={(func) => (setShowYearDropdownRef.current = func)}
                    />
                )}

                <ButtonIcon
                    mode={"neutral"}
                    size={"small"}
                    onClick={() => {
                        if (month === 11) {
                            setMonth(0);
                            setYear(year + 1);
                        } else {
                            setMonth(month + 1);
                        }
                    }}
                >
                    <IconArrowRight />
                </ButtonIcon>
            </div>
            <div className={styles.grid}>
                {weeks.map((week) => (
                    <Button
                        type={"tertiary"}
                        mode={mode}
                        size={"small"}
                        clickable={false}
                        key={week}
                        overflow={"visible"}
                        className={clsx(mode === "brand" && styles.weekButton)}
                    >
                        {week}
                    </Button>
                ))}

                {intRange(1, firstDayInMonthIndex || 7).map((index) => (
                    <div key={index} />
                ))}

                {intRangeClosed(1, daysInMonth).map((day) => (
                    <Button
                        type={isDaySelected(day) && props.value ? "primary" : "tertiary"}
                        mode={isDaySelected(day) && props.value ? mode : "neutral"}
                        size={"small"}
                        onClick={() => {
                            const newDate = new Date(
                                year,
                                month,
                                day,
                                selectedDate.getHours(),
                                selectedDate.getMinutes(),
                            );
                            setSelectedDate(newDate);
                            onChange(newDate.toISOString(), "clickDay");
                        }}
                        disabled={
                            (disablePast && new Date(year, month, day + 1) < todayDate) ||
                            (disableFuture && new Date(year, month, day) > todayDate)
                        }
                        disableTransition={day === selectedDate.getDate()}
                        key={day}
                    >
                        {`${day}`}
                    </Button>
                ))}
            </div>

            {!disableTime && (
                <>
                    <div className={styles.divider} />
                    <div className={styles.timeRow}>
                        <Typo variant={"actionL"} mode={"neutral"} type={"quaternary"}>
                            Время
                        </Typo>
                        <div className={styles.timeInput}>
                            <DateInput
                                size={"medium"}
                                value={time}
                                dateType={"time"}
                                onChange={setTime}
                                outlined={true}
                                placeholder={todayDate.toLocaleTimeString([], {
                                    timeStyle: "short",
                                })}
                                centered={true}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

Calendar.displayName = "Calendar";
