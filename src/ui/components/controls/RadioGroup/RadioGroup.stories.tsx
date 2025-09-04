import type { Meta, StoryObj } from "@storybook/react";
import { RadioButton } from "../RadioButton/RadioButton.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { useArgs } from "@storybook/preview-api";
import { useState } from "react";
import { fn } from "@storybook/test";
import { RadioGroup } from "./RadioGroup.tsx";
import { CheckboxColor } from "../Checkbox/Checkbox.types.ts";

const meta = {
    title: "Yuigahama/Controls/RadioGroup",
    component: RadioGroup,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "figma",
            values: [{ name: "figma", value: "#f5f5f5" }],
        },
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const getStoryForColor = (color: CheckboxColor): Story => {
    return {
        args: {
            onChange: fn(),
            value: "radio1",
            children: (
                <FlexStory gap={20} direction={"column"}>
                    <RadioButton
                        value={"radio1"}
                        color={color}
                        title={"Радиокнопка 1"}
                        subtitle={"Subtitle"}
                    />
                    <RadioButton
                        value={"radio2"}
                        color={color}
                        title={"Радиокнопка 2"}
                        subtitle={"Subtitle"}
                    />
                    <RadioButton
                        value={"radio3"}
                        color={color}
                        title={"Радиокнопка 3"}
                        subtitle={"Subtitle"}
                        disabled
                    />
                </FlexStory>
            ),
        },
        render: (args) => {
            const [_, updateArgs] = useArgs();
            const [value, setValue] = useState(args.value);

            const onChange = (value: string) => {
                updateArgs({ value });
                setValue(value);
            };

            return (
                <RadioGroup {...args} value={value} onChange={onChange}>
                    {args.children}
                </RadioGroup>
            );
        },
    };
};

export const Neutral: Story = getStoryForColor("neutral");

export const Accent: Story = getStoryForColor("accent");

export const Brand: Story = getStoryForColor("brand");
