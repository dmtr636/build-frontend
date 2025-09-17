import { Navigate, RouteObject } from "react-router-dom";
import { AppRoot } from "src/app/AppRoot.tsx";
import { ErrorPage } from "src/ui/components/pages/ErrorPage/ErrorPage.tsx";
import { HomePage } from "src/features/home";
import { JournalPage } from "src/features/journal";
import { UsersPage } from "src/features/users";
import { LoginPageWrapper } from "src/features/auth/LoginPageWrapper.tsx";
import { EventsPage } from "src/features/events/EventsPage";
import { OrganizationsPage } from "src/features/organizations/OrganizationsPage.tsx";
import UserPage from "src/features/users/pages/UserPage/UserPage.tsx";

export const appRoutes: RouteObject[] = [
    {
        path: "/auth/login",
        errorElement: <ErrorPage />,
        element: <LoginPageWrapper />,
    },
    {
        path: "/",
        errorElement: <ErrorPage />,
        element: <AppRoot />,
        children: [
            {
                path: "/admin",
                element: <Navigate to={"/admin/home"} replace={true} />,
            },
            {
                path: "/admin/home",
                element: <HomePage />,
            },
            {
                path: "/admin/journal",
                element: <JournalPage />,
            },
            {
                path: "/admin/users",
                element: <UsersPage />,
            },
            {
                path: "/admin/users/:id",
                element: <UserPage />,
            },
            {
                path: "/admin/events",
                element: <EventsPage />,
            },
            {
                path: "/admin/organizations",
                element: <OrganizationsPage />,
            },
            {
                path: "/admin/organizations/:id",
                element: <OrganizationsPage />,
            },
        ],
    },
];
