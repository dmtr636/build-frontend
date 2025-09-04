import type { Meta, StoryObj } from "@storybook/react";

import { PhoneInput } from "././PhoneInput.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import React from "react";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Inputs/PhoneInput",
    component: PhoneInput,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {},
    tags: ["autodocs"],
} satisfies Meta<typeof PhoneInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/* export const Default: Story = {};
 */

const getStoryForType = (): Story => ({
    args: {
        onChange: fn(),
        disabled: false,
        error: false,
        value: "",
    },
    argTypes: {
        disabled: {
            table: {
                disable: false,
            },
        },
        error: {
            table: {
                disable: true,
            },
        },
        value: {
            table: {
                disable: true,
            },
        },
        outlined: {
            control: "select",
            mapping: {
                None: null,
            },
            options: [false, true],
        },
    },
    render: () => {
        const [value, setValue] = React.useState("");
        return (
            <FlexStory>
                <div style={{ width: "500px" }}>
                    <PhoneInput onChange={setValue} value={value} />
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
