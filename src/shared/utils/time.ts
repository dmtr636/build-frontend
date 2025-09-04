export function timeToText(time: string): string {
    const [hoursStr, minutesStr, secondsStr] = time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const hoursText = getHoursText(hours);
    const minutesText = getMinutesText(minutes);

    return `${hours} ${hoursText} ${minutes} ${minutesText}`.replace("0 часов ", "");
}

function getHoursText(hours: number): string {
    if (hours % 10 === 1 && hours % 100 !== 11) {
        return "час";
    } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
        return "часа";
    } else {
        return "часов";
    }
}

export function getMinutesText(minutes: number): string {
    if (minutes % 10 === 1 && minutes % 100 !== 11) {
        return "минута";
    } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
        return "минуты";
    } else {
        return "минут";
    }
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
    // eslint-disable-next-line prefer-const
    let [hours, minutes, seconds] = time.split(":").map(Number);

    minutes += minutesToAdd;

    while (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    }

    if (hours >= 24) {
        hours = hours % 24;
    }

    const hoursString = String(hours).padStart(2, "0");
    const minutesString = String(minutes).padStart(2, "0");
    const secondsString = String(seconds).padStart(2, "0");

    return `${hoursString}:${minutesString}:${secondsString}`;
}

export function getTimeDifference(startDateISO: string, endDateISO: string): string {
    const startDate = new Date(startDateISO);
    const endDate = new Date(endDateISO);

    const differenceInMs = endDate.getTime() - startDate.getTime();

    let differenceInSeconds = Math.floor(differenceInMs / 1000);

    const hours = Math.floor(differenceInSeconds / 3600);
    differenceInSeconds %= 3600;
    const minutes = Math.floor(differenceInSeconds / 60);
    const seconds = differenceInSeconds % 60;

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":");
}

export function getMinutesDifference(startDateISO: string, endDateISO: string): number {
    const startDate = new Date(startDateISO);
    const endDate = new Date(endDateISO);

    const differenceInMs = endDate.getTime() - startDate.getTime();

    return Math.floor(differenceInMs / 1000 / 60);
}
