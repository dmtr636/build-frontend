import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { fn } from "@storybook/test";
import { useState } from "react";

const meta = {
    title: "Yuigahama/Inputs/DatePicker",
    component: DatePicker,
    parameters: {
        layout: "centered",
    },
    args: {
        onChange: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: "",
    },
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        const handleChange = (value: string | null) => {
            setValue(value);
        };

        return <DatePicker {...args} value={value} onChange={handleChange} />;
    },
};

export const ManualInput: Story = {
    args: {
        value: "",
        manualInput: true,
    },
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        const handleChange = (value: string | null) => {
            setValue(value);
        };

        return <DatePicker {...args} value={value} onChange={handleChange} />;
    },
};
