import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { IconClose, IconSearch } from "src/ui/assets/icons";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";
import { InputSize } from "src/ui/components/inputs/Input/Input.types.ts";
import { CSSProperties } from "react";
import { Tooltip } from "src/ui/components/info/Tooltip/Tooltip.tsx";

export const ExplorationInput = (props: {
    inputPlaceholder?: string;
    onInputChange: (value: string) => void;
    inputValue: string;
    size?: InputSize;
    style?: CSSProperties;
    disabled?: boolean;
}) => {
    const size = props.size ?? "large";
    return (
        <Input
            placeholder={props.inputPlaceholder}
            onChange={(event) => props.onInputChange(event.target.value)}
            types={"text"}
            value={props.inputValue}
            startIcon={<IconSearch />}
            size={size}
            disabled={props.disabled}
            endIcon={
                props.inputValue && (
                    <Tooltip header={"Очистить"} delay={500}>
                        <ButtonIcon
                            mode={"neutral"}
                            size={size === "large" ? "medium" : "small"}
                            pale={true}
                            onClick={() => props.onInputChange("")}
                        >
                            <IconClose />
                        </ButtonIcon>
                    </Tooltip>
                )
            }
            style={props.style}
        />
    );
};
