import type { Meta, StoryObj } from "@storybook/react";
import { IconAttention } from "src/ui/assets/icons";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { Status } from "src/ui/components/info/Status/Status.tsx";

const meta = {
    title: "Yuigahama/Info/Status",
    component: Status,
    parameters: {
        layout: "centered",
    },
    args: {
        children: "Status",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Status>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const All: Story = {
    args: {
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
    },
    render: (args) => {
        return (
            <FlexStory direction={"column"} gap={20}>
                <FlexStory gap={40}>
                    <Status {...args} children={args.children} mode={"neutral"} size={"medium"} />
                    <Status {...args} children={args.children} mode={"neutral"} size={"small"} />
                    <Status {...args} children={args.children} mode={"neutral"} size={"tiny"} />
                </FlexStory>
                <FlexStory gap={40}>
                    <Status {...args} children={args.children} mode={"positive"} size={"medium"} />
                    <Status {...args} children={args.children} mode={"positive"} size={"small"} />
                    <Status {...args} children={args.children} mode={"positive"} size={"tiny"} />
                </FlexStory>
                <FlexStory gap={40}>
                    <Status {...args} children={args.children} mode={"negative"} size={"medium"} />
                    <Status {...args} children={args.children} mode={"negative"} size={"small"} />
                    <Status {...args} children={args.children} mode={"negative"} size={"tiny"} />
                </FlexStory>
                <FlexStory gap={40}>
                    <Status {...args} children={args.children} mode={"accent"} size={"medium"} />
                    <Status {...args} children={args.children} mode={"accent"} size={"small"} />
                    <Status {...args} children={args.children} mode={"accent"} size={"tiny"} />
                </FlexStory>
                <FlexStory gap={40}>
                    <Status {...args} children={args.children} mode={"warning"} size={"medium"} />
                    <Status {...args} children={args.children} mode={"warning"} size={"small"} />
                    <Status {...args} children={args.children} mode={"warning"} size={"tiny"} />
                </FlexStory>
            </FlexStory>
        );
    },
};
