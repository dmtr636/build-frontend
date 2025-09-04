import styles from "./Exploration.module.scss";
import { observer } from "mobx-react-lite";
import { IconFilter, IconSorting } from "src/ui/assets/icons";
import { SelectButton } from "src/ui/components/inputs/SelectButton/SelectButton.tsx";
import { DropdownListOption } from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Chip } from "src/ui/components/controls/Chip/Chip.tsx";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { ButtonType } from "src/ui/components/controls/Button/Button.types.ts";
import { CSSProperties, ReactNode } from "react";
import { layoutStore } from "src/app/AppStore.ts";

export interface FilterChip {
    name: string;
    field: string;
    value: string;
}

interface ExplorationProps {
    inputPlaceholder?: string;
    onInputChange?: (value: string) => void;
    inputValue?: string;
    sortOptions?: DropdownListOption[] | null;
    sortValue?: string | null;
    onSortChange?: (value: string) => void;
    onFilterButtonClick?: () => void;
    filters?: FilterChip[];
    onDeleteFilter?: (field: string, value: string) => void;
    filterCounter?: number;
    sortButtonType?: ButtonType;
    sortButtonDisabled?: boolean;
    actions?: ReactNode;
    cardStyle?: CSSProperties;
}

export const Exploration = observer((props: ExplorationProps) => {
    const hasSearchRow =
        props.onInputChange &&
        props.inputValue !== undefined &&
        props.inputPlaceholder !== undefined;
    const isMobile = layoutStore.isMobile;

    return (
        <div className={styles.card} style={props.cardStyle}>
            <div>
                {props.onInputChange && props.inputValue !== undefined && (
                    <div className={styles.searchRow}>
                        <div className={styles.input}>
                            <ExplorationInput
                                inputPlaceholder={props.inputPlaceholder}
                                onInputChange={props.onInputChange}
                                inputValue={props.inputValue}
                                size={isMobile ? "medium" : "large"}
                            />
                        </div>
                        {props.onFilterButtonClick && (
                            <Button
                                type={"outlined"}
                                size={isMobile ? "medium" : "large"}
                                mode={"neutral"}
                                iconBefore={<IconFilter />}
                                onClick={props.onFilterButtonClick}
                                counter={props.filterCounter}
                            >
                                Фильтры
                            </Button>
                        )}
                        {props.sortOptions && props.sortValue && props.onSortChange && (
                            <SelectButton
                                options={props.sortOptions}
                                value={props.sortValue}
                                onChange={props.onSortChange}
                                mode={"neutral"}
                                buttonType={props.sortButtonType ?? "tertiary"}
                                buttonSize={isMobile ? "medium" : "large"}
                                buttonIconBefore={<IconSorting />}
                                buttonDisabled={props.sortButtonDisabled}
                                hideButtonText={isMobile}
                                tipPosition={isMobile ? "top-right" : undefined}
                            />
                        )}
                        {props.actions}
                    </div>
                )}

                {hasSearchRow && !!props.filters?.length && <div className={styles.divider} />}

                {!hasSearchRow && !!props.filters?.length && (
                    <Typo variant={"h5"} style={{ marginBottom: 20 }}>
                        Активные фильтры
                    </Typo>
                )}

                {!!props.filters?.length && (
                    <div className={styles.filters}>
                        {props.filters.map((filter) => (
                            <Chip
                                onDelete={() => props.onDeleteFilter?.(filter.field, filter.value)}
                                key={filter.field + filter.value}
                            >
                                {filter.name}
                            </Chip>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
