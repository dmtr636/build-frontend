import { SingleAutocomplete, SingleAutocompleteProps } from "./SingleAutocomplete.tsx";
import { MultipleAutocomplete, MultipleAutocompleteProps } from "./MultipleAutocomplete.tsx";

type AutocompleteProps<T> = SingleAutocompleteProps<T> | MultipleAutocompleteProps;

export const Autocomplete = <T,>(props: AutocompleteProps<T>) => {
    if (props.multiple) {
        return <MultipleAutocomplete {...props} />;
    } else {
        return <SingleAutocomplete<T> {...props} />;
    }
};
