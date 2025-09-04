import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./Link.tsx";

const meta = {
    title: "Yuigahama/Controls/Link",
    component: Link,
    parameters: {
        layout: "centered",
    },
    args: {
        href: "https://kydas.ru/?" + crypto.randomUUID(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneLine: Story = {
    args: {
        firstLine: "Link to site kydas",
    },
};

export const TwoLine: Story = {
    args: {
        firstLine: "Link to site",
        secondLine: "kydas",
    },
};
