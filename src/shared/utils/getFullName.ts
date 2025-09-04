export const getFullName = (
    person?: {
        lastName?: string | null;
        firstName?: string | null;
        patronymic?: string | null;
    } | null,
) => [person?.lastName, person?.firstName, person?.patronymic].filter(Boolean).join(" ");

export const getNameInitials = (person?: {
    lastName?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
}) =>
    [
        person?.lastName,
        [person?.firstName, person?.patronymic]
            .filter(Boolean)
            .map((item) => `${item?.[0]}.`)
            .join(""),
    ]
        .filter(Boolean)
        .join(" ");

export const getNameInitialsFromFullName = (fullName?: string) =>
    fullName
        ? getNameInitials({
              lastName: fullName.split(" ")[0],
              firstName: fullName.split(" ")[1],
              patronymic: fullName.split(" ")[2],
          })
        : undefined;
