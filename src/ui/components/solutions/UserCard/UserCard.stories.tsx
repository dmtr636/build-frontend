import type { Meta, StoryObj } from "@storybook/react";
import { UserCard } from "src/ui/components/solutions/UserCard/UserCard.tsx";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Solutions/UserCard",
    component: UserCard,
    parameters: {
        layout: "centered",
    },
    args: {
        onEditClick: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof UserCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        email: "example@mail.ru",
        role: "Роль в системе",
    },
};

export const WithName: Story = {
    args: {
        email: "example@mail.ru",
        role: "Роль в системе",
        lastName: "Фамилия",
        firstName: "Имя",
    },
};

export const WithPhoto: Story = {
    args: {
        email: "example@mail.ru",
        photoUrl: "https://cataas.com/cat",
        role: "Роль в системе",
        lastName: "Фамилия",
        firstName: "Имя",
    },
};

export const Overflowed: Story = {
    args: {
        email: "Data-data-data-data-data-data-data-data-data@mail.ru",
        role: "Data-data-data-data-data-data-data-data-data",
    },
};
