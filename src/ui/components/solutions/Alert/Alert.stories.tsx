import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert.tsx";
import { IconAttention } from "src/ui/assets/icons";
import { AlertMode } from "src/ui/components/solutions/Alert/Alert.types.ts";
import { Button } from "src/ui/components/controls/Button/Button.tsx";

const meta = {
    title: "Yuigahama/Solutions/Alert",
    component: Alert,
    parameters: {
        layout: "centered",
    },
    args: {
        mode: "positive",
        title: "Title",
        subtitle: "Subtitle",
        icon: "IconAttention",
    },
    argTypes: {
        icon: {
            control: "select",
            mapping: {
                None: null,
                IconAttention: <IconAttention />,
            },
            options: ["None", "IconAttention"],
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

const getStoryForMode = (mode: AlertMode): Story => ({
    args: {
        mode,
        actions: [
            <Button mode={`neutral`} type={"primary"} size={"small"}>
                Button
            </Button>,
            <Button mode={`neutral`} type={"tertiary"} size={"small"}>
                Button
            </Button>,
        ],
    },
});

export const Positive: Story = getStoryForMode("positive");

export const Negative: Story = getStoryForMode("negative");

export const Neutral: Story = getStoryForMode("neutral");
