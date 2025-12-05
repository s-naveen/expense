'use client';

import { useState, useCallback } from 'react';
import { ExpenseGroup, ExpenseGroupMember } from '@/types/group';
import { groupStorageService } from '@/lib/group-storage';

export function useGroups(userId: string | null) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGroup = useCallback(async (name: string, description?: string): Promise<ExpenseGroup | null> => {
        if (!userId) return null;

        setLoading(true);
        setError(null);

        try {
            const group = await groupStorageService.createGroup(userId, name, description);
            if (!group) {
                setError('Failed to create group');
            }
            return group;
        } catch (err) {
            setError('Failed to create group');
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateGroup = useCallback(async (
        groupId: string,
        updates: Partial<Pick<ExpenseGroup, 'name' | 'description'>>
    ): Promise<ExpenseGroup | null> => {
        setLoading(true);
        setError(null);

        try {
            const group = await groupStorageService.updateGroup(groupId, updates);
            if (!group) {
                setError('Failed to update group');
            }
            return group;
        } catch (err) {
            setError('Failed to update group');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteGroup = useCallback(async (groupId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await groupStorageService.deleteGroup(groupId);
            if (!success) {
                setError('Failed to delete group');
            }
            return success;
        } catch (err) {
            setError('Failed to delete group');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getGroupMembers = useCallback(async (groupId: string): Promise<ExpenseGroupMember[]> => {
        try {
            return await groupStorageService.getGroupMembers(groupId);
        } catch (err) {
            console.error('Failed to get group members:', err);
            return [];
        }
    }, []);

    const addMember = useCallback(async (groupId: string, email: string): Promise<ExpenseGroupMember | null> => {
        setLoading(true);
        setError(null);

        try {
            const member = await groupStorageService.addMember(groupId, email);
            if (!member) {
                setError('Failed to add member. They may already be in the group.');
            }
            return member;
        } catch (err) {
            setError('Failed to add member');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeMember = useCallback(async (groupId: string, memberId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await groupStorageService.removeMember(groupId, memberId);
            if (!success) {
                setError('Failed to remove member');
            }
            return success;
        } catch (err) {
            setError('Failed to remove member');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const acceptInvitation = useCallback(async (groupId: string): Promise<boolean> => {
        if (!userId) return false;

        setLoading(true);
        setError(null);

        try {
            const success = await groupStorageService.acceptInvitation(userId, groupId);
            if (!success) {
                setError('Failed to accept invitation');
            }
            return success;
        } catch (err) {
            setError('Failed to accept invitation');
            return false;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return {
        loading,
        error,
        createGroup,
        updateGroup,
        deleteGroup,
        getGroupMembers,
        addMember,
        removeMember,
        acceptInvitation,
        clearError: () => setError(null),
    };
}
