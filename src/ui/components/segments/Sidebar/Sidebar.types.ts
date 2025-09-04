import React, { ReactNode } from "react";

export interface SidebarRoute {
    name: string;
    path: string;
    end?: boolean;
    icon?: ReactNode;
    counterValue?: number;
    onClick?: (event: React.MouseEvent) => void;
    disabled?: boolean;
    children?: SidebarChildRoute[];
    brand?: boolean;
}

export interface SidebarChildRoute {
    name: string;
    path: string;
    counterValue?: number;
    onClick?: (event: React.MouseEvent) => void;
    disabled?: boolean;
}
