import type { Meta, StoryObj } from "@storybook/react";
import { Person } from "src/ui/components/solutions/Person/Person.tsx";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Solutions/Person",
    component: Person,
    parameters: {
        layout: "centered",
    },
    args: {},
    tags: ["autodocs"],
} satisfies Meta<typeof Person>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        firstName: "Имя",
        lastName: "Фамилия",
        onEdit: fn(),
        onDelete: fn(),
    },
};
