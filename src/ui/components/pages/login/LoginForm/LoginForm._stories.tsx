// import type { Meta, StoryObj } from "@storybook/react";
//
// import { LoginForm } from "./LoginForm";
// import { FlexStory } from "src/ui/storybook/components/FlexStory/FlexStory.tsx";
// import React, { ChangeEvent } from "react";
// import { IconLogoPlaceholder } from "src/ui/assets/icons";
//
// const meta = {
//     title: "Yuigahama/LoginForm",
//     component: LoginForm,
//     parameters: {
//         layout: "centered",
//     },
//     args: {},
//     argTypes: {},
//     tags: ["autodocs"],
// } satisfies Meta<typeof LoginForm>;
//
// export default meta;
//
// type Story = StoryObj<typeof meta>;
//
// /* export const Default: Story = {};
//  */
//
// const getStoryForType = (): Story => ({
//     args: {
//         logo: <IconLogoPlaceholder />,
//     },
//     argTypes: {
//         logo: {
//             table: {
//                 disable: true,
//             },
//         },
//     },
//     render: () => {
//         return (
//             <FlexStory>
//                 <div style={{ width: "500px" }}>
//                     <LoginForm logo={<IconLogoPlaceholder />} />
//                 </div>
//             </FlexStory>
//         );
//     },
// });
//
// export const Primary: Story = getStoryForType();
