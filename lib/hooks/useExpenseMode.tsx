'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ExpenseGroup, UserPreferences } from '@/types/group';
import { userPreferencesService } from '@/lib/user-preferences';
import { groupStorageService } from '@/lib/group-storage';

interface ExpenseModeContextType {
    mode: 'individual' | 'group';
    activeGroup: ExpenseGroup | null;
    groups: ExpenseGroup[];
    loading: boolean;
    setMode: (mode: 'individual' | 'group', groupId?: string) => Promise<void>;
    setActiveGroup: (group: ExpenseGroup | null) => Promise<void>;
    refreshGroups: () => Promise<void>;
}

const ExpenseModeContext = createContext<ExpenseModeContextType | undefined>(undefined);

interface ExpenseModeProviderProps {
    children: React.ReactNode;
    userId: string | null;
}

export function ExpenseModeProvider({ children, userId }: ExpenseModeProviderProps) {
    const [mode, setModeState] = useState<'individual' | 'group'>('individual');
    const [activeGroup, setActiveGroupState] = useState<ExpenseGroup | null>(null);
    const [groups, setGroups] = useState<ExpenseGroup[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial preferences and groups
    useEffect(() => {
        const loadData = async () => {
            if (!userId) {
                setModeState('individual');
                setActiveGroupState(null);
                setGroups([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Load preferences
                const prefs = await userPreferencesService.getPreferences(userId);
                setModeState(prefs.expenseMode);

                // Load groups
                const userGroups = await groupStorageService.getGroups(userId);
                setGroups(userGroups);

                // If in group mode, find and set active group
                if (prefs.expenseMode === 'group' && prefs.lastGroupId) {
                    const activeGrp = userGroups.find(g => g.id === prefs.lastGroupId);
                    if (activeGrp) {
                        setActiveGroupState(activeGrp);
                    } else if (userGroups.length > 0) {
                        // Fallback to first group if last group not found
                        setActiveGroupState(userGroups[0]);
                    } else {
                        // No groups, switch to individual mode
                        setModeState('individual');
                    }
                }
            } catch (error) {
                console.error('Error loading expense mode data:', error);
            }
            setLoading(false);
        };

        loadData();
    }, [userId]);

    const setMode = useCallback(async (newMode: 'individual' | 'group', groupId?: string) => {
        if (!userId) return;

        setModeState(newMode);

        // If switching to group mode and no active group, don't proceed
        if (newMode === 'group' && !groupId && !activeGroup && groups.length > 0) {
            // Auto-select first group
            const firstGroup = groups[0];
            setActiveGroupState(firstGroup);
            await userPreferencesService.setExpenseMode(userId, newMode, firstGroup.id);
        } else if (newMode === 'group' && groupId) {
            const group = groups.find(g => g.id === groupId);
            if (group) {
                setActiveGroupState(group);
            }
            await userPreferencesService.setExpenseMode(userId, newMode, groupId);
        } else if (newMode === 'individual') {
            setActiveGroupState(null);
            await userPreferencesService.setExpenseMode(userId, newMode);
        }
    }, [userId, activeGroup, groups]);

    const setActiveGroup = useCallback(async (group: ExpenseGroup | null) => {
        if (!userId) return;

        setActiveGroupState(group);
        if (group) {
            setModeState('group');
            await userPreferencesService.setExpenseMode(userId, 'group', group.id);
        }
    }, [userId]);

    const refreshGroups = useCallback(async () => {
        if (!userId) return;

        const userGroups = await groupStorageService.getGroups(userId);
        setGroups(userGroups);

        // Update active group reference if it exists
        if (activeGroup) {
            const updated = userGroups.find(g => g.id === activeGroup.id);
            if (updated) {
                setActiveGroupState(updated);
            } else {
                // Active group was deleted, switch to individual mode
                setActiveGroupState(null);
                setModeState('individual');
            }
        }
    }, [userId, activeGroup]);

    const value = {
        mode,
        activeGroup,
        groups,
        loading,
        setMode,
        setActiveGroup,
        refreshGroups,
    };

    return (
        <ExpenseModeContext.Provider value={value}>
            {children}
        </ExpenseModeContext.Provider>
    );
}

export function useExpenseMode() {
    const context = useContext(ExpenseModeContext);
    if (context === undefined) {
        throw new Error('useExpenseMode must be used within an ExpenseModeProvider');
    }
    return context;
}
