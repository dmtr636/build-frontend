export function formatPhoneNumber(number: string) {
    number = number.toString();

    const countryCode = number.slice(1, 2);
    const areaCode = number.slice(2, 5);
    const firstPart = number.slice(5, 8);
    const secondPart = number.slice(8, 10);
    const thirdPart = number.slice(10, 12);

    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
}
