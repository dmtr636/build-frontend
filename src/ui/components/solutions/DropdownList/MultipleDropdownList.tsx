import styles from "./DropdownList.module.scss";
import { Fragment, ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
    PopoverBase,
    PopoverBaseProps,
} from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { clsx } from "clsx";
import {
    DropdownListMode,
    DropdownListSize,
    MultipleDropdownListOption,
    MultipleDropdownListOptions,
} from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { ListItem } from "src/ui/components/controls/ListItem/ListItem.tsx";

export interface MultipleDropdownListProps<T>
    extends Pick<
        PopoverBaseProps,
        "fullWidth" | "show" | "setShow" | "tipPosition" | "hideTip" | "closeOnSecondClick"
    > {
    children: ReactElement;
    options: MultipleDropdownListOptions<T>;
    onChange: (options: MultipleDropdownListOption<T>[]) => void;
    values: T[];
    mode?: DropdownListMode;
    size?: DropdownListSize;
    multiple: true;
    footer?: ReactNode;
    zIndex?: number;
    footerNoPadding?: boolean;
}

export const MultipleDropdownList = <T,>(props: MultipleDropdownListProps<T>) => {
    const {
        children,
        options,
        onChange,
        values,
        mode = "accent",
        fullWidth,
        size = "medium",
        footer,
    }: MultipleDropdownListProps<T> = props;
    const [show, setShow] = useState(props.show ?? false);
    const selectedOptionRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setShow(props.show ?? show);
    }, [props.show]);

    useEffect(() => {
        const scrollContainer = selectedOptionRef.current?.parentElement?.parentElement;
        if (show && scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }, [options]);

    useEffect(() => {
        props.setShow?.(show);
        const scrollContainer = selectedOptionRef.current?.parentElement?.parentElement;
        if (show && scrollContainer) {
            const scrollTop =
                selectedOptionRef.current.offsetTop +
                selectedOptionRef.current.offsetHeight / 2 -
                scrollContainer.offsetHeight / 2;
            scrollContainer.scrollTop = Math.max(scrollTop, 0);
        }
    }, [show]);

    const isOptionSelected = (option: MultipleDropdownListOption<T>) => {
        return values.includes(option.value);
    };

    const selectedOptions = useMemo(
        () => options.flat().filter((option) => values.includes(option.value)),
        [options, values],
    );

    const toggleOption = (option: MultipleDropdownListOption<T>, selected: boolean) => {
        let newOptions;
        if (selected) {
            newOptions = [...selectedOptions, option];
        } else {
            newOptions = selectedOptions.filter((_option) => _option.value !== option.value);
        }
        onChange(newOptions);
    };

    const renderList = () => {
        const listClassName = clsx(styles.list, styles[mode]);
        return (
            <div className={listClassName}>
                {renderOptionGroup(selectedOptions, 0, true)}
                {options.map((option, index) =>
                    Array.isArray(option)
                        ? renderOptionGroup(option, index)
                        : renderOption(option, index),
                )}
                {footer && (
                    <div
                        className={clsx(
                            styles.footer,
                            styles[size],

                            { [styles.noPadding]: props.footerNoPadding },
                        )}
                    >
                        {footer}
                    </div>
                )}
            </div>
        );
    };

    const renderOptionGroup = (
        optionGroup: MultipleDropdownListOption<T>[],
        groupIndex: number,
        pinned?: boolean,
    ) => {
        if (!optionGroup.length) {
            return;
        }
        return (
            <Fragment key={`group-${groupIndex}`}>
                {optionGroup.map((option, index) => renderOption(option, index, pinned))}
                <div className={styles.divider} />
            </Fragment>
        );
    };

    const renderOption = (
        option: MultipleDropdownListOption<T>,
        index: number,
        pinned?: boolean,
    ) => {
        const isSelected = isOptionSelected(option);
        if (isSelected && !pinned) {
            return;
        }
        return (
            <ListItem
                mode={option.mode ?? mode}
                size={size}
                onClick={() => {
                    option.onClick?.();
                    toggleOption(option, !isSelected);
                }}
                disabled={option.disabled}
                checked={isSelected}
                key={index}
            >
                {option.name}
            </ListItem>
        );
    };

    return (
        <PopoverBase
            {...props}
            mode={"contrast"}
            triggerEvent={"click"}
            content={renderList()}
            show={show}
            setShow={setShow}
            maxHeight={size === "large" ? 360 : 320}
            fullWidth={fullWidth}
        >
            {children}
        </PopoverBase>
    );
};
