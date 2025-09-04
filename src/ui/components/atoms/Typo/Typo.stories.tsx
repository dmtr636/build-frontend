import type { Meta, StoryObj } from "@storybook/react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";

const meta = {
    title: "Yuigahama/Atoms/Typo",
    component: Typo,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Typo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
    args: {} as any,
    render: () => {
        return (
            <FlexStory direction={"column"} gap={16}>
                <Typo variant={"h1"}>Заголовок H1</Typo>
                <Typo variant={"h2"}>Заголовок H2</Typo>
                <Typo variant={"h3"}>Заголовок H3</Typo>
                <Typo variant={"h4"}>Заголовок H4</Typo>
                <Typo variant={"h5"}>Заголовок H5</Typo>
                <Typo variant={"actionXL"}>
                    Для больших кнопок и других основных действий (actionXL)
                </Typo>
                <Typo variant={"actionL"}>
                    Для средних кнопок и других основных действий (actionL)
                </Typo>
                <Typo variant={"actionM"}>
                    Для маленьких кнопок и других основных действий (actionM)
                </Typo>
                <Typo variant={"actionS"}>
                    Для маленьких кнопок и других основных действий (actionS)
                </Typo>
                <Typo variant={"actionXS"}>
                    Для маленьких кнопок и других основных действий (actionXS)
                </Typo>
                <Typo variant={"subheadXL"}>
                    Подзаголовок для большого регулярного текста (subheadXL)
                </Typo>
                <Typo variant={"bodyXL"}>Большой регулярный текст (bodyXL)</Typo>
                <Typo variant={"subheadL"}>
                    Подзаголовок для среднего регулярного текста (subheadL)
                </Typo>
                <Typo variant={"bodyL"}>Средний регулярный текст (bodyL)</Typo>
                <Typo variant={"subheadM"}>
                    Подзаголовок для маленького регулярного текста (subheadM)
                </Typo>
                <Typo variant={"bodyM"}>Маленький регулярный текст (bodyM)</Typo>
                <Typo variant={"bodyS"}>Маленький регулярный текст (bodyS)</Typo>
            </FlexStory>
        );
    },
};
