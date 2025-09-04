import type { Meta, StoryObj } from "@storybook/react";

import { Counter } from "./Counter";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { GridStory } from "src/ui/storybook/components/GridStory/GridStory.tsx";
import { CounterMode, CounterSize, CounterType } from "./Counter.types";

const meta = {
    title: "Yuigahama/Info/Counter",
    component: Counter,
    parameters: {
        layout: "centered",
    },
    args: {
        value: 3,
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Counter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {} as Story;

const counterTypes: CounterType[] = ["primary", "secondary", "outlined"];
const counterSizes: CounterSize[] = ["large", "medium", "small", "tiny", "micro"];
const counterState = ["normal", "pale", "disabled"];

const getStoryForMode = (mode?: CounterMode): Story => ({
    parameters: {
        backgrounds: {
            default: mode === "contrast" ? "FigmaDark" : undefined,
        },
    },
    args: {
        mode: mode,
    } as any,
    render: (args) => {
        return (
            <FlexStory direction={"column"} gap={32}>
                <GridStory columns={counterTypes.length + 1}>
                    <GridStory
                        columns={1}
                        justifyItems={"end"}
                        color={mode === "contrast" ? "white" : "black"}
                    >
                        {counterState.map((state) => (
                            <div>{state}</div>
                        ))}
                    </GridStory>
                    {counterTypes.map((type) => (
                        <GridStory columns={counterSizes.length} columnGap={18}>
                            {counterState.map((state) =>
                                counterSizes.map((size) => (
                                    <div>
                                        <Counter
                                            {...args}
                                            size={size}
                                            type={type}
                                            pale={state === "pale"}
                                            disabled={state === "disabled"}
                                        />
                                    </div>
                                )),
                            )}
                        </GridStory>
                    ))}
                </GridStory>
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

export const BigValue: Story = {
    args: {
        value: 500,
    },
};
