import { SingleSelect, SingleSelectProps } from "src/ui/components/inputs/Select/SingleSelect.tsx";
import {
    MultipleSelect,
    MultipleSelectProps,
} from "src/ui/components/inputs/Select/MultipleSelect.tsx";

type SelectProps<T> = SingleSelectProps<T> | MultipleSelectProps<T>;

export const Select = <T = string,>(props: SelectProps<T>) => {
    if (props.multiple) {
        return <MultipleSelect<T> {...props} />;
    } else {
        return <SingleSelect<T> {...props} />;
    }
};
