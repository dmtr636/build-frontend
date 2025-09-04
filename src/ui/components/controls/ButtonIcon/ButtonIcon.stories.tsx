import type { Meta, StoryObj } from "@storybook/react";

import { ButtonIcon } from "./ButtonIcon.tsx";
import { IconAttention } from "src/ui/assets/icons";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { GridStory } from "src/ui/storybook/components/GridStory/GridStory.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import {
    ButtonMode,
    ButtonSize,
    ButtonType,
} from "src/ui/components/controls/Button/Button.types.ts";

const meta = {
    title: "Yuigahama/Controls/ButtonIcon",
    component: ButtonIcon,
    parameters: {
        layout: "centered",
    },
    args: {
        children: <IconAttention />,
    },
    argTypes: {
        children: {
            control: "select",
            mapping: {
                IconAttention: <IconAttention />,
            },
            options: ["IconAttention"],
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const buttonTypes: ButtonType[] = ["primary", "secondary", "tertiary", "outlined"];
const buttonSizes: ButtonSize[] = ["huge", "large", "medium", "small", "tiny"];

const getStoryForMode = (mode: ButtonMode, types = buttonTypes): Story => ({
    parameters: {
        backgrounds: {
            default: mode === "contrast" ? "FigmaDark" : undefined,
        },
    },
    args: {
        mode: mode,
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
                ))}
            </FlexStory>
        );
    },
});

export const Accent: Story = getStoryForMode("accent");
export const Negative: Story = getStoryForMode("negative");
export const Positive: Story = getStoryForMode("positive");
export const Neutral: Story = getStoryForMode("neutral");
export const Contrast: Story = getStoryForMode("contrast", ["tertiary"]);
export const Brand: Story = getStoryForMode("brand");
