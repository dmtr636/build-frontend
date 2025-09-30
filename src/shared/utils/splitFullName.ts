export function splitFullName(user: {
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
}): string {
    return [user?.lastName, user?.firstName, user?.patronymic]
        .filter(Boolean) // убираем null/undefined
        .map((s) => s!.trim()) // обрезаем пробелы у каждой части
        .filter((s) => s.length > 0) // убираем пустые строки
        .join(" ") // соединяем через пробел
        .trim(); // финальная чистка
}
