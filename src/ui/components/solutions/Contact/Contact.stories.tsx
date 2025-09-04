import type { Meta, StoryObj } from "@storybook/react";
import { Contact } from "src/ui/components/solutions/Contact/Contact.tsx";

const meta = {
    title: "Yuigahama/Solutions/Contact",
    component: Contact,
    parameters: {
        layout: "centered",
    },
    args: {},
    tags: ["autodocs"],
} satisfies Meta<typeof Contact>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Email: Story = {
    args: {
        text: "example@mail.ru",
        type: "email",
    },
};

export const Phone: Story = {
    args: {
        text: "+7 (910) 123-45-67",
        type: "phone",
    },
};
