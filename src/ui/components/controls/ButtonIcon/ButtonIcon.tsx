import { Button, ButtonProps } from "src/ui/components/controls/Button/Button.tsx";

type ButtonIconProps = Omit<ButtonProps, "iconBefore" | "iconAfter" | "counter">;

export const ButtonIcon = (props: ButtonIconProps) => {
    const { type = "tertiary" }: ButtonIconProps = props;
    return (
        <Button {...props} type={type}>
            {props.children}
        </Button>
    );
};
