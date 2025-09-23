import React from "react";
import { observer } from "mobx-react-lite";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

// Цвета по ТЗ
const COLOR_DONE = "#267D5F";
const COLOR_DEFAULT = "#444D5F";
const COLOR_PROGRESS = "#A0B6ED";

// Хелпер форматирования дат для списка слева
const fmtRU = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});
const f = (d?: Date) => (d ? fmtRU.format(d) : "");

// -------------------- ДАННЫЕ --------------------
/**
 * Иерархия (project -> task) задаётся через поле `project`, указывающее id родителя.
 * Верхний контейнер "Проект" — parent для релизов; сами релизы — type: "project".
 * Подзадачи — type: "task", у всех датый = датам родителя.
 */
const base: Task[] = [
    // Верхняя сводная полоса
    {
        id: "proj_all",
        name: "Проект",
        type: "project",
        start: new Date(2020, 1, 1), // 01.02.2020
        end: new Date(2020, 1, 16), // 16.02.2020 (excl. конец не включительно в рендерах)
        progress: 0,
        hideChildren: false,
    },

    // -------- Релиз 1 (100%) --------
    {
        id: "rel1",
        name: "Релиз 1",
        type: "project",
        start: new Date(2020, 1, 1),
        end: new Date(2020, 1, 6), // 5 дней: 01–05 фев
        progress: 100,
        project: "proj_all",
    },
    {
        id: "r1_t1",
        name: "Р1 — Подзадача 1",
        type: "task",
        start: new Date(2020, 1, 1),
        end: new Date(2020, 1, 6),
        progress: 100,
        project: "rel1",
    },
    {
        id: "r1_t2",
        name: "Р1 — Подзадача 2",
        type: "task",
        start: new Date(2020, 1, 1),
        end: new Date(2020, 1, 6),
        progress: 100,
        project: "rel1",
    },
    {
        id: "r1_t3",
        name: "Р1 — Подзадача 3",
        type: "task",
        start: new Date(2020, 1, 1),
        end: new Date(2020, 1, 6),
        progress: 100,
        project: "rel1",
    },

    // -------- Релиз 2 (2/3 готовы) --------
    {
        id: "rel2",
        name: "Релиз 2",
        type: "project",
        start: new Date(2020, 1, 6),
        end: new Date(2020, 1, 11), // 06–10 фев
        progress: 67, // для визуалки; реальные проценты считать из детей можно вручную
        project: "proj_all",
    },
    {
        id: "r2_t1",
        name: "Р2 — Подзадача 1",
        type: "task",
        start: new Date(2020, 1, 6),
        end: new Date(2020, 1, 11),
        progress: 100,
        project: "rel2",
    },
    {
        id: "r2_t2",
        name: "Р2 — Подзадача 2",
        type: "task",
        start: new Date(2020, 1, 6),
        end: new Date(2020, 1, 11),
        progress: 100,
        project: "rel2",
    },
    {
        id: "r2_t3",
        name: "Р2 — Подзадача 3",
        type: "task",
        start: new Date(2020, 1, 6),
        end: new Date(2020, 1, 11),
        progress: 0,
        project: "rel2",
    },

    // -------- Релиз 3 (0%) --------
    {
        id: "rel3",
        name: "Релиз 3",
        type: "project",
        start: new Date(2020, 1, 11),
        end: new Date(2020, 1, 16), // 11–15 фев
        progress: 0,
        project: "proj_all",
    },
    {
        id: "r3_t1",
        name: "Р3 — Подзадача 1",
        type: "task",
        start: new Date(2020, 1, 11),
        end: new Date(2020, 1, 16),
        progress: 0,
        project: "rel3",
    },
    {
        id: "r3_t2",
        name: "Р3 — Подзадача 2",
        type: "task",
        start: new Date(2020, 1, 11),
        end: new Date(2020, 1, 16),
        progress: 0,
        project: "rel3",
    },
    {
        id: "r3_t3",
        name: "Р3 — Подзадача 3",
        type: "task",
        start: new Date(2020, 1, 11),
        end: new Date(2020, 1, 16),
        progress: 0,
        project: "rel3",
    },
];

