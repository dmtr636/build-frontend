import React, { ReactNode, RefObject } from "react";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconCheckboxOff, IconCheckboxOn } from "src/ui/assets/icons";
import { observer } from "mobx-react-lite";

interface ListItemProps {
    children: ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    checked?: boolean;
    disabled?: boolean;
    mode?: "accent" | "neutral" | "negative" | "brand";
    size?: "large" | "medium";
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
    customIconBefore?: ReactNode;
    _ref?: RefObject<HTMLButtonElement>;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    clickable?: boolean;
    pale?: boolean;
    buttonStyle?: React.CSSProperties;
}

export const ListItem = observer((props: ListItemProps) => {
    const {
        children,
        onClick,
        checked,
        disabled,
        mode = "neutral",
        size = "medium",
        iconBefore,
        iconAfter,
        customIconBefore,
        _ref,
        onMouseEnter,
        onMouseLeave,
        clickable,
        pale,
        buttonStyle,
    }: ListItemProps = props;

    const getIconBefore = () => {
        if (checked === false) {
            return <IconCheckboxOff />;
        }
        if (checked === true) {
            return <IconCheckboxOn />;
        }
        return iconBefore;
    };

    return (
        <Button
            type={"tertiary"}
            mode={mode}
            size={size}
            disabled={disabled}
            pale={pale || checked === false}
            clickable={clickable}
            onClick={onClick}
            iconBefore={getIconBefore()}
            iconAfter={iconAfter}
            customIconBefore={customIconBefore}
            fullWidth={true}
            align={"start"}
            listItem={true}
            _ref={_ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            _brandListItem={checked && mode === "brand"}
            style={buttonStyle}
        >
            {children}
        </Button>
    );
});
