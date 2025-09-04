import type { Meta, StoryObj } from "@storybook/react";

import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { IconMatrix } from "src/ui/assets/icons";
import { BreadCrumbs } from "src/ui/components/solutions/Breadcrumbs/BreadCrumbs.tsx";

const meta = {
    title: "Yuigahama/Solutions/BreadCrumbs",
    component: BreadCrumbs,
    parameters: {
        layout: "centered",
    },

    tags: ["autodocs"],
} satisfies Meta<typeof BreadCrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

/* export const Default: Story = {};
 */
const breadCrumbsArray = [
    {
        icon: <IconMatrix />,
        name: "Страница 1",
        onClick: () => {
            alert("первая страница");
        },
    },
    {
        /*icon: <IconMatrix/>,*/
        name: "Страница 2",
        onClick: () => {
            alert("вторая  страница");
        },
    },
    {
        icon: <IconMatrix />,
        name: "Ссылка 3",
        onClick: () => {
            alert("третья  страница");
        },
    },
];

const getStoryForType = (): Story => ({
    args: {
        breadCrumbsArray: breadCrumbsArray,
    },
    argTypes: {},
    render: () => {
        const breadCrumbsArray = [
            {
                icon: <IconMatrix />,
                name: "Страница 1",
                onClick: () => {
                    alert("первая страница");
                },
            },
            {
                /*icon: <IconMatrix/>,*/
                name: "Страница 2",
                onClick: () => {
                    alert("вторая  страница");
                },
            },
            {
                icon: <IconMatrix />,
                name: "Ссылка 3",
                onClick: () => {
                    alert("третья  страница");
                },
            },
        ];
        return (
            <FlexStory>
                <div style={{ width: "500px" }}>
                    <BreadCrumbs breadCrumbsArray={breadCrumbsArray} />
                </div>
            </FlexStory>
        );
    },
});

export const Primary: Story = getStoryForType();
