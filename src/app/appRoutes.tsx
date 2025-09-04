import { RouteObject } from "react-router-dom";
import { AppRoot } from "src/app/AppRoot.tsx";
import { ErrorPage } from "src/ui/components/pages/ErrorPage/ErrorPage.tsx";
import { HomePage } from "src/features/home";

export const appRoutes: RouteObject[] = [
    {
        path: "/",
        errorElement: <ErrorPage />,
        element: <AppRoot />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
        ],
    },
];
