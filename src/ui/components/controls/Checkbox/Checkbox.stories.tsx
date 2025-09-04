import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox.tsx";
import { useState } from "react";
import { fn } from "@storybook/test";
import { GridStory } from "src/ui/storybook/components/GridStory/GridStory.tsx";
import { CheckboxColor, CheckboxSize } from "src/ui/components/controls/Checkbox/Checkbox.types.ts";

const meta = {
    title: "Yuigahama/Controls/Checkbox",
    component: Checkbox,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "figma",
            values: [{ name: "figma", value: "#f5f5f5" }],
        },
    },
    args: {
        title: "Title",
        subtitle: "Subtitle",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onChange: fn(),
    },
};

const getStoryForColor = (color: CheckboxColor): Story => ({
    args: {
        onChange: fn(),
    },
    render: (args) => {
        const [checked1, setChecked1] = useState(false);
        const [checked2, setChecked2] = useState(true);
        const [checked3, setChecked3] = useState(true);
        const [checked4, setChecked4] = useState(true);

        const checkboxSizes: CheckboxSize[] = ["large", "medium"];

        return (
            <GridStory columns={6} rowGap={60}>
                {checkboxSizes.map((size) => (
                    <>
                        <Checkbox
                            {...args}
                            color={color}
                            checked={checked1}
                            onChange={setChecked1}
                            size={size}
                        />
                        <Checkbox
                            {...args}
                            color={color}
                            checked={checked2}
                            onChange={setChecked2}
                            size={size}
                        />
                        <Checkbox
                            {...args}
                            color={color}
                            checked={checked3}
                            onChange={setChecked3}
                            intermediate={"minus"}
                            size={size}
                        />
                        <Checkbox
                            {...args}
                            color={color}
                            checked={checked4}
                            onChange={setChecked4}
                            intermediate={"plus"}
                            size={size}
                        />
                        <Checkbox {...args} color={color} disabled size={size} />
                        <Checkbox {...args} color={color} checked disabled size={size} />
                    </>
                ))}
            </GridStory>
        );
    },
});

export const Neutral: Story = getStoryForColor("neutral");

export const Accent: Story = getStoryForColor("accent");

export const Brand: Story = getStoryForColor("brand");
