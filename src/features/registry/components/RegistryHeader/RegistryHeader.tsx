import { observer } from "mobx-react-lite";
import styles from "./RegistryHeader.module.scss";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconPlus } from "src/ui/assets/icons";
import { ExplorationInput } from "src/ui/components/segments/Exploration/ExplorationInput.tsx";

export const RegistryHeader = observer(
    (props: {
        onAdd?: () => void;
        search: string;
        onSearch: (value: string) => void;
        searchPlaceholder: string;
    }) => {
        return (
            <div className={styles.header}>
                {props.onAdd && (
                    <Button
                        onClick={props.onAdd}
                        mode={"neutral"}
                        iconBefore={<IconPlus />}
                        size={"large"}
                    >
                        Добавить
                    </Button>
                )}
                <ExplorationInput
                    onInputChange={props.onSearch}
                    inputValue={props.search}
                    size={"large"}
                    inputPlaceholder={props.searchPlaceholder}
                />
            </div>
        );
    },
);
