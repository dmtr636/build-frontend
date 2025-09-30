import React, { useEffect, useLayoutEffect, useMemo } from "react";
import styles from "./ViolationPage.module.scss";
import { Helmet } from "react-helmet";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconCheckmark, IconPlus, IconSuccess, IconUpdate, IconXlsx } from "src/ui/assets/icons";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { appStore, layoutStore, registryStore } from "src/app/AppStore.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ViolationCardItem from "src/features/journal/pages/ViolationPage/components/ViolationCardItem/ViolationCardItem.tsx";
import { observer } from "mobx-react-lite";
import AddViolationOverlay from "src/features/journal/pages/ViolationPage/components/AddOverlay/AddViolationOverlay.tsx";
import ViolationList from "src/features/journal/pages/ViolationPage/components/ViolationList/ViolationList.tsx";
import { IconReport, IconVeryHappy } from "src/features/journal/pages/ViolationPage/assets";
import ViolationCard from "src/features/journal/pages/ViolationPage/components/ViolationCard/ViolationCard.tsx";
import { ProjectViolationDTO } from "src/features/journal/types/Violation.ts";
import UserCard from "src/features/users/components/UserCard/UserCard.tsx";
import { IconBuildArrow, IconBuildPhoto } from "src/features/users/components/UserCard/assets";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { User } from "src/features/users/types/User.ts";
import { clsx } from "clsx";

