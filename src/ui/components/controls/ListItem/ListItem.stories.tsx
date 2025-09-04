import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { ListItem } from "src/ui/components/controls/ListItem/ListItem.tsx";

const meta = {
    title: "Yuigahama/Controls/ListItem",
    component: ListItem,
    parameters: {
        layout: "centered",
    },
    args: {
        children: "List item",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const Accent: Story = {
    args: {
        mode: "accent",
    },
    render: (args) => {
        const [checked1, setChecked1] = useState(false);
        const [checked2, setChecked2] = useState(true);

        return (
            <FlexStory direction={"column"}>
                <FlexStory gap={40}>
                    <div>
                        <ListItem {...args} size={"large"}>
                            {args.children}
                        </ListItem>
                    </div>
                    <div>
                        <ListItem
                            {...args}
                            size={"large"}
                            checked={checked1}
                            onClick={() => setChecked1(!checked1)}
                        >
                            {args.children}
                        </ListItem>
                    </div>
                    <div>
                        <ListItem {...args}>{args.children}</ListItem>
                    </div>
                    <div>
                        <ListItem
                            {...args}
                            checked={checked2}
                            onClick={() => setChecked2(!checked2)}
                        >
                            {args.children}
                        </ListItem>
                    </div>
                </FlexStory>
                <FlexStory gap={40}>
                    <div>
                        <ListItem {...args} size={"large"} disabled={true}>
                            {args.children}
                        </ListItem>
                    </div>
                    <div>
                        <ListItem
                            {...args}
                            size={"large"}
                            checked={checked1}
                            onClick={() => setChecked1(!checked1)}
                            disabled={true}
                        >
                            {args.children}
                        </ListItem>
                    </div>
                    <div>
                        <ListItem {...args} disabled={true}>
                            {args.children}
                        </ListItem>
                    </div>
                    <div>
                        <ListItem
                            {...args}
                            checked={checked2}
                            onClick={() => setChecked2(!checked2)}
                            disabled={true}
                        >
                            {args.children}
                        </ListItem>
                    </div>
                </FlexStory>
            </FlexStory>
        );
    },
};

export const Neutral: Story = { ...Accent, args: { mode: "neutral" } };

export const Brand: Story = { ...Accent, args: { mode: "brand" } };
