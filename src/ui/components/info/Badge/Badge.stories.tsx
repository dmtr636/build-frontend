import type { Meta, StoryObj } from "@storybook/react";

import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";

import { IconAttention } from "src/ui/assets/icons";
import { Badge } from "src/ui/components/info/Badge/Badge.tsx";

const meta = {
    title: "Yuigahama/Info/Badge",
    component: Badge,
    parameters: {
        layout: "centered",
    },

    tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/* export const Default: Story = {};
 */

const getStoryForType = (): Story => ({
    args: {
        children: <></>,
        size: "small",
        mode: "positive",
        value: "",
    },
    argTypes: {
        size: {
            control: "select",
            options: ["large", "medium", "small", "tiny", "micro"],
        },
        mode: {
            control: "select",
            options: ["accent", "negative", "positive", "neutral", "contrast", `brand`],
        },
    },
    render: (args) => {
        return (
            <FlexStory>
                <div>
                    <Badge {...args}>
                        <IconAttention></IconAttention>
                    </Badge>
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
