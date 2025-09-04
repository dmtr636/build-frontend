import type { Meta, StoryObj } from "@storybook/react";
import { FloatingButton } from "src/ui/components/controls/FloatingButton/FloatingButton.tsx";
import { IconAttention } from "src/ui/assets/icons";

const meta = {
    title: "Yuigahama/Controls/FloatingButton",
    component: FloatingButton,
    parameters: {
        layout: "centered",
    },
    args: {
        children: <IconAttention />,
    },
    tags: ["autodocs"],
} satisfies Meta<typeof FloatingButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};
