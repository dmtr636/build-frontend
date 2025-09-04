import type { Meta, StoryObj } from "@storybook/react";

import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { MdEditor } from "src/ui/components/inputs/MDeditor/MdEditor.tsx";
import { useState } from "react";

const meta = {
    title: "Yuigahama/inputs/MdEditor",
    component: MdEditor,
    parameters: {
        layout: "centered",
    },
    args: {},
    argTypes: {},
    tags: ["autodocs"],
} satisfies Meta<typeof MdEditor>;

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
        const [value, setValue] = useState("");
        console.log(value);
        return (
            <FlexStory>
                <div style={{ width: "1600px", height: "800px" }}>
                    <MdEditor value={value} onChange={setValue} />
                    <div style={{ marginTop: 24 }}>
                        <MdEditor value={value} readOnly={true} />
                    </div>
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
