import { FilterStore } from "src/shared/stores/FilterStore.ts";
import { Exploration, FilterChip } from "src/ui/components/segments/Exploration/Exploration.tsx";
import { CSSProperties, ReactNode, useState } from "react";
import { Drawer } from "src/ui/components/segments/Drawer/Drawer.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { observer } from "mobx-react-lite";
import { ButtonType } from "src/ui/components/controls/Button/Button.types.ts";

interface ExplorationWithStoreProps {
    inputPlaceholder?: string;
    filterStore: FilterStore;
    enableFilter: boolean;
    filterContent?: ReactNode;
    filters?: FilterChip[];
    applyButtonLabel?: string;
    sortButtonType?: ButtonType;
    sortButtonDisabled?: boolean;
    actions?: ReactNode;
    cardStyle?: CSSProperties;
}

export const ExplorationWithStore = observer((props: ExplorationWithStoreProps) => {
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const store = props.filterStore;

    return (
        <>
            <Exploration
                inputPlaceholder={props.inputPlaceholder}
                onInputChange={(value) => store.setSearch(value)}
                inputValue={store.search}
                sortOptions={store.sortOptions}
                sortValue={store.sort}
                onSortChange={(value) => store.setSort(value)}
                onFilterButtonClick={
                    props.enableFilter ? () => setShowFilterDrawer(true) : undefined
                }
                filters={props.filters}
                onDeleteFilter={(field, value) => store.resetFilter(field, value)}
                filterCounter={store.appliedFiltersCount || undefined}
                sortButtonType={props.sortButtonType}
                actions={props.actions}
                sortButtonDisabled={props.sortButtonDisabled}
                cardStyle={props.cardStyle}
            />
            <Drawer
                open={showFilterDrawer}
                onClose={() => {
                    store.filterForm = JSON.parse(JSON.stringify(store.filterValues));
                    setShowFilterDrawer(false);
                }}
                title={"Фильтры"}
                closeOnBackdropClick={false}
                actions={(onClose) => [
                    <Button
                        key={"apply"}
                        fullWidth={true}
                        onClick={() => {
                            store.applyFilters();
                            onClose();
                        }}
                        disabled={
                            JSON.stringify(store.filterValues) === JSON.stringify(store.filterForm)
                        }
                        mode={"accent"}
                    >
                        {props.applyButtonLabel ?? "Применить"}
                    </Button>,
                    <Button
                        key={"reset"}
                        type={"tertiary"}
                        fullWidth={true}
                        onClick={() => {
                            store.resetFilters();
                            store.applyFilters();
                            onClose();
                        }}
                        disabled={!Object.values(store.filterForm).flat().length}
                        mode={"neutral"}
                    >
                        Очистить
                    </Button>,
                ]}
            >
                {props.filterContent}
            </Drawer>
        </>
    );
});
