import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useArgs } from "@storybook/preview-api";
import { Switch } from "src/ui/components/controls/Switch/Switch.tsx";

const meta = {
    title: "Yuigahama/Controls/Switch",
    component: Switch,
    parameters: {
        layout: "centered",
    },
    args: {
        title: "Гречка",
        subtitle: "Крупа",
        checked: false,
        onChange: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [{ checked }, updateArgs] = useArgs();

        return (
            <Switch {...args} checked={checked} onChange={(checked) => updateArgs({ checked })} />
        );
    },
};
