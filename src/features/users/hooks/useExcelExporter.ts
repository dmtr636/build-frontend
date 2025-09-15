import { useCallback } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ColumnHeader {
    key: string;
    displayLabel: string;
    width?: number;
    style?: Partial<ExcelJS.Style>;
}

interface UseExcelExporterProps {
    filename?: string;
    data: Record<string, any>[];
    columnHeaders?: ColumnHeader[];
    sheetName?: string;
}

const useExcelExporter = ({
    filename = "Отчет",
    data,
    columnHeaders,
    sheetName = "Sheet1",
}: UseExcelExporterProps) => {
    // Функция для преобразования ключей в читаемые заголовки
    const formatHeader = useCallback((key: string): string => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }, []);

    // Определяем заголовки колонок
    const getHeaders = useCallback((): ColumnHeader[] => {
        if (columnHeaders && columnHeaders.length > 0) {
            return columnHeaders;
        }

        if (data.length > 0) {
            return Object.keys(data[0]).map((key) => ({
                key,
                displayLabel: formatHeader(key),
                width: 20,
            }));
        }

        return [];
    }, [columnHeaders, data, formatHeader]);

    const downloadExcel = useCallback(async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            // Получаем заголовки колонок
            const headers = getHeaders();

            // Устанавливаем заголовки
            worksheet.columns = headers.map((header) => ({
                header: header.displayLabel,
                key: header.key,
                width: header.width || 20,
            }));

            // Добавляем стили к заголовкам
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.style = {
                    font: { bold: true, size: 12 },
                    alignment: { vertical: "middle", horizontal: "center" },
                    fill: {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE0E0E0" },
                    },
                    border: {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    },
                };
            });

            // Добавляем данные
            data.forEach((item) => {
                const row: Record<string, any> = {};
                headers.forEach((header) => {
                    row[header.key] = item[header.key] || "";
                });
                worksheet.addRow(row);
            });

            // Применяем стили к данным
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.eachCell((cell) => {
                        // @ts-expect-error its okey
                        const header = headers[cell.col - 1];
                        if (header?.style) {
                            cell.style = { ...cell.style, ...header.style };
                        }

                        // Автоподбор ширины колонок
                        if (cell.value) {
                            const column = worksheet.getColumn(cell.col);
                            // @ts-expect-error its okey
                            if (column?.width < cell.value.toString().length) {
                                column.width = cell.value.toString().length + 2;
                            }
                        }
                    });
                }
            });

            // Генерируем файл
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Скачиваем
            saveAs(blob, `${filename}.xlsx`);
        } catch (error) {
            console.error("Ошибка при создании Excel файла:", error);
            throw error;
        }
    }, [data, filename, getHeaders, sheetName]);

    return { downloadExcel };
};

export default useExcelExporter;
