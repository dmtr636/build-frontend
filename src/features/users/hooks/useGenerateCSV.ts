import { mkConfig, generateCsv, download } from "export-to-csv";

interface generateCSV {
    filename?: string;
    /**
     * Значения в объекте только string, иначе ломается
     */
    data: Record<string, string>[];
    /**
     * key значение в объекте, displayLabel как отображается в таблице
     */
    columnHeaders?: { key: string; displayLabel: string }[];
}

export const useGenerateCSV = ({ filename, data, columnHeaders }: generateCSV) => {
    const csvConfig = mkConfig({
        fieldSeparator: ";",
        quoteStrings: true,
        filename: filename ? filename : "Отчет",
        decimalSeparator: ".",
        useTextFile: false,
        useBom: true,
        fileExtension: "xlsx",
        columnHeaders: columnHeaders
            ? columnHeaders
            : [
                  {
                      key: "fullName",
                      displayLabel: "Имя",
                  },
                  {
                      key: "login",
                      displayLabel: "Логин",
                  },
                  {
                      key: "position",
                      displayLabel: "Должность",
                  },
                  {
                      key: "role",
                      displayLabel: "Роль в системек",
                  },
                  {
                      key: "messenger",
                      displayLabel: "Мессенджер",
                  },
                  {
                      key: "email",
                      displayLabel: "Почта",
                  },
                  {
                      key: "workPhone",
                      displayLabel: "Рабочий телефон",
                  },
                  {
                      key: "personalPhone",
                      displayLabel: "Личный телефон",
                  },
                  {
                      key: "createDate",
                      displayLabel: "Регистрация в системе",
                  },
              ],
    });
    const csv = generateCsv(csvConfig)(data);
    const downloadCsv = () => {
        download(csvConfig)(csv);
    };
    return { downloadCsv };
};
