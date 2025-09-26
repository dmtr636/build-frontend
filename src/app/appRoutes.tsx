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
import { RegistryPage } from "src/features/registry/pages";
import { RegulatoryDocuments } from "src/features/registry/pages/regulatoryDocuments";
import { Violations } from "src/features/registry/pages/violations";
import { Works } from "src/features/registry/pages/works";
import { ObjectPage } from "src/features/journal/pages/ObjectPage/ObjectPage.tsx";
import AboutObjectPage from "src/features/journal/pages/AboutObjectPage/AboutObjectPage.tsx";
import ObjectUsersPage from "src/features/journal/pages/ObjectUsersPage/ObjectUsersPage.tsx";
import { LocationPage } from "src/features/journal/pages/LocationPage/LocationPage.tsx";
import DocumentsObjectPage from "src/features/journal/pages/DocumentsObjectPage/DocumentsObjectPage.tsx";
import ViolationPage from "src/features/journal/pages/ViolationPage/ViolationPage.tsx";

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
                path: "/admin/journal/:id",
                element: <ObjectPage />,
                children: [
                    { index: true, element: <Navigate to="review" replace /> },
                    { path: "review", element: <></> },
                    { path: "about", element: <AboutObjectPage /> },
                    { path: "docs", element: <DocumentsObjectPage /> },
                    { path: "status", element: <></> },
                    { path: "location", element: <LocationPage /> },
                    { path: "users", element: <ObjectUsersPage /> },
                    { path: "materials", element: <></> },
                    { path: "visits", element: <></> },
                    { path: "violations", element: <ViolationPage></ViolationPage> },
                ],
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
            {
                path: "/admin/dictionaries",
                element: <RegistryPage />,
                children: [
                    {
                        index: true,
                        element: (
                            <Navigate
                                to={"/admin/dictionaries/normative-documents"}
                                replace={true}
                            />
                        ),
                    },
                    {
                        path: "/admin/dictionaries/normative-documents",
                        element: <RegulatoryDocuments />,
                    },
                    {
                        path: "/admin/dictionaries/construction-violations",
                        element: <Violations />,
                    },
                    {
                        path: "/admin/dictionaries/construction-works",
                        element: <Works />,
                    },
                ],
            },
        ],
    },
];
