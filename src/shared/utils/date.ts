export const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

export const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    return `${day}.${month}.${year}`;
};

export const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { timeStyle: "short" });

export const localizeYears = (number: number) => {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return number + " лет";
    }

    switch (lastDigit) {
        case 1:
            return number + " год";
        case 2:
        case 3:
        case 4:
            return number + " года";
        default:
            return number + " лет";
    }
};
export const getDayDeclension = (days: number) => {
    const absDays = Math.abs(days) % 100;
    const lastDigit = absDays % 10;

    if (absDays > 10 && absDays < 20) {
        return `${days} дней`;
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return `${days} дня`;
    }
    if (lastDigit === 1) {
        return `${days} день`;
    }
    return `${days} дней`;
};
