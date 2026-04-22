import { UserRole } from "./enums";

export interface UserPayload {
    email?: string;
    password?: string;
    role?: UserRole;
    name?: string;
    mobile?: string;
    address?: string,
    branch_id?: string
}

export interface UserParams {
    page: number;
    limit: number;
    role?: UserRole;
    search?: string;
    sortBy?: 'created_at' | 'email';
    sortOrder?: 'ASC' | 'DESC';
}