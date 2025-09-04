import {
    SingleDropdownList,
    SingleDropdownListProps,
} from "src/ui/components/solutions/DropdownList/SingleDropdownList.tsx";
import {
    MultipleDropdownList,
    MultipleDropdownListProps,
} from "src/ui/components/solutions/DropdownList/MultipleDropdownList.tsx";

type DropdownListProps<T> = SingleDropdownListProps<T> | MultipleDropdownListProps<T>;

export const DropdownList = <T,>(props: DropdownListProps<T>) => {
    if (props.multiple) {
        return <MultipleDropdownList {...props}>{props.children}</MultipleDropdownList>;
    } else {
        return <SingleDropdownList {...props}>{props.children}</SingleDropdownList>;
    }
};
