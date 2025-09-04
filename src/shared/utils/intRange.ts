export const intRange = (from: number, to: number) => {
    return Array.from({ length: to - from }, (_, index) => index + from);
};

export const intRangeClosed = (from: number, to: number) => {
    return Array.from({ length: to - from + 1 }, (_, index) => index + from);
};
