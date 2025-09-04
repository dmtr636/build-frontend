import type { Meta, StoryObj } from "@storybook/react";
import { Notification } from "src/ui/components/solutions/Notification/Notification.tsx";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Solutions/Notification",
    component: Notification,
    parameters: {
        layout: "centered",
    },
    args: {
        onNotificationClick: fn(),
        onAllNotificationsClick: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Notification>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        notifications: [
            {
                id: 1,
                date: new Date().toISOString(),
                text: "Новое уведомление",
            },
            {
                id: 2,
                date: new Date().toISOString(),
                text: "Новое уведомление",
            },
            {
                id: 3,
                date: new Date().toISOString(),
                text: "Новое уведомление с длинным текстом с длинным текстом с длинным текстом с длинным текстом",
            },
        ],
    },
};

export const NoNotifications: Story = {
    args: {
        notifications: [],
    },
};
