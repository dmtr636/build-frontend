import type { Meta, StoryObj } from "@storybook/react";

import { LoginPage } from "./LoginPage.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";

const meta = {
    title: "Yuigahama/Pages/LoginPage",
    component: LoginPage,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {},
    tags: ["autodocs"],
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/* export const Default: Story = {};
 */

const getStoryForType = (): Story => ({
    args: {
        /*  logo: <IconLogoPlaceholder />, */
    },
    argTypes: {
        /*  logo: {
            table: {
                disable: true,
            },
        }, */
    },
    render: () => {
        return (
            <FlexStory>
                <div style={{ width: "1600px", height: "800px" }}>{/*<LoginPage />*/}</div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
