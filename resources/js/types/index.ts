import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Team {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    projects_count?: number;
    users_count?: number;
    projects?: Project[];
    users?: (User & { pivot: { role: string } })[];
}

export interface Project {
    id: number;
    name: string;
    team_id: number;
    created_at: string;
    updated_at: string;
    tasks_count?: number;
    tasks?: Task[];
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
    project_id: number;
    user_id: number | null;
    created_at: string;
    updated_at: string;
    user?: User;
}

// Extend the Inertia PageProps
declare module '@inertiajs/react' {
    export interface PageProps {
        flash: {
            success?: string;
            error?: string;
            warning?: string;
        };
        auth: {
            user: User;
        };
        errors: Record<string, string>;
    }
}

// Global type for Laravel data
declare global {
    interface Window {
        Laravel: {
            user: User;
            csrfToken: string;
            route: (name: string, parameters?: any) => string;
        };
    }
}
