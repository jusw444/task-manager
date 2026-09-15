export interface User {
    id: number;
    name: string;
    email: string;
}

export interface TeamMember extends User {
    pivot: {
        role: 'admin' | 'member';
        created_at: string;
        updated_at: string;
    };
}

export interface Team {
    id: number;
    name: string;
    user_id: number; // Owner's ID
    created_at: string;
    updated_at: string;
    
    // These come from withCount() in the controller
    projects_count?: number;
    users_count?: number;
    
    // These come from with() in the controller
    owner?: User;
    users?: TeamMember[];
    projects?: Project[];
}

export interface Project {
    id: number;
    name: string;
    team_id: number;
    created_at: string;
    updated_at: string;
    
    tasks?: Task[];
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
    project_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    
    user?: User;
    project?: Project;
}

// Type for the props passed to the Index page
export interface TeamIndexProps {
    teams: Team[];
}

// Type for the props passed to the Show page
export interface TeamShowProps {
    team: Team;
    userRole: 'admin' | 'member' | null;
    canManage: boolean;
    isOwner: boolean;
}

// Type for form data
export type TeamFormData = {
    name: string;
}

// Type guard to check if a user has a role
export type TeamRole = 'admin' | 'member';

// Helper type for paginated responses (for future use)
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface AvailableUser {
    id: number;
    name: string;
    email: string;
}

export type AddMemberFormData = {
    user_id: number | null;
    role: TeamRole;
}

export interface ChangeRoleFormData {
    role: TeamRole;
}