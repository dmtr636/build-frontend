import type { Meta, StoryObj } from "@storybook/react";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { SnackbarProvider } from "src/ui/components/info/Snackbar/SnackbarProvider.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { snackbarStore } from "src/shared/stores/SnackbarStore.tsx";

const meta = {
    title: "Yuigahama/Info/Snackbar",
    component: SnackbarProvider,
    parameters: {
        layout: "centered",
    },
    args: {},
    tags: ["autodocs"],
} satisfies Meta<typeof SnackbarProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => {
        return (
            <>
                <FlexStory>
                    <Button
                        mode={"positive"}
                        onClick={() =>
                            snackbarStore.showPositiveSnackbar(
                                "Действие произошло и большой текст",
                                {
                                    actionButtonLabel: "Button",
                                    showCloseButton: true,
                                },
                            )
                        }
                    >
                        Show positive snackbar
                    </Button>
                    <Button
                        mode={"negative"}
                        onClick={() =>
                            snackbarStore.showNegativeSnackbar(
                                "Действие произошло и большой текст",
                                {
                                    actionButtonLabel: "Button",
                                    showCloseButton: true,
                                },
                            )
                        }
                    >
                        Show negative snackbar
                    </Button>
                    <Button
                        mode={"neutral"}
                        onClick={() =>
                            snackbarStore.showNeutralSnackbar(
                                "Действие произошло и большой текст",
                                {
                                    actionButtonLabel: "Button",
                                    showCloseButton: true,
                                },
                            )
                        }
                    >
                        Show neutral snackbar
                    </Button>
                </FlexStory>
                <SnackbarProvider />
            </>
        );
    },
};
