import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "src/ui/components/solutions/Calendar/Calendar.tsx";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Solutions/Calendar",
    component: Calendar,
    parameters: {
        layout: "centered",
    },
    args: {
        onChange: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const DisableYear: Story = {
    args: {
        disableYear: true,
    },
};

export const DisableTime: Story = {
    args: {
        disableTime: true,
    },
};

export const DisablePast: Story = {
    args: {
        disablePast: true,
    },
};

export const DisableFuture: Story = {
    args: {
        disableFuture: true,
    },
};

export const BrandMode: Story = {
    args: {
        mode: "brand",
        value: "2024-11-10T00:00:00.000Z",
    },
};
