import React, { useEffect, useRef } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

type GanttTask = {
    id: number;
    text: string;
    start_date: string; // формат dhtmlx: "DD-MM-YYYY" или ISO с config
    duration?: number;
    end_date?: string;
    progress?: number; // 0..1
    parent?: number;
    open?: boolean;
};

type GanttLink = {
    id: number;
    source: number;
    target: number;
    type: string; // "0" – finish-to-start и т.п.
};

const tasks: GanttTask[] = [
    // Сводная полоса всего проекта
    { id: 1, text: "Проект", start_date: "01-02-2020", duration: 15, progress: 0, open: true },

    // --- Релиз 1 ---
    {
        id: 10,
        text: "Релиз 1",
        parent: 1,
        start_date: "01-02-2020",
        duration: 5,
        progress: 1,
        open: true,
    },
    {
        id: 11,
        text: "Р1 — Подзадача 1",
        parent: 10,
        start_date: "01-02-2020",
        duration: 5,
        progress: 1,
    },
    {
        id: 12,
        text: "Р1 — Подзадача 2",
        parent: 10,
        start_date: "01-02-2020",
        duration: 5,
        progress: 1,
    },
    {
        id: 13,
        text: "Р1 — Подзадача 3",
        parent: 10,
        start_date: "01-02-2020",
        duration: 5,
        progress: 1,
    },

    // --- Релиз 2 ---
    {
        id: 20,
        text: "Релиз 2",
        parent: 1,
        start_date: "06-02-2020",
        duration: 5,
        progress: 0.6667,
        open: true,
    },
    {
        id: 21,
        text: "Р2 — Подзадача 1",
        parent: 20,
        start_date: "06-02-2020",
        duration: 5,
        progress: 1,
    },
    {
        id: 22,
        text: "Р2 — Подзадача 2",
        parent: 20,
        start_date: "06-02-2020",
        duration: 5,
        progress: 1,
    },
    {
        id: 23,
        text: "Р2 — Подзадача 3",
        parent: 20,
        start_date: "06-02-2020",
        duration: 5,
        progress: 0,
    },

    // --- Релиз 3 ---
    {
        id: 30,
        text: "Релиз 3",
        parent: 1,
        start_date: "11-02-2020",
        duration: 5,
        progress: 0,
        open: true,
    },
    {
        id: 31,
        text: "Р3 — Подзадача 1",
        parent: 30,
        start_date: "11-02-2020",
        duration: 5,
        progress: 0,
    },
    {
        id: 32,
        text: "Р3 — Подзадача 2",
        parent: 30,
        start_date: "11-02-2020",
        duration: 5,
        progress: 0,
    },
    {
        id: 33,
        text: "Р3 — Подзадача 3",
        parent: 30,
        start_date: "11-02-2020",
        duration: 5,
        progress: 0,
    },
];

const links: GanttLink[] = [
    // Последовательность релизов: Релиз 1 -> Релиз 2 -> Релиз 3
    { id: 100, source: 10, target: 20, type: "0" },
    { id: 101, source: 20, target: 30, type: "0" },
];

export default function GanttDXH() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gantt.i18n.setLocale("ru");

        // ⬇️ ВКЛЮЧАЕМ тултипы
        gantt.plugins({ tooltip: true });

        // формат входных дат (из tasks)
        gantt.config.date_format = "%d-%m-%Y";

        // ⬇️ УБИРАЕМ ТЕКСТ ВНУТРИ БАРОВ
        gantt.templates.task_text = () => "";

        // Сетка времени сверху
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%d %M";
        gantt.config.subscales = [{ unit: "week", step: 1, date: "Нед. %W" }];

        // Уменьшаем ширину левой колонки
        gantt.config.grid_width = 260;

        // Колонки грида
        gantt.config.columns = [
            { name: "text", label: "Название", tree: true, width: 160 },
            {
                name: "start_date",
                label: "Начало",
                align: "left",
                width: 110,
                template: (task) => gantt.date.date_to_str("%d.%m.%Y")(task.start_date),
            },
            {
                name: "end_date",
                label: "Конец",
                align: "left",
                width: 110,
                template: (task) => gantt.date.date_to_str("%d.%m.%Y")(task.end_date),
            },
            { name: "add", label: "", width: 40 },
        ];

        // Единый формат дат
        gantt.templates.date_grid = (date) => gantt.date.date_to_str("%d.%m.%Y")(date);

        // Класс завершённых задач
        gantt.templates.task_class = function (_start, _end, task) {
            return task.progress === 1 ? "task-done" : "";
        };

        // ⬇️ ШАБЛОН ТУЛТИПА ДЛЯ ЗАДАЧ
        const fmt = gantt.date.date_to_str("%d.%m.%Y");
        gantt.templates.tooltip_text = function (start, end, task) {
            const parentText = task.parent ? gantt.getTask(task.parent)?.text : null;
            const progress = Math.round((task.progress || 0) * 100);

            return `
      <b>${task.text}</b><br/>
      <b>Сроки:</b> ${fmt(start)} — ${fmt(end)}<br/>
      ${parentText ? `<b>Родитель:</b> ${parentText}<br/>` : ""}
      <b>Готово:</b> ${progress}%
    `;
        };

        // (опционально) тултип для связей
        gantt.templates.link_tooltip_text = function (link) {
            const s = gantt.getTask(link.source)?.text;
            const t = gantt.getTask(link.target)?.text;
            return `<b>Связь</b>: ${s} → ${t}<br/><b>Тип:</b> ${link.type}`;
        };

        if (ref.current) {
            gantt.init(ref.current);
            gantt.parse({ data: tasks, links });
        }

        return () => {
            gantt.clearAll();
            // @ts-ignore
            if (gantt.destructor) gantt.destructor();
        };
    }, []);

    return <div ref={ref} style={{ width: "90vw", height: "80vh" }} />;
}
