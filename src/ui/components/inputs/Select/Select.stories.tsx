import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconAttention } from "src/ui/assets/icons";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { Select } from "src/ui/components/inputs/Select/Select.tsx";

const options: SelectOption<string>[] = [...Array(50).keys()].map((item) => ({
    name: `Item ${item}`,
    value: `item${item}`,
}));

const meta = {
    title: "Yuigahama/Inputs/Select",
    component: Select,
    parameters: {
        layout: "centered",
    },
    args: {
        options,
        iconBefore: <IconAttention />,
        formName: "Form name",
        formNotification:
            "The accompanying text is one line or even two long. Just to fit the mold",
        placeholder: "Placeholder",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {} as any,
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        return (
            <div style={{ width: "360px" }}>
                <Select
                    {...args}
                    options={options}
                    value={value}
                    onValueChange={setValue}
                    multiple={false}
                    defaultValue={undefined}
                />
            </div>
        );
    },
};

export const Single: Story = {
    args: {} as any,
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Select
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        multiple={false}
                        defaultValue={undefined}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Select
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        size={"large"}
                        multiple={false}
                        defaultValue={undefined}
                    />
                </div>
            </FlexStory>
        );
    },
};

export const Multiple: Story = {
    args: {} as any,
    render: (args) => {
        const [values, setValues] = useState<string[]>([]);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Select<string>
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        multiple={true}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Select<string>
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        size={"large"}
                        multiple={true}
                    />
                </div>
            </FlexStory>
        );
    },
};
