import type { Meta, StoryObj } from "@storybook/react";

import { EmailInput } from "./EmailInput.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import React from "react";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Inputs/EmailInput",
    component: EmailInput,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {},
    tags: ["autodocs"],
} satisfies Meta<typeof EmailInput>;

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
        /*  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
            setValue(event.target.value);
        }; */
        return (
            <FlexStory>
                <div style={{ width: "500px" }}>
                    <EmailInput onChange={setValue} value={value} />
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
