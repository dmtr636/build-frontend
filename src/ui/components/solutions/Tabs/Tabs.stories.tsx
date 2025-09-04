import type { Meta, StoryObj } from "@storybook/react";
import { IconAttention } from "src/ui/assets/icons";
import { Tabs } from "src/ui/components/solutions/Tabs/Tabs.tsx";
import { fn } from "@storybook/test";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { useState } from "react";

const tabs = [
    {
        name: "Tab 1",
        value: "tab1",
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 3,
    },
    {
        name: "Tab 2",
        value: "tab2",
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 3,
    },
    {
        name: "Tab 3",
        value: "tab3",
        iconBefore: <IconAttention />,
        iconAfter: <IconAttention />,
        counter: 3,
    },
];

const meta = {
    title: "Yuigahama/Solutions/Tabs",
    component: Tabs,
    parameters: {
        layout: "centered",
    },
    args: {
        tabs,
        value: "tab1",
        onChange: fn(),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: (args) => {
        const [value, setValue] = useState("tab1");

        return (
            <FlexStory direction={"column"} gap={24}>
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"large"} />
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"medium"} />
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"small"} />
            </FlexStory>
        );
    },
};

export const Secondary: Story = {
    args: {
        type: "secondary",
    },
    render: (args) => {
        const [value, setValue] = useState("tab1");

        return (
            <FlexStory direction={"column"} gap={24}>
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"large"} />
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"medium"} />
                <Tabs {...args} tabs={tabs} value={value} onChange={setValue} size={"small"} />
            </FlexStory>
        );
    },
};
