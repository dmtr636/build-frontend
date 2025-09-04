import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Overlay } from "src/ui/components/segments/overlays/Overlay/Overlay.tsx";

const meta = {
    title: "Yuigahama/Segments/Overlay",
    component: Overlay,
    parameters: {
        layout: "centered",
    },
    args: {
        title: "Заголовок окна",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Overlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {} as any,
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open overlay</Button>
                <Overlay
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    actions={[
                        <Button onClick={() => setOpen(false)}>Button</Button>,
                        <Button type={"secondary"} onClick={() => setOpen(false)}>
                            Button
                        </Button>,
                    ]}
                >
                    Content
                </Overlay>
            </>
        );
    },
};
