import { createClient } from '@/lib/supabase/client';
import {
    ExpenseGroup,
    ExpenseGroupMember,
    DatabaseExpenseGroup,
    DatabaseExpenseGroupMember,
    fromDatabaseGroup,
    fromDatabaseMember,
    toDatabaseGroup,
} from '@/types/group';

export const groupStorageService = {
    // Get all groups the user belongs to (as owner or member)
    getGroups: async (userId: string): Promise<ExpenseGroup[]> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching groups:', error);
                return [];
            }

            return (data as DatabaseExpenseGroup[])?.map(fromDatabaseGroup) || [];
        } catch (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
    },

    // Get a single group by ID
    getGroup: async (groupId: string): Promise<ExpenseGroup | null> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (error) {
                console.error('Error fetching group:', error);
                return null;
            }

            return fromDatabaseGroup(data as DatabaseExpenseGroup);
        } catch (error) {
            console.error('Error fetching group:', error);
            return null;
        }
    },

    // Create a new group
    createGroup: async (
        userId: string,
        name: string,
        description?: string
    ): Promise<ExpenseGroup | null> => {
        try {
            const supabase = createClient();
            const dbGroup = toDatabaseGroup({ name, description }, userId);

            const { data, error } = await supabase
                .from('expense_groups')
                .insert([dbGroup])
                .select()
                .single();

            if (error) {
                console.error('Error creating group:', error);
                return null;
            }

            const group = fromDatabaseGroup(data as DatabaseExpenseGroup);

            // Get user's email for member record
            const { data: userData } = await supabase.auth.getUser();
            const userEmail = userData?.user?.email || '';

            // Add owner as a member with 'owner' role
            await supabase.from('expense_group_members').insert([
                {
                    group_id: group.id,
                    user_id: userId,
                    email: userEmail,
                    role: 'owner',
                    status: 'active',
                    joined_at: new Date().toISOString(),
                },
            ]);

            return group;
        } catch (error) {
            console.error('Error creating group:', error);
            return null;
        }
    },

    // Update a group
    updateGroup: async (
        groupId: string,
        updates: Partial<Pick<ExpenseGroup, 'name' | 'description'>>
    ): Promise<ExpenseGroup | null> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_groups')
                .update({
                    name: updates.name,
                    description: updates.description,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', groupId)
                .select()
                .single();

            if (error) {
                console.error('Error updating group:', error);
                return null;
            }

            return fromDatabaseGroup(data as DatabaseExpenseGroup);
        } catch (error) {
            console.error('Error updating group:', error);
            return null;
        }
    },

    // Delete a group
    deleteGroup: async (groupId: string): Promise<boolean> => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('expense_groups')
                .delete()
                .eq('id', groupId);

            if (error) {
                console.error('Error deleting group:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting group:', error);
            return false;
        }
    },

    // Get members of a group
    getGroupMembers: async (groupId: string): Promise<ExpenseGroupMember[]> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_group_members')
                .select('*')
                .eq('group_id', groupId)
                .order('invited_at', { ascending: true });

            if (error) {
                console.error('Error fetching group members:', error);
                return [];
            }

            return (data as DatabaseExpenseGroupMember[])?.map(fromDatabaseMember) || [];
        } catch (error) {
            console.error('Error fetching group members:', error);
            return [];
        }
    },

    // Add a member to a group by email
    addMember: async (
        groupId: string,
        email: string
    ): Promise<ExpenseGroupMember | null> => {
        try {
            const supabase = createClient();

            // Check if member already exists in this group
            const { data: existing } = await supabase
                .from('expense_group_members')
                .select('*')
                .eq('group_id', groupId)
                .eq('email', email.toLowerCase())
                .maybeSingle();

            if (existing) {
                console.error('Member already exists in group');
                return null;
            }

            // Add as pending invite - user_id will be set when they accept
            const { data, error } = await supabase
                .from('expense_group_members')
                .insert([
                    {
                        group_id: groupId,
                        // user_id is null until they accept the invite
                        email: email.toLowerCase(),
                        role: 'member',
                        status: 'pending',
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error('Error adding member:', error);
                return null;
            }

            return fromDatabaseMember(data as DatabaseExpenseGroupMember);
        } catch (error) {
            console.error('Error adding member:', error);
            return null;
        }
    },

    // Remove a member from a group
    removeMember: async (groupId: string, memberId: string): Promise<boolean> => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('expense_group_members')
                .delete()
                .eq('id', memberId)
                .eq('group_id', groupId);

            if (error) {
                console.error('Error removing member:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error removing member:', error);
            return false;
        }
    },

    // Update member role
    updateMemberRole: async (
        memberId: string,
        role: 'admin' | 'member'
    ): Promise<boolean> => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('expense_group_members')
                .update({ role })
                .eq('id', memberId);

            if (error) {
                console.error('Error updating member role:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating member role:', error);
            return false;
        }
    },

    // Accept group invitation (for current user)
    acceptInvitation: async (userId: string, groupId: string): Promise<boolean> => {
        try {
            const supabase = createClient();

            // Get user's email
            const { data: userData } = await supabase.auth.getUser();
            const userEmail = userData?.user?.email?.toLowerCase();

            if (!userEmail) return false;

            const { error } = await supabase
                .from('expense_group_members')
                .update({
                    user_id: userId,
                    status: 'active',
                    joined_at: new Date().toISOString(),
                })
                .eq('group_id', groupId)
                .eq('email', userEmail);

            if (error) {
                console.error('Error accepting invitation:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return false;
        }
    },

    // Get pending invitations for current user with group details
    getPendingInvitationsWithGroups: async (userEmail: string): Promise<Array<ExpenseGroupMember & { groupName: string }>> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_group_members')
                .select(`
                    *,
                    expense_groups!inner (
                        name
                    )
                `)
                .eq('email', userEmail.toLowerCase())
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching pending invitations:', error);
                return [];
            }

            return (data || []).map((item: DatabaseExpenseGroupMember & { expense_groups: { name: string } }) => ({
                ...fromDatabaseMember(item),
                groupName: item.expense_groups?.name || 'Unknown Group',
            }));
        } catch (error) {
            console.error('Error fetching pending invitations:', error);
            return [];
        }
    },

    // Get pending invitations for current user (legacy)
    getPendingInvitations: async (userEmail: string): Promise<ExpenseGroupMember[]> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('expense_group_members')
                .select('*')
                .eq('email', userEmail.toLowerCase())
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching pending invitations:', error);
                return [];
            }

            return (data as DatabaseExpenseGroupMember[])?.map(fromDatabaseMember) || [];
        } catch (error) {
            console.error('Error fetching pending invitations:', error);
            return [];
        }
    },
};
