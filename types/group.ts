// Group types for shared expense tracking

export interface ExpenseGroup {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseGroupMember {
    id: string;
    groupId: string;
    userId: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    invitedAt: string;
    joinedAt?: string;
    status: 'pending' | 'active' | 'declined';
}

export interface UserPreferences {
    id: string;
    userId: string;
    expenseMode: 'individual' | 'group';
    lastGroupId?: string;
    createdAt: string;
    updatedAt: string;
}

// Database types (snake_case)
export interface DatabaseExpenseGroup {
    id: string;
    name: string;
    description?: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface DatabaseExpenseGroupMember {
    id: string;
    group_id: string;
    user_id: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    invited_at: string;
    joined_at?: string | null;
    status: 'pending' | 'active' | 'declined';
}

export interface DatabaseUserPreferences {
    id: string;
    user_id: string;
    expense_mode: 'individual' | 'group';
    last_group_id?: string | null;
    created_at: string;
    updated_at: string;
}

// Converter functions
export function fromDatabaseGroup(db: DatabaseExpenseGroup): ExpenseGroup {
    return {
        id: db.id,
        name: db.name,
        description: db.description || undefined,
        ownerId: db.owner_id,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}

export function toDatabaseGroup(group: Partial<ExpenseGroup>, ownerId: string): Partial<DatabaseExpenseGroup> {
    return {
        id: group.id,
        name: group.name,
        description: group.description || null,
        owner_id: ownerId,
    };
}

export function fromDatabaseMember(db: DatabaseExpenseGroupMember): ExpenseGroupMember {
    return {
        id: db.id,
        groupId: db.group_id,
        userId: db.user_id,
        email: db.email,
        role: db.role,
        invitedAt: db.invited_at,
        joinedAt: db.joined_at || undefined,
        status: db.status,
    };
}

export function fromDatabasePreferences(db: DatabaseUserPreferences): UserPreferences {
    return {
        id: db.id,
        userId: db.user_id,
        expenseMode: db.expense_mode,
        lastGroupId: db.last_group_id || undefined,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}
