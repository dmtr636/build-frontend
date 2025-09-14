import styles from "./DropdownList.module.scss";
import React, { Fragment, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

import {
    PopoverBase,
    PopoverBaseProps,
} from "src/ui/components/solutions/PopoverBase/PopoverBase.tsx";
import { clsx } from "clsx";
import {
    DropdownListMode,
    DropdownListOption,
    DropdownListOptions,
    DropdownListSize,
} from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { ListItem } from "src/ui/components/controls/ListItem/ListItem.tsx";
import { IconArrowRight, IconCheckmark } from "src/ui/assets/icons";
import { observer } from "mobx-react-lite";

export interface SingleDropdownListProps<T>
    extends Pick<
        PopoverBaseProps,
        "fullWidth" | "show" | "setShow" | "tipPosition" | "hideTip" | "maxHeight"
    > {
    children: ReactElement;
    options: DropdownListOptions<T>;
    onChange?: (option: DropdownListOption<T>) => void;
    value?: T;
    mode?: DropdownListMode;
    size?: DropdownListSize;
    multiple?: false;
    footer?: ReactNode;
    header?: ReactNode;
    footerNoPadding?: boolean;
    headerNoPadding?: boolean;
    disableSelectedItem?: boolean;
    zIndex?: number;
    listStyles?: React.CSSProperties;
    withoutPopover?: boolean;
}

export const SingleDropdownList = observer(<T,>(props: SingleDropdownListProps<T>) => {
    const {
        children,
        options,
        onChange,
        value,
        mode = "accent",
        fullWidth,
        size = "medium",
        footer,
        header,
        headerNoPadding,
        disableSelectedItem = true,
        withoutPopover,
    }: SingleDropdownListProps<T> = props;
    const [show, setShow] = useState(props.show ?? false);
    const [subMenuKey, setSubMenuKey] = useState<string>();
    const [subMenuPosition, setSubMenuPosition] = useState<{ x: number; y: number }>();
    const selectedOptionRef = useRef<HTMLButtonElement>(null);
    const closeSubmenuTimeoutRef = useRef<number>();
    const openSubmenuTimeoutRef = useRef<number>();

    const subMenu = subMenuKey
        ? options.flat().find((option) => option.subMenuKey === subMenuKey)
        : undefined;

    useEffect(() => {
        setShow(props.show ?? show);
    }, [props.show]);

    useEffect(() => {
        const scrollContainer = selectedOptionRef.current?.parentElement?.parentElement;
        if (show && scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }, [options.length]);

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

    const handleChange = (option: DropdownListOption<T>) => {
        setShow(false);
        onChange?.(option);
    };

    const renderList = () => {
        if (!options.length && !footer && !header) {
            return null;
        }
        const listClassName = clsx(styles.list, styles[mode]);
        return (
            <div className={listClassName} style={props.listStyles}>
                {header && (
                    <div
                        className={clsx(styles.footer, styles[size], {
                            [styles.noPadding]: props.headerNoPadding,
                        })}
                    >
                        {header}
                    </div>
                )}
                {options.map((option, index) =>
                    Array.isArray(option)
                        ? renderOptionGroup(option, index)
                        : renderOption(option, index),
                )}
                {footer && (
                    <div
                        className={clsx(styles.footer, styles[size], {
                            [styles.noPadding]: props.footerNoPadding,
                        })}
                    >
                        {footer}
                    </div>
                )}
            </div>
        );
    };

    const renderOptionGroup = (optionGroup: DropdownListOption<T>[], index: number) => {
        return (
            <Fragment key={`group-${index}`}>
                {optionGroup.map((option, innerIndex) => renderOption(option, innerIndex))}
                <div className={styles.divider} />
            </Fragment>
        );
    };

    const renderOption = (option: DropdownListOption<T>, index: number, subMenu?: boolean) => {
        if (option.renderOption) {
            return option.renderOption();
        }
        const isSelected = value !== undefined && option.value === value;
        return (
            <ListItem
                pale={option.pale}
                mode={option.mode ?? mode}
                size={size}
                onClick={() => {
                    option.onClick?.();
                    if (option.children) {
                        setSubMenuKey(option.subMenuKey);
                    } else {
                        if (!subMenu) {
                            handleChange(option);
                        }
                    }
                }}
                disabled={(disableSelectedItem && isSelected) || option.disabled}
                iconBefore={option.listItemIcon}
                iconAfter={
                    (option.children && (
                        <IconArrowRight className={clsx(styles.arrow, subMenu && styles.rotated)} />
                    )) ||
                    (isSelected ? <IconCheckmark /> : option.iconAfter)
                }
                customIconBefore={option.icon}
                key={index}
                _ref={isSelected ? selectedOptionRef : undefined}
                onMouseEnter={(event) => {
                    if (!option.children) {
                        return;
                    }
                    const target = event.target as HTMLElement;
                    setSubMenuPosition({
                        x: target.offsetWidth + 20,
                        y: target.offsetTop,
                    });
                    clearTimeout(closeSubmenuTimeoutRef.current);
                    openSubmenuTimeoutRef.current = window.setTimeout(() => {
                        setSubMenuKey(option.subMenuKey);
                    }, 200);
                }}
                onMouseLeave={() => {
                    if (!option.children) {
                        return;
                    }
                    clearTimeout(openSubmenuTimeoutRef.current);
                    closeSubmenuTimeoutRef.current = window.setTimeout(() => {
                        setSubMenuKey(undefined);
                    }, 500);
                }}
            >
                {option.name}
            </ListItem>
        );
    };

    if (withoutPopover) {
        return (
            <>
                {renderList()}
                {!!subMenu?.children?.length && (
                    <div
                        className={styles.submenu}
                        style={{
                            left: subMenuPosition?.x,
                            top: subMenuPosition?.y,
                        }}
                        onMouseEnter={() => {
                            clearTimeout(closeSubmenuTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                            setSubMenuKey(undefined);
                        }}
                    >
                        {subMenu.children.map((option, index) => renderOption(option, index, true))}
                    </div>
                )}
            </>
        );
    }

    return (
        <PopoverBase
            {...props}
            mode={"contrast"}
            triggerEvent={"click"}
            content={renderList()}
            itemsLength={options.length}
            show={show}
            setShow={setShow}
            maxHeight={props.maxHeight ? props.maxHeight : size === "large" ? 360 : 320}
            fullWidth={fullWidth}
            popoverChildren={
                !!subMenu?.children?.length && (
                    <div
                        className={styles.submenu}
                        style={{
                            left: subMenuPosition?.x,
                            top: subMenuPosition?.y,
                        }}
                        onMouseEnter={() => {
                            clearTimeout(closeSubmenuTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                            setSubMenuKey(undefined);
                        }}
                    >
                        {subMenu.children.map((option, index) => renderOption(option, index, true))}
                    </div>
                )
            }
        >
            {children}
        </PopoverBase>
    );
});
