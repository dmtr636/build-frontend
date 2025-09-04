import type { Meta, StoryObj } from "@storybook/react";
import { Condition } from "./Condition.tsx";

const meta = {
    title: "Yuigahama/Info/Condition",
    component: Condition,
    parameters: {
        layout: "centered",
    },
    args: {
        active: false,
        text: "Condition",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Condition>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = { args: { active: true } };
