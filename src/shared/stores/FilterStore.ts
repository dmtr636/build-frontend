import { makeAutoObservable } from "mobx";

export interface SortOption {
    name: string;
    value: string;
}

export class FilterStore {
    search = "";
    sort: string | null = null;
    sortOptions: SortOption[] | null = null;
    filterForm: Record<string, any> = {};
    filterValues: Record<string, any> = {};

    constructor(params?: { sortOptions?: SortOption[]; defaultSort?: string }) {
        if (params?.sortOptions) {
            this.sortOptions = params.sortOptions;
        }
        if (params?.defaultSort) {
            this.sort = params.defaultSort;
        }
        makeAutoObservable(this);
    }

    get sortField() {
        return this.sort?.split("-")[0];
    }

    get sortDirection() {
        return this.sort?.split("-")[1];
    }

    get appliedFiltersCount() {
        return Object.values(this.filterValues).flat().length;
    }

    setSearch(search: string) {
        this.search = search;
    }

    setSort(sort: string) {
        this.sort = sort;
    }

    setFilterFormMultipleValue(field: string, value: any, selected: boolean) {
        if (!this.filterForm[field]) {
            this.filterForm = {
                ...this.filterForm,
                [field]: [],
            };
        }
        if (selected) {
            this.filterForm = {
                ...this.filterForm,
                [field]: [...this.filterForm[field], value],
            };
        } else {
            this.filterForm = {
                ...this.filterForm,
                [field]: this.filterForm[field].filter((v: any) => v !== value),
            };
            if (!this.filterForm[field]?.length) {
                this.filterForm = {
                    ...this.filterForm,
                    [field]: undefined,
                };
            }
        }
    }

    setFilterFormSingleValue(field: string, value: any) {
        if (value === "") {
            this.filterForm = {
                ...this.filterForm,
                [field]: undefined,
            };
        } else {
            this.filterForm = {
                ...this.filterForm,
                [field]: value,
            };
        }
    }

    getFilterFormMultipleValue(field: string, value: any) {
        return this.filterForm[field]?.includes(value) ?? false;
    }

    applyFilters() {
        this.filterValues = JSON.parse(JSON.stringify(this.filterForm));
    }

    resetFilters() {
        this.filterForm = {};
    }

    resetFilter(field: string, value: string) {
        if (Array.isArray(this.filterForm[field])) {
            this.setFilterFormMultipleValue(field, value, false);
        } else {
            this.setFilterFormSingleValue(field, undefined);
        }
        this.applyFilters();
    }

    ilikeSearch(value: string | number | null, cleanSearchValue?: (searchValue: string) => string) {
        const cleanedValue = cleanSearchValue
            ? cleanSearchValue(this.search.toLowerCase().replace("ё", "е"))
            : this.search.toLowerCase().replace("ё", "е");
        return value?.toString().toLowerCase().replace("ё", "е").includes(cleanedValue);
    }

    ilike(value: string | number | boolean | null, searchValue: string | number) {
        if (value === null) {
            return false;
        }
        return value.toString().toLowerCase().includes(searchValue.toString().toLowerCase());
    }
}
