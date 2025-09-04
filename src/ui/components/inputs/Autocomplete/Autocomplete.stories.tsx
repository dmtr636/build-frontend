import type { Meta, StoryObj } from "@storybook/react";
import { SelectOption } from "src/ui/components/inputs/Select/Select.types.ts";
import { useState } from "react";
import { IconAttention } from "src/ui/assets/icons";
import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";

const options: SelectOption<string>[] = [...Array(50).keys()].map((item) => ({
    name: `Item ${item}`,
    value: `item${item}`,
    icon: <IconAttention />,
}));

const meta = {
    title: "Yuigahama/Inputs/Autocomplete",
    component: Autocomplete,
    parameters: {
        layout: "centered",
    },
    args: {
        options,
        value: null,
        iconBefore: <IconAttention />,
        formName: "Form name",
        formNotification:
            "The accompanying text is one line or even two long. Just to fit the mold",
        placeholder: "Placeholder",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Autocomplete>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {} as any,
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        return (
            <div style={{ width: "360px" }}>
                <Autocomplete
                    {...args}
                    options={options}
                    value={value}
                    onValueChange={setValue}
                    multiple={false}
                />
            </div>
        );
    },
};

export const Single: Story = {
    args: {} as any,
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        multiple={false}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        size={"large"}
                        multiple={false}
                    />
                </div>
            </FlexStory>
        );
    },
};

export const SingleBrand: Story = {
    args: {
        brand: true,
    } as any,
    render: (args) => {
        const [value, setValue] = useState<string | null>(null);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        multiple={false}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        value={value}
                        onValueChange={setValue}
                        size={"large"}
                        multiple={false}
                    />
                </div>
            </FlexStory>
        );
    },
};

// export const Free: Story = {
//     args: {} as any,
//     render: (args) => {
//         const [value, setValue] = useState<string | null>(null);
//
//         return (
//             <FlexStory gap={80}>
//                 <div style={{ width: "360px" }}>
//                     <Autocomplete
//                         {...args}
//                         options={options}
//                         value={value}
//                         onValueChange={setValue}
//                         multiple={false}
//                         free={true}
//                     />
//                 </div>
//                 <div style={{ width: "360px" }}>
//                     <Autocomplete
//                         {...args}
//                         options={options}
//                         value={value}
//                         onValueChange={setValue}
//                         size={"large"}
//                         multiple={false}
//                         free={true}
//                     />
//                 </div>
//             </FlexStory>
//         );
//     },
// };
//
export const Multiple: Story = {
    args: {} as any,
    render: (args: any) => {
        const [values, setValues] = useState<string[]>([]);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        multiple={true}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        size={"large"}
                        multiple={true}
                    />
                </div>
            </FlexStory>
        );
    },
};

export const MultipleBrand: Story = {
    args: {
        brand: true,
    } as any,
    render: (args: any) => {
        const [values, setValues] = useState<string[]>([]);

        return (
            <FlexStory gap={80}>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        multiple={true}
                    />
                </div>
                <div style={{ width: "360px" }}>
                    <Autocomplete
                        {...args}
                        options={options}
                        values={values}
                        onValuesChange={setValues}
                        size={"large"}
                        multiple={true}
                    />
                </div>
            </FlexStory>
        );
    },
};
