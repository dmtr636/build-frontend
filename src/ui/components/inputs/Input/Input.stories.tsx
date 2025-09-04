import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";
import { IconAttention } from "src/ui/assets/icons";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import React, { ChangeEvent } from "react";
import { fn } from "@storybook/test";
import { ButtonIcon } from "src/ui/components/controls/ButtonIcon/ButtonIcon.tsx";

const meta = {
    title: "Yuigahama/Inputs/Input",
    component: Input,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {
        types: {
            control: "select",
            mapping: {
                text: "text",
                password: "password",
            },
            options: ["text", "password"],
        },

        size: {
            control: "select",
            options: ["medium", "large"],
        },
        readonly: {
            control: "select",
            options: ["false", "true"],
        },
        startIcon: {
            control: "select",
            mapping: {
                None: null,
                IconAttention: <IconAttention />,
            },
            options: ["None", "IconAttention"],
        },

        outlined: {
            control: "select",
            mapping: {
                None: null,
            },
            options: [false, true],
        },
        maskType: {
            control: "select",
            mapping: {
                None: null,
            },
            options: ["phone", "date", "fulldate", "time"],
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const getStoryForType = (): Story => ({
    args: {
        onChange: fn(),
        types: "text",
        size: "medium",
        startIcon: "IconAttention",
        endIcon: "IconAttention",
        formName: "",
        disabled: false,
        placeholder: "",
        error: false,
        value: "",
        formText: "",
        outlined: false,
        /*readonly:false,*/
    },
    argTypes: {
        types: {
            table: {
                disable: false,
            },
        },
        className: {
            table: {
                disable: true,
            },
        },
        style: {
            table: {
                disable: true,
            },
        },
    },
    render: (args) => {
        const [value, setValue] = React.useState("");
        const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
            setValue(event.target.value);
        };
        return (
            <FlexStory>
                <div style={{ width: "360px" }}>
                    <Input
                        {...args}
                        onChange={handleInputChange}
                        endIcon={
                            <ButtonIcon
                                disabled={args.disabled || args.readonly}
                                type="tertiary"
                                mode="neutral"
                                pale={true}
                                size={args.size === "large" ? "medium" : "small"}
                            >
                                <IconAttention />
                            </ButtonIcon>
                        }
                        value={value}
                    ></Input>
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
