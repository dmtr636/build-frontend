import React, { useEffect } from "react";
import styles from "./ViolationPage.module.scss";
import { Helmet } from "react-helmet";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconCheckmark, IconPlus, IconSuccess, IconUpdate, IconXlsx } from "src/ui/assets/icons";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { MultipleSelect } from "src/ui/components/inputs/Select/MultipleSelect.tsx";
import { MultipleAutocomplete } from "src/ui/components/inputs/Autocomplete/MultipleAutocomplete.tsx";
import { getFullName } from "src/shared/utils/getFullName.ts";
import { appStore } from "src/app/AppStore.ts";
import { Checkbox } from "src/ui/components/controls/Checkbox/Checkbox.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { useParams } from "react-router-dom";

const ViolationPage = () => {
    const loginUser = appStore.accountStore.currentUser;
    const { id } = useParams();
    const violations = appStore.violationStore.violations;
    const [openCreate, setOpenCreate] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<number>(1);
    const [dateFilter, setDateFilter] = React.useState<string | null>(null);
    const [category, setCategory] = React.useState<string[]>([]);
    const [type, setType] = React.useState<string[]>([]);
    const [view, setView] = React.useState<string[]>([]);
    const [author, setAuthor] = React.useState<string[]>([]);
    useEffect(() => {
        if (id) {
            appStore.violationStore.fetchViolationByObj(id);
        }
    }, [id]);
    return (
        <div className={styles.container}>
            <Helmet>
                <title>Объекты – Build</title>
            </Helmet>
            <div className={styles.filterBlock}>
                {loginUser?.role !== "USER" && (
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
                )}
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
                        {true && (
                            <Button
                                /*
                                                                onClick={resetFilters}
                                */
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
                            options={[]}
                            multiple={true}
                            formName={"Категория"}
                        ></MultipleSelect>
                        <MultipleSelect
                            values={view}
                            onValuesChange={setView}
                            placeholder={"Все"}
                            options={[]}
                            multiple={true}
                            formName={"Вид"}
                        ></MultipleSelect>
                        <MultipleAutocomplete
                            formName={"Тип"}
                            options={[]}
                            placeholder={"Все"}
                            values={type}
                            onValuesChange={setType}
                            multiple={true}
                        />
                        <MultipleAutocomplete
                            formName={"Автор"}
                            options={[]}
                            placeholder={"Все"}
                            values={author}
                            onValuesChange={setAuthor}
                            multiple={true}
                        />
                    </FlexColumn>
                </div>
            </div>
            <div className={styles.violationContainer}>
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
                        style={{ width: 225 }}
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
                        style={{ width: 100 }}
                        size={"small"}
                        type={activeTab === 3 ? "primary" : "outlined"}
                        mode={"neutral"}
                        onClick={() => {
                            setActiveTab(3);
                        }}
                    >
                        В работе
                    </Button>
                    <Button
                        style={{ width: 137 }}
                        size={"small"}
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
            </div>
        </div>
    );
};

export default ViolationPage;
