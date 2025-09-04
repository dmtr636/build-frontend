import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "src/app/appRoutes.tsx";
import "src/ui/styles/index.scss";
import { LoadingScreen } from "src/ui/components/segments/LoadingScreen/LoadingScreen.tsx";
import { Suspense } from "react";

const router = createBrowserRouter(appRoutes);

export const App = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
        </Suspense>
    );
};