// перекрашиваем полностью готовые задачи локально
const tasks: Task[] = base.map((t) =>
    t.type === "task" && t.progress === 100
        ? {
              ...t,
              styles: {
                  backgroundColor: COLOR_DONE,
                  backgroundSelectedColor: COLOR_DONE,
                  progressColor: COLOR_DONE,
                  progressSelectedColor: COLOR_DONE,
              },
          }
        : t,
);

// Зависимости: Релиз 1 -> Релиз 2 -> Релиз 3
// (в gantt-task-react зависимости вешаются на id задач)
(tasks.find((t) => t.id === "rel2") as Task).dependencies = ["rel1"];
(tasks.find((t) => t.id === "rel3") as Task).dependencies = ["rel2"];

// -------------------- КАСТОМНЫЙ TASK LIST (слева) --------------------
type TLProps = {
    tasks: Task[];
    locale?: string;
};

// вычисляем глубину (отступ) по полю project
const depthMap = (() => {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const memo = new Map<string, number>();
    const getDepth = (t: Task): number => {
        if (memo.has(t.id)) return memo.get(t.id)!;
        let d = 0;
        let cur: Task | undefined = t;
        while (cur && cur.project) {
            d++;
            cur = byId.get(cur.project);
        }
        memo.set(t.id, d);
        return d;
    };
    return new Map(tasks.map((t) => [t.id, getDepth(t)]));
})();

const TaskListHeader: React.FC = () => (
    <div
        style={{
            height: "50px",
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 90px",
            fontSize: 12,
            fontWeight: 600,
            padding: "8px 10px",
            borderBottom: "1px solid #e4e7ec",
        }}
    >
        <div>Название</div>
        <div>Начало</div>
        <div>Конец</div>
        <div>Готово, %</div>
    </div>
);

const TaskListTable: React.FC<TLProps> = ({ tasks }) => {
    return (
        <div>
            {tasks.map((t) => {
                const d = depthMap.get(t.id) ?? 0;
                const isProject = t.type === "project";
                return (
                    <div
                        key={t.id}
                        style={{
                            height: "50px",
                            display: "grid",
                            gridTemplateColumns: "180px 120px 120px 90px",
                            alignItems: "center",
                            fontSize: 12,
                            padding: "6px 10px",
                            borderBottom: "1px solid #f1f3f5",
                            background: isProject ? "#f9fafb" : "transparent",
                            fontWeight: isProject ? 600 : 400,
                        }}
                    >
                        <div style={{ paddingLeft: d * 16 }}>{t.name}</div>
                        <div>{f(t.start)}</div>
                        <div>{f(t.end)}</div>
                        <div>{Math.round(t.progress ?? 0)}</div>
                    </div>
                );
            })}
        </div>
    );
};

// -------------------- КОМПОНЕНТ --------------------
export const TestGantt2 = observer(() => {
    return (
        <div style={{ width: "90vw", height: "80vh" }}>
            <Gantt
                tasks={tasks}
                viewMode={ViewMode.Day}
                locale="ru-RU" // русская локаль шкалы времени
                listCellWidth="330px" // ширина левой панели (можно сделать меньше/больше)
                columnWidth={60}
                // Глобальные цвета
                barBackgroundColor={COLOR_DEFAULT}
                barBackgroundSelectedColor={COLOR_DEFAULT}
                barProgressColor={COLOR_PROGRESS}
                barProgressSelectedColor={COLOR_PROGRESS}
                // Кастомный список слева (заголовок + таблица)
                TaskListHeader={TaskListHeader as any}
                TaskListTable={(props: any) => <TaskListTable {...props} />}
            />
        </div>
    );
});
