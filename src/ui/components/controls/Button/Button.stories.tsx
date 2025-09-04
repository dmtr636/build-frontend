import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.tsx";
import { IconAttention } from "src/ui/assets/icons";
import { GridStory } from "src/ui/storybook/components/GridStory/GridStory.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import {
    ButtonMode,
    ButtonSize,
    ButtonType,
} from "src/ui/components/controls/Button/Button.types.ts";

const meta = {
    title: "Yuigahama/Controls/Button",
    component: Button,
    parameters: {
        layout: "centered",
    },
    args: {
        children: "Button",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const buttonTypes: ButtonType[] = ["primary", "secondary", "tertiary", "outlined", "text"];
const buttonSizes: ButtonSize[] = ["large", "medium", "small"];

const getStoryForMode = (mode: ButtonMode, types = buttonTypes): Story => ({
    parameters: {
        backgrounds: {
            default: mode === "contrast" ? "FigmaDark" : undefined,
        },
    },
    args: {
        mode: mode,
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 5,
    },
    render: (args) => {
        return (
            <FlexStory direction={"column"} gap={32}>
                <GridStory columns={4} color={mode === "contrast" ? "white" : "black"}>
                    <div>Default</div>
                    <div>Pale</div>
                    <div>Disabled</div>
                    <div>Focused</div>
                </GridStory>
                {types.map((type) => (
                    <>
                        <GridStory columns={4}>
                            {buttonSizes.map((size) => (
                                <>
                                    <div>
                                        <Button {...args} size={size} type={type}>
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button {...args} size={size} type={type} pale={true}>
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button {...args} size={size} type={type} disabled={true}>
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button {...args} size={size} type={type} focused={true}>
                                            {args.children}
                                        </Button>
                                    </div>
                                </>
                            ))}
                        </GridStory>
                        <GridStory columns={4}>
                            {buttonSizes.map((size) => (
                                <>
                                    <div>
                                        <Button {...args} size={size} type={type} rounding={"peak"}>
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            {...args}
                                            size={size}
                                            type={type}
                                            pale={true}
                                            rounding={"peak"}
                                        >
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            {...args}
                                            size={size}
                                            type={type}
                                            disabled={true}
                                            rounding={"peak"}
                                        >
                                            {args.children}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            {...args}
                                            size={size}
                                            type={type}
                                            focused={true}
                                            rounding={"peak"}
                                        >
                                            {args.children}
                                        </Button>
                                    </div>
                                </>
                            ))}
                        </GridStory>
                    </>
                ))}
            </FlexStory>
        );
    },
});

export const Accent: Story = getStoryForMode("accent");
export const Negative: Story = getStoryForMode("negative");
export const Positive: Story = getStoryForMode("positive");
export const Neutral: Story = getStoryForMode("neutral");
export const Contrast: Story = getStoryForMode("contrast");
export const Brand: Story = getStoryForMode("brand");

export const OnlyIconBefore: Story = {
    args: {
        iconBefore: <IconAttention />,
        children: undefined,
    },
};

export const FullWidth: Story = {
    args: {
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 5,
        fullWidth: true,
    },
    render: (args) => (
        <GridStory columns={2}>
            <div>Align start</div>
            <div>Align center</div>
            <div style={{ width: "400px" }}>
                <Button {...args} align={"start"}>
                    {args.children}
                </Button>
            </div>
            <div style={{ width: "400px" }}>
                <Button {...args}>{args.children}</Button>
            </div>
        </GridStory>
    ),
};

export const Loading: Story = {
    args: {
        loading: true,
    },
};
