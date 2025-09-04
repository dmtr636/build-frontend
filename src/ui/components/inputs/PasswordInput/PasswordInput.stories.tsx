import type { Meta, StoryObj } from "@storybook/react";

import { PasswordInput } from "./PasswordInput.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import React from "react";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Inputs/PasswordInput",
    component: PasswordInput,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {},
    tags: ["autodocs"],
} satisfies Meta<typeof PasswordInput>;

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
    },
    render: () => {
        const [value, setValue] = React.useState("");

        return (
            <FlexStory>
                <div style={{ width: "500px" }}>
                    <PasswordInput value={value} onChange={setValue} />
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
