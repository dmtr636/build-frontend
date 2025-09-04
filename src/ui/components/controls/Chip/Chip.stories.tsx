import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip.tsx";
import { useState } from "react";
import { IconAttention } from "src/ui/assets/icons";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Controls/Chip",
    component: Chip,
    parameters: {
        layout: "centered",
    },
    args: {
        children: "Chip",
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 5,
        onDelete: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {} as any,
    render: (args) => {
        const [selected1, setSelected1] = useState(false);
        return (
            <Chip {...args} selected={selected1} onChange={setSelected1}>
                {args.children}
            </Chip>
        );
    },
};

export const Secondary: Story = {
    args: {} as any,
    render: (args) => {
        const [selected1, setSelected1] = useState(false);
        return (
            <Chip {...args} type={"secondary"} selected={selected1} onChange={setSelected1}>
                {args.children}
            </Chip>
        );
    },
};
