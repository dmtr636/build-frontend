import type { Meta, StoryObj } from "@storybook/react";

import { Popover } from "./Popover.tsx";
import { PopoverColor } from "./Popover.types.ts";
import { ReactNode } from "react";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Link } from "src/ui/components/controls/Link/Link.tsx";

const meta = {
    title: "Yuigahama/Solutions/Popover",
    component: Popover,
    parameters: {
        layout: "centered",
    },
    args: {
        children: <Button>Toggle popover</Button>,
        header: "Header",
        text: "Kind text inside that tells and shows. There may be links here.. There may be links here.",
        footer: (
            <Link
                href={"https://kydas.ru/?" + crypto.randomUUID()}
                firstLine={"Link to site kydas"}
                size={"large"}
            />
        ),
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const Grid = ({ children }: { children: ReactNode }) => {
    return (
        <div
            style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
            }}
        >
            {children}
        </div>
    );
};

const getStoryForColor = (color: PopoverColor): Story => ({
    args: {
        mode: color,
    },
    render: (args) => {
        return (
            <Grid>
                <Popover {...args} tipPosition={"top-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-center
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"bottom-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-center
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"right-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-center
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"left-center"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-center
                    </Button>
                </Popover>

                <Popover {...args} tipPosition={"top-left"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-left
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"bottom-left"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-left
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"right-top"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-top
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"left-top"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-top
                    </Button>
                </Popover>

                <Popover {...args} tipPosition={"top-right"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        top-right
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"bottom-right"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        bottom-right
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"right-bottom"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        right-bottom
                    </Button>
                </Popover>
                <Popover {...args} tipPosition={"left-bottom"}>
                    <Button onClick={() => {}} type={"tertiary"}>
                        left-bottom
                    </Button>
                </Popover>
            </Grid>
        );
    },
});

export const Accent: Story = getStoryForColor("accent");

export const Neutral: Story = getStoryForColor("neutral");

export const Contrast: Story = getStoryForColor("contrast");

export const Brand: Story = getStoryForColor("brand");
