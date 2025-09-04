import { ButtonMode, ButtonSize, ButtonType } from "../../controls/Button/Button.types";

export type CounterType = Exclude<ButtonType, "tertiary">;
export type CounterMode = ButtonMode;
export type CounterSize = ButtonSize | "micro";
