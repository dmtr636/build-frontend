import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar.tsx";
import { IconAttention, IconLogoPlaceholder } from "src/ui/assets/icons";
import { BrowserRouter } from "react-router-dom";

const meta = {
    title: "Yuigahama/Segments/Sidebar",
    component: Sidebar,
    parameters: {
        layout: "fullscreen",
    },
    args: {
        logo: <IconLogoPlaceholder />,
        routes: [
            {
                path: "/",
                name: "Button",
                icon: <IconAttention />,
                counterValue: 10,
            },
            {
                path: "/2",
                name: "Button",
                icon: <IconAttention />,
            },
            {
                path: "/3",
                name: "Button",
                icon: <IconAttention />,
            },
            {
                path: "/4",
                name: "Button",
                icon: <IconAttention />,
            },
            {
                path: "/5",
                name: "Button",
                icon: <IconAttention />,
                children: [
                    {
                        path: "/5/1",
                        name: "Button",
                    },
                    {
                        path: "/5/2",
                        name: "Button",
                    },
                    {
                        path: "/5/3",
                        name: "Button",
                    },
                    {
                        path: "/5/4",
                        name: "Button",
                    },
                    {
                        path: "/5/5",
                        name: "Button",
                    },
                ],
            },
        ],
        footerRoutes: [
            {
                path: "/6",
                name: "Button",
                icon: <IconAttention />,
            },
            {
                path: "/7",
                name: "Button",
                icon: <IconAttention />,
            },
        ],
    },
    argTypes: {
        logo: {
            table: {
                disable: true,
            },
        },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <BrowserRouter>
            <div style={{ height: "600px" }}>
                <Sidebar {...args} />
            </div>
        </BrowserRouter>
    ),
};
