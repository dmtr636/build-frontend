import React, { useEffect, useMemo, useRef, useState } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { ProjectWork } from "src/features/journal/types/ProjectWork.ts";

const isoToYYYYMMDD = (iso: string) => {
    // Берём первые 10 символов «YYYY-MM-DD»
    return (iso ?? "").slice(0, 10);
};

const diffDaysInclusive = (startISO: string, endISO: string) => {
    const s = new Date(isoToYYYYMMDD(startISO) + "T00:00:00Z").getTime();
    const e = new Date(isoToYYYYMMDD(endISO) + "T00:00:00Z").getTime();
    const one = 24 * 60 * 60 * 1000;
    const d = Math.floor((e - s) / one) + 1;
    return Math.max(1, d);
};

const addDays = (isoStart: string, days: number) => {
    const d = new Date(isoToYYYYMMDD(isoStart) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};

type GanttTask = {
    id: string;
    text: string;
    start_date: string; // формат должен соответствовать gantt.config.date_format
    duration: number; // дни
    progress?: number; // 0..1
    parent?: string;
    open?: boolean;
    status?: string;
};

function buildGanttTasks(works: ProjectWork[], currentWorkVersion: number): GanttTask[] {
    const tasks: GanttTask[] = [];

    works.forEach((work) => {
        const verIdx = Math.max(0, (currentWorkVersion ?? 1) - 1);
        const version = work.workVersions?.[verIdx] ?? work.workVersion;
        if (!version?.startDate || !version?.endDate) return; // пропускаем некорректные

        const start = isoToYYYYMMDD(version.startDate);
        const end = isoToYYYYMMDD(version.endDate);
        const total = diffDaysInclusive(start, end);

        // Родительская задача
        const parentId = work.id;
        tasks.push({
            id: parentId,
            text: work.name,
            start_date: start,
            duration: total,
            progress: Math.max(0, Math.min(1, (work.completionPercent ?? 0) / 100)),
            status: work.status,
            open: false,
        });

        // Детальные стадии (равномерно подряд)
        const stages = [...(work.stages ?? [])].sort(
            (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
        );

        if (stages.length > 0) {
            // Равномерное распределение длительности с учётом остатка
            const base = Math.floor(total / stages.length);
            const rest = total % stages.length;

            let cursor = start; // старт текущего слота
            stages.forEach((stage, idx) => {
                const slot = base + (idx < rest ? 1 : 0); // распределяем остаток в первые `rest` задач
                const childId = `${parentId}__${stage.id}`;

                tasks.push({
                    id: childId,
                    text: stage.name,
                    start_date: cursor,
                    duration: slot,
                    progress: stage.status === "DONE" || stage.status === "FINISHED" ? 1 : 0,
                    parent: parentId,
                    status: stage.status,
                    open: false,
                });

                // следующий слот начинается после текущего участка
                cursor = addDays(cursor, slot);
            });
        }
    });

    return tasks;
}

type ScaleMode = "day" | "week" | "month";

type Props = {
    works: ProjectWork[];
    currentWorkVersion: number;

    initialScale?: ScaleMode;

    width?: string | number;
    height?: string | number;
};

export default function GanttWorks({
    works,
    currentWorkVersion,
    initialScale = "day",
    width = "100%",
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<ScaleMode>(initialScale);

    // Пересчитываем задачи из доменных данных
    const data = useMemo(
        () => buildGanttTasks(works, currentWorkVersion),
        [works, currentWorkVersion],
    );

    // Инициализация один раз
    useEffect(() => {
        if (!ref.current) return;

        gantt.i18n.setLocale("ru");
        gantt.plugins({ tooltip: true });

        // формату дат в данных соответствуем ISO "YYYY-MM-DD"
        gantt.config.date_format = "%Y-%m-%d";
        gantt.config.autosize = "y"; // или "xy", если хочешь и ширину под шкалу времени подгонять

        // Сетка слева
        gantt.config.grid_width = 320;
        gantt.config.columns = [
            { name: "text", label: "Название", tree: true, width: 184, resize: true },
            {
                name: "start_date",
                label: "Начало",
                width: 88, // ⬅️ было 80, +10%
                template: (task) => gantt.date.date_to_str("%d.%m.%Y")(task.start_date as any),
            },
            {
                name: "end_date",
                label: "Конец",
                width: 88, // ⬅️ было 80, +10%
                template: (task) => gantt.date.date_to_str("%d.%m.%Y")(task.end_date as any),
            },
        ];

        // без связей: просто не передаём их в parse
        gantt.config.readonly = true; // если нужно запретить интерактив — включите, иначе можно false

        // Текст на барах скрыт — выглядит чище
        gantt.templates.task_text = () => "";

        // Подсветка завершённых родителей
        gantt.templates.task_class = (_start, _end, task) => {
            if (task.status === "ON_CHECK") {
                return "task-on-check";
            }
            if (task.progress === 1) {
                return "task-done";
            }
            return "";
        };

        // Тултип
        const fmt = gantt.date.date_to_str("%d.%m.%Y");
        gantt.templates.tooltip_text = (start, end, task) => {
            const parentText = (task as any).parent
                ? gantt.getTask((task as any).parent)?.text
                : null;
            const progress = Math.round((task.progress || 0) * 100);
            return `
    <div class="tooltip-title">${task.text}</div>
    <div class="tooltip-dates"><b>Сроки:</b> ${fmt(start)} — ${fmt(end)}</div>
    <div class="tooltip-progress"><b>Готово:</b> ${progress}%</div>
  `;
        };

        // Масштаб по умолчанию
        applyScale(scale);

        gantt.init(ref.current);

        return () => {
            gantt.clearAll();
        };
    }, []); // init один раз

    // Применение масштаба
    const applyScale = (mode: ScaleMode) => {
        switch (mode) {
            case "day":
                gantt.config.scale_unit = "day";
                gantt.config.date_scale = "%d %M";
                gantt.config.subscales = [{ unit: "week", step: 1, date: "Нед. %W" }];
                gantt.config.min_column_width = 40;
                break;
            case "week":
                gantt.config.scale_unit = "week";
                gantt.config.date_scale = "Нед. %W";
                gantt.config.subscales = [{ unit: "day", step: 1, date: "%d %M" }];
                gantt.config.min_column_width = 50;
                break;
            case "month":
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%F %Y";
                gantt.config.subscales = [{ unit: "week", step: 1, date: "Нед. %W" }];
                gantt.config.min_column_width = 70;
                break;
        }
        gantt.render();
    };

    // Переключение масштаба по UI
    useEffect(() => {
        applyScale(scale);
        gantt.setSizes();
    }, [scale]);

    // Подлива данных при каждом изменении props
    useEffect(() => {
        gantt.clearAll();
        gantt.parse({ data, links: [] }); // связи не передаём
        gantt.setSizes();
    }, [data]);

    return (
        <div style={{ width, display: "flex", flexDirection: "column", gap: 8 }}>
            <div ref={ref} style={{ width: "100%" }} />
        </div>
    );
}