const ViolationPage = observer(() => {
    const loginUser = appStore.accountStore.currentUser;
    const { id } = useParams();
    const violations = appStore.violationStore.violations;
    const categoryList = [...new Set(violations.map((item) => item.category))];
    const categoryOptions = categoryList.map((item) => ({ name: item, value: item }));
    const authorList = [
        ...new Map(violations.map((item) => [item.author.id, item.author])).values(),
    ];
    const authorOptions = authorList.map((item) => ({ name: getFullName(item), value: item.id }));
    const [openCreate, setOpenCreate] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<number>(1);
    const [dateFilter, setDateFilter] = React.useState<string | null>(null);
    const [category, setCategory] = React.useState<string[]>([]);
    const [type, setType] = React.useState<string[]>([]);
    const [view, setView] = React.useState<string[]>([]);
    const [author, setAuthor] = React.useState<string[]>([]);
    const object = appStore.objectStore.ObjectMap.get(id ?? "");

    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get("status");
        if (status) {
            setActiveTab(status as any);
            if (status === "4") {
                layoutStore.setHeaderProps({ title: "Исправленные нарушения" });
                return;
            } else {
                layoutStore.setHeaderProps({ title: "Нарушения" });
            }
        }
        /* return () => {
            layoutStore.setHeaderProps({ title: "Нарушения" });
        };*/
    }, [location.search]);
    useEffect(() => {
        if (id) {
            appStore.violationStore.fetchViolationByObj(id);
        }
    }, [id]);
    const resetFilters = () => {
        setView([]);
        setAuthor([]);
        setDateFilter(null);
        setCategory([]);
        setType([]);
    };
    const [currentViolent, setCurrentViolent] = React.useState<ProjectViolationDTO | null>(null);
    const onClickCard = (u: ProjectViolationDTO) => {
        if (u.id !== currentViolent?.id || !currentViolent) {
            setCurrentViolent(u);
        } else {
            setCurrentViolent(null);
        }
    };
    const filteredViolations = React.useMemo(() => {
        const normalize = (v?: string | null) => (v ?? "").trim().toLowerCase();
        const sameDay = (a?: string | null, b?: string | null) => {
            if (!a || !b) return false;
            const da = new Date(a),
                db = new Date(b);
            if (isNaN(+da) || isNaN(+db)) return false;
            return da.toISOString().slice(0, 10) === db.toISOString().slice(0, 10);
        };

        const tabToStatus: Record<number, ProjectViolationDTO["status"] | null> = {
            1: null, // Все
            2: "TODO",
            3: "IN_PROGRESS",
            4: "IN_REVIEW",
            5: "DONE",
        };

        const statusRequired = tabToStatus[activeTab] ?? null;
        const categorySet = new Set(category.map(normalize));
        const viewSet = new Set(view.map(normalize)); // severityType
        const typeSet = new Set(type.map(normalize)); // kind
        const authorSet = new Set(author); // id автора

        return violations.filter((v) => {
            if (statusRequired && v.status !== statusRequired) return false;
            if (dateFilter && !sameDay(v.violationTime, dateFilter)) return false;
            if (categorySet.size && !categorySet.has(normalize(v.category))) return false;
            if (viewSet.size && !viewSet.has(normalize(v.severityType))) return false;
            if (typeSet.size && !typeSet.has(normalize(v.kind))) return false;
            if (authorSet.size && !authorSet.has(v.author.id)) return false;
            return true;
        });
    }, [violations, activeTab, dateFilter, category, view, type, author]);
    const filteredViolationsWithoutStatus = useMemo(() => {
        const normalize = (v?: string | null) => (v ?? "").trim().toLowerCase();
        const sameDay = (a?: string | null, b?: string | null) => {
            if (!a || !b) return false;
            const da = new Date(a),
                db = new Date(b);
            if (isNaN(+da) || isNaN(+db)) return false;
            return da.toISOString().slice(0, 10) === db.toISOString().slice(0, 10);
        };

        const categorySet = new Set(category.map(normalize));
        const viewSet = new Set(view.map(normalize)); // severityType
        const typeSet = new Set(type.map(normalize)); // kind
        const authorSet = new Set(author); // id автора

        return violations.filter((v) => {
            /* if (statusRequired && v.status !== statusRequired) return false;*/
            if (dateFilter && !sameDay(v.violationTime, dateFilter)) return false;
            if (categorySet.size && !categorySet.has(normalize(v.category))) return false;
            if (viewSet.size && !viewSet.has(normalize(v.severityType))) return false;
            if (typeSet.size && !typeSet.has(normalize(v.kind))) return false;
            if (authorSet.size && !authorSet.has(v.author.id)) return false;
            return true;
        });
    }, [violations, activeTab, dateFilter, category, view, type, author]);
    const isMobile = layoutStore.isMobile;
    useLayoutEffect(() => {
        layoutStore.setHeaderProps({ title: "Нарушения" });
    }, []);
    const navigate = useNavigate();
    return (
        <div className={styles.container}>
            <Helmet>
                <title>{object?.name}</title>
            </Helmet>
            {!isMobile && (
                <div className={styles.filterBlock}>
                    {/*loginUser?.role !== "USER" &&*/}
                    {
                        <div>
                            <Button
                                size={"small"}
                                mode={"negative"}
                                fullWidth={true}
                                iconBefore={<IconPlus />}
                                onClick={() => setOpenCreate(true)}
                            >
                                Добавить нарушение
                            </Button>
                        </div>
                    }
                    {/*<div>
                    <Button
                        fullWidth={true}
                        size={"small"}
                        type={"outlined"}
                        customIconBefore={<IconXlsx />}
                        mode={"neutral"}
                                                onClick={downloadExcel}
                    >
                        Экспорт в XLSX
                    </Button>
                </div>*/}
                    <div className={styles.filterContainer}>
                        <div className={styles.filterHead}>
                            <span style={{ opacity: 0.6 }}>Фильтры</span>
                            {(dateFilter ||
                                category.length > 0 ||
                                view.length > 0 ||
                                type.length > 0 ||
                                author.length > 0) && (
                                <Button
                                    onClick={resetFilters}
                                    size={"tiny"}
                                    type={"outlined"}
                                    mode={"neutral"}
                                    iconBefore={<IconUpdate />}
                                >
                                    Сбросить
                                </Button>
                            )}
                        </div>
                        <FlexColumn gap={16} style={{ marginTop: 20 }}>
                            <DatePicker
                                placeholder={"За всё время"}
                                value={dateFilter}
                                onChange={setDateFilter}
                                width={202}
                                formName={"Дата"}
                            />
                            <MultipleSelect
                                values={category}
                                onValuesChange={setCategory}
                                placeholder={"Все"}
                                options={categoryOptions}
                                multiple={true}
                                formName={"Категория"}
                            ></MultipleSelect>
                            <MultipleSelect
                                values={view}
                                onValuesChange={setView}
                                placeholder={"Все"}
                                options={[
                                    { name: "Простое", value: "Простое" },
                                    { name: "Грубое", value: "Грубое" },
                                ]}
                                multiple={true}
                                formName={"Вид"}
                            ></MultipleSelect>
                            <MultipleAutocomplete
                                formName={"Тип"}
                                options={[
                                    { name: "Простое", value: "Простое" },
                                    { name: "Грубое", value: "Грубое" },
                                ]}
                                placeholder={"Все"}
                                values={type}
                                onValuesChange={setType}
                                multiple={true}
                            />
                            <MultipleAutocomplete
                                formName={"Автор"}
                                options={authorOptions}
                                placeholder={"Все"}
                                values={author}
                                onValuesChange={setAuthor}
                                multiple={true}
                            />
                        </FlexColumn>
                    </div>
                </div>
            )}
            <div className={styles.violationContainer}>
                {!isMobile && (
                    <div className={styles.tabs}>
                        <Button
                            size={"small"}
                            type={activeTab === 1 ? "primary" : "outlined"}
                            mode={"neutral"}
                            onClick={() => {
                                setActiveTab(1);
                            }}
                        >
                            Все
                        </Button>
                        <Button
                            style={{ width: "auto" }}
                            counterClassname={styles.counter}
                            counter={
                                filteredViolationsWithoutStatus.filter((v) => v.status === "TODO")
                                    .length > 0
                                    ? filteredViolationsWithoutStatus.filter(
                                          (v) => v.status === "TODO",
                                      ).length
                                    : undefined
                            }
                            size={"small"}
                            type={activeTab === 2 ? "primary" : "outlined"}
                            mode={"neutral"}
                            onClick={() => {
                                setActiveTab(2);
                            }}
                        >
                            Не взято в работу
                        </Button>
                        <Button
                            counterClassname={styles.counter}
                            size={"small"}
                            counter={
                                filteredViolationsWithoutStatus.filter(
                                    (v) => v.status === "IN_PROGRESS",
                                ).length > 0
                                    ? filteredViolationsWithoutStatus.filter(
                                          (v) => v.status === "IN_PROGRESS",
                                      ).length
                                    : undefined
                            }
                            type={activeTab === 3 ? "primary" : "outlined"}
                            mode={"neutral"}
                            onClick={() => {
                                setActiveTab(3);
                            }}
                        >
                            В работе
                        </Button>
                        <Button
                            counterClassname={styles.counter}
                            style={{ width: 137 }}
                            size={"small"}
                            counter={
                                filteredViolationsWithoutStatus.filter(
                                    (v) => v.status === "IN_REVIEW",
                                ).length > 0
                                    ? filteredViolationsWithoutStatus.filter(
                                          (v) => v.status === "IN_REVIEW",
                                      ).length
                                    : undefined
                            }
                            type={activeTab === 4 ? "primary" : "outlined"}
                            mode={"neutral"}
                            onClick={() => {
                                setActiveTab(4);
                            }}
                        >
                            На проверке
                        </Button>
                        <Button
                            onClick={() => {
                                setActiveTab(5);
                            }}
                            iconBefore={<IconSuccess />}
                            size={"small"}
                            type={activeTab === 5 ? "primary" : "outlined"}
                            mode={"positive"}
                        ></Button>
                    </div>
                )}
                {isMobile && (activeTab == 2 || activeTab == 3) && (
                    <div className={styles.mobileTabs}>
                        {violations.filter((i) => i.status === "TODO").length > 0 && (
                            <div
                                onClick={() =>
                                    navigate(`/admin/journal/${id}/violations?status=2`, {
                                        replace: true,
                                    })
                                }
                                className={clsx(styles.mobTabItem, {
                                    [styles.active]: activeTab == 2,
                                })}
                            >
                                Взять в работу
                            </div>
                        )}
                        {violations.filter((i) => i.status === "IN_PROGRESS").length > 0 && (
                            <div
                                onClick={() =>
                                    navigate(`/admin/journal/${id}/violations?status=3`, {
                                        replace: true,
                                    })
                                }
                                className={clsx(styles.mobTabItem, {
                                    [styles.active]: activeTab == 3,
                                })}
                            >
                                В работе
                            </div>
                        )}
                    </div>
                )}
                {violations.length > 0 ? (
                    <ViolationList
                        currentViolation={currentViolent}
                        violationList={filteredViolations}
                        onClick={(value: ProjectViolationDTO) => {
                            onClickCard(value);
                        }}
                    />
                ) : (
                    <div className={styles.noViolContainer}>
                        <div className={styles.noViol}>
                            <IconVeryHappy />
                            Нарушений нет
                        </div>
                    </div>
                )}
            </div>
            {!isMobile && (
                <div className={styles.violationCard}>
                    <div className={styles.userCard}>
                        {currentViolent ? (
                            <ViolationCard violation={currentViolent} />
                        ) : (
                            <div className={styles.emptyForm}>
                                <FlexColumn
                                    gap={6}
                                    align={"center"}
                                    style={{ position: "absolute", top: 293 }}
                                >
                                    <IconBuildArrow
                                        style={{
                                            position: "absolute",
                                            top: -65,
                                            transform: "translate(-10px, 0)",
                                        }}
                                    />
                                    <IconReport />

                                    <Typo
                                        variant={"subheadXL"}
                                        type={"tertiary"}
                                        mode={"neutral"}
                                        style={{ textAlign: "center" }}
                                    >
                                        {"Выберите нарушение\nиз списка"}
                                    </Typo>
                                </FlexColumn>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <AddViolationOverlay
                object={object}
                open={openCreate}
                setOpen={() => setOpenCreate(false)}
            />
        </div>
    );
});

export default ViolationPage;
