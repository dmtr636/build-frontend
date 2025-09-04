import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "src/ui/components/info/Skeleton/Skeleton.tsx";

const meta = {
    title: "Yuigahama/Info/Skeleton",
    component: Skeleton,
    parameters: {
        layout: "centered",
    },
    args: {},
    tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        width: 500,
        height: 50,
    },
};
