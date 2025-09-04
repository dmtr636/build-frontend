import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar.tsx";
import { GridStory } from "src/ui/storybook/components/GridStory/GridStory.tsx";

const meta = {
    title: "Yuigahama/Solutions/Avatar",
    component: Avatar,
    parameters: {
        layout: "centered",
    },
    args: {
        dropdownListOptions: [{ name: "Button 1" }, { name: "Button 2" }],
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const All: Story = {
    render: (args) => {
        return (
            <GridStory columns={3}>
                <Avatar {...args} photoUrl={"https://cataas.com/cat"} size={"large"} />
                <Avatar {...args} userName={"Имя Фамилия"} size={"large"} />
                <Avatar {...args} size={"large"} />
                <Avatar {...args} photoUrl={"https://cataas.com/cat"} />
                <Avatar {...args} userName={"Имя Фамилия"} />
                <Avatar {...args} />
            </GridStory>
        );
    },
};
