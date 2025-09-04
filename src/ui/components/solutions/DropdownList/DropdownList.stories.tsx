import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DropdownList } from "src/ui/components/solutions/DropdownList/DropdownList.tsx";
import {
    DropdownListMode,
    DropdownListOption,
    MultipleDropdownListOption,
} from "src/ui/components/solutions/DropdownList/DropdownList.types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";

const options = [
    [
        { name: "Проверка связи", value: "value1" },
        { name: "Связь проверяю", value: "value2" },
    ],
    [
        { name: "Вышлите приглашение", value: "value3" },
        { name: "На чай", value: "value4" },
    ],
    [
        { name: "Кот", value: "value5" },
        { name: "Собака", value: "value6" },
    ],
];

const defaultOption = options[0][0];

const meta = {
    title: "Yuigahama/Solutions/DropdownList",
    component: DropdownList,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "figma",
            values: [{ name: "figma", value: "#f5f5f5" }],
        },
    },
    args: {
        options,
        value: defaultOption.value,
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DropdownList>;

export default meta;

type Story = StoryObj<typeof meta>;

const getStoryForColor = (color: DropdownListMode): Story => ({
    args: {
        children: <></>,
    },
    render: (args) => {
        const [option, setOption] = useState<DropdownListOption>(defaultOption);

        const onChange = (option: DropdownListOption) => {
            setOption(option);
        };

        return (
            <DropdownList<any>
                {...args}
                mode={color}
                value={option.value}
                onChange={onChange}
                multiple={false}
            >
                <Button mode={color}>{option?.name}</Button>
            </DropdownList>
        );
    },
});

export const Accent: Story = getStoryForColor("accent");

export const Neutral: Story = getStoryForColor("neutral");

export const Multiple: Story = {
    args: {
        children: <></>,
    },
    render: (args) => {
        const [values, setValues] = useState<string[]>([defaultOption.value]);

        const onChange = (options: MultipleDropdownListOption<string>[]) => {
            setValues(options.map((option) => option.value));
        };

        return (
            <DropdownList<any>
                {...args}
                options={options}
                mode={"accent"}
                values={values}
                onChange={onChange}
                multiple={true}
            >
                <Button mode={"accent"}>Open multiple dropdown list</Button>
            </DropdownList>
        );
    },
};
