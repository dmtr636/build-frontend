import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export interface IEntityFormProps<T = object> {
    values: T;
    onChange?: (values: T) => void;
    layout: (values: T, onChange: (field: keyof T, value: any) => void) => ReactNode;
}

export const EntityForm = observer(<T,>(props: IEntityFormProps<T>) => {
    const handleFieldChange = (field: keyof T, value: any) => {
        props.onChange?.({
            ...props.values,
            [field]: value,
        });
    };
    return props.layout(props.values, handleFieldChange);
});
