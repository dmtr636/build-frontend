export function formatPhoneNumber(number?: string) {
    if (!number) return null;
    number = number.toString();

    const countryCode = number.slice(1, 2);
    const areaCode = number.slice(2, 5);
    const firstPart = number.slice(5, 8);
    const secondPart = number.slice(8, 10);
    const thirdPart = number.slice(10, 12);

    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
}

export function formatPhone(phone?: string | number): string | null {
    if (!phone) return null;

    // оставляем только цифры
    const digits = phone.toString().replace(/\D/g, "");

    // убираем 8 или 7 в начале, заменяем на 7
    const normalized = digits.replace(/^8/, "7");

    // добиваем до 11 цифр
    if (normalized.length !== 11) return phone.toString();

    const country = normalized[0];
    const code = normalized.slice(1, 4);
    const part1 = normalized.slice(4, 7);
    const part2 = normalized.slice(7, 9);
    const part3 = normalized.slice(9, 11);

    return `+${country} (${code}) ${part1}-${part2}-${part3}`;
}
