import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";
import { Drawer } from "src/ui/components/segments/Drawer/Drawer.tsx";
import { IconAttention } from "src/ui/assets/icons";
import { fn } from "@storybook/test";

const meta = {
    title: "Yuigahama/Segments/Drawer",
    component: Drawer,
    parameters: {
        layout: "centered",
    },
    args: {
        open: false,
        onClose: fn(),
        title: "Drawer heading",
        children: "Content",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open drawer</Button>
                <Drawer
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    actions={() => [
                        <Button>Button</Button>,
                        <Button type={"secondary"}>Button</Button>,
                    ]}
                >
                    Content
                </Drawer>
            </>
        );
    },
};

export const WithTabs: Story = {
    args: {
        tabs: [
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
        ],
    },
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open drawer</Button>
                <Drawer
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    actions={() => [
                        <Button>Button</Button>,
                        <Button type={"secondary"}>Button</Button>,
                    ]}
                >
                    Content
                </Drawer>
            </>
        );
    },
};
