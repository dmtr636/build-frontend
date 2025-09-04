import styles from "./Contact.module.scss";
import { IconEmail, IconTelephone } from "src/ui/assets/icons";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { Popover } from "src/ui/components/solutions/Popover/Popover.tsx";
import { clsx } from "clsx";

interface ContactProps {
    text: string;
    type: "email" | "phone";
    disableCopy?: boolean;
}

export const Contact = (props: ContactProps) => {
    return (
        <Popover
            header={props.type === "email" ? "Почта скопирована" : "Телефон скопирован"}
            autoCloseDelay={3000}
        >
            <button
                className={clsx(styles.contact, { [styles.disableCopy]: props.disableCopy })}
                onClick={() => {
                    navigator.clipboard.writeText(props.text);
                }}
            >
                {props.type === "email" ? <IconEmail /> : <IconTelephone />}
                <TooltipTypo variant={"actionL"} closeOnClick>
                    {props.text}
                </TooltipTypo>
            </button>
        </Popover>
    );
};
