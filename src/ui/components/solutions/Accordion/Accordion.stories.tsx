import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "src/ui/components/solutions/Accordion/Accordion.tsx";

const meta = {
    title: "Yuigahama/Solutions/Accordion",
    component: Accordion,
    parameters: {
        layout: "centered",
    },
    args: {},
    tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Accordion",
        content: (
            <div style={{ width: "300px" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
            </div>
        ),
        counter: 3,
    },
};
