import styles from "./Person.module.scss";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar.tsx";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { IconClose, IconEdit, IconEntry } from "src/ui/assets/icons";
import { ReactNode } from "react";
import { clsx } from "clsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

interface PersonProps {
    fullName?: string;
    firstName?: string | null;
    lastName?: string | null;
    patronymic?: string | null;
    onEdit?: () => void;
    onEnter?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    icon?: ReactNode;
    iconAfter?: ReactNode;
    additionalText?: ReactNode;
    deleteIcon?: ReactNode;
    disabledDelete?: boolean;
    brand?: boolean;
}

export const Person = (props: PersonProps) => {
    const name =
        props.fullName ??
        [props.lastName, props.firstName, props.patronymic].filter(Boolean).join(" ");
    return (
        <div
            className={clsx(styles.person, { [styles.clickable]: !!props.onClick })}
            onClick={props.onClick}
        >
            <Avatar brand={props.brand} userName={name} size={"small"} icon={props.icon} />
            <TooltipTypo variant={"actionM"}>
                {name}
                {props.additionalText}
            </TooltipTypo>
            {props.iconAfter}
            {(props.onDelete || props.onEdit) && (
                <div className={styles.actions}>
                    {props.onEnter && (
                        <Tooltip tipPosition={"top-center"} mode={`neutral`} text={`Войти`}>
                            <Button
                                mode={props.brand ? "brand" : "accent"}
                                size={`medium`}
                                rounding={"low"}
                                type={"primary"}
                                onClick={props.onEnter}
                                iconBefore={<IconEntry />}
                            ></Button>
                        </Tooltip>
                    )}
                    {props.onEdit && (
                        <ButtonIcon
                            mode={"neutral"}
                            size={"medium"}
                            rounding={"low"}
                            type={"tertiary"}
                            onClick={props.onEdit}
                            pale={true}
                        >
                            {" "}
                            <IconEdit />
                        </ButtonIcon>
                    )}
                    {props.onDelete && (
                        <Tooltip
                            tipPosition={"top-center"}
                            mode={`neutral`}
                            text={`Удалить из списка`}
                        >
                            <ButtonIcon
                                mode={"neutral"}
                                size={"medium"}
                                pale={true}
                                onClick={props.onDelete}
                                disabled={props.disabledDelete}
                            >
                                {props.deleteIcon ?? <IconClose />}
                            </ButtonIcon>
                        </Tooltip>
                    )}
                </div>
            )}
        </div>
    );
};
