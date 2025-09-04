import type { Meta, StoryObj } from "@storybook/react";

import { Tooltip } from "./Tooltip.tsx";
import { IconAttention } from "src/ui/assets/icons";
import { ReactNode } from "react";
import { Button } from "../../controls/Button/Button.tsx";
import { TooltipMode } from "src/ui/components/info/Tooltip/Tooltip.types.ts";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";

const meta = {
    title: "Yuigahama/Info/Tooltip",
    component: Tooltip,
    parameters: {
        layout: "centered",
    },
    args: {
        children: "ButtonIconAttention" as any,
        header: "Header",
        text: "Kind text inside that tells and shows",
    },
    argTypes: {
        children: {
            control: "select",
            mapping: {
                ButtonIconAttention: (
                    <ButtonIcon onClick={() => {}}>
                        <IconAttention />
                    </ButtonIcon>
                ),
            },
            options: ["ButtonIconAttention"],
        },
        mode: {
            control: "select",
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const Grid = ({ children }: { children: ReactNode }) => {
    return (
        <div
            style={{
                display: "grid",
                gap: "40px",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
            }}
        >
            {children}
        </div>
    );
};

const getStoryForColor = (color: TooltipMode): Story => ({
    args: {
        mode: color,
    },
    parameters: {
        backgrounds: {
            default: color === "contrast" ? "dark" : "light",
        },
    },
    render: (args) => {
        return (
            <Grid>
                <Tooltip {...args} tipPosition={"top-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-center
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"bottom-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-center
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"right-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-center
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"left-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-center
                    </Button>
                </Tooltip>

                <Tooltip {...args} tipPosition={"top-left"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-left
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"bottom-left"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-left
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"right-top"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-top
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"left-top"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-top
                    </Button>
                </Tooltip>

                <Tooltip {...args} tipPosition={"top-right"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-right
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"bottom-right"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-right
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"right-bottom"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-bottom
                    </Button>
                </Tooltip>
                <Tooltip {...args} tipPosition={"left-bottom"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-bottom
                    </Button>
                </Tooltip>
            </Grid>
        );
    },
});

export const Accent: Story = getStoryForColor("accent");

export const Neutral: Story = getStoryForColor("neutral");

export const Contrast: Story = getStoryForColor("contrast");

export const WithDelay: Story = {
    args: {
        delay: 500,
    },
};
