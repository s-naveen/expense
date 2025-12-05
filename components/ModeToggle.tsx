'use client';

import { useState } from 'react';
import { Users, User, ChevronDown, Settings, Plus } from 'lucide-react';
import { useExpenseMode } from '@/lib/hooks/useExpenseMode';
import { ExpenseGroup } from '@/types/group';

interface ModeToggleProps {
    onManageGroups: () => void;
}

export default function ModeToggle({ onManageGroups }: ModeToggleProps) {
    const { mode, activeGroup, groups, loading, setMode, setActiveGroup } = useExpenseMode();
    const [isOpen, setIsOpen] = useState(false);

    if (loading) {
        return (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-secondary" />
        );
    }

    const handleModeSwitch = async () => {
        if (mode === 'individual') {
            if (groups.length > 0) {
                await setMode('group', groups[0].id);
            } else {
                // No groups, open group management
                onManageGroups();
            }
        } else {
            await setMode('individual');
        }
    };

    const handleGroupSelect = async (group: ExpenseGroup) => {
        await setActiveGroup(group);
        setIsOpen(false);
    };

    return (
        <div className="relative flex items-center gap-2">
            {/* Mode Toggle Button */}
            <button
                onClick={handleModeSwitch}
                className={`
          flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
          ${mode === 'individual'
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'}
        `}
                title={mode === 'individual' ? 'Switch to Group Mode' : 'Switch to Individual Mode'}
            >
                {mode === 'individual' ? (
                    <>
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Individual</span>
                    </>
                ) : (
                    <>
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Group</span>
                    </>
                )}
            </button>

            {/* Group Selector (only visible in group mode) */}
            {mode === 'group' && groups.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                        <span className="max-w-[120px] truncate">{activeGroup?.name || 'Select Group'}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border bg-background shadow-lg">
                                <div className="max-h-60 overflow-y-auto p-1">
                                    {groups.map((group) => (
                                        <button
                                            key={group.id}
                                            onClick={() => handleGroupSelect(group)}
                                            className={`
                        w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors
                        ${group.id === activeGroup?.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-secondary'}
                      `}
                                        >
                                            <Users className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{group.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t p-1">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onManageGroups();
                                        }}
                                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Manage Groups
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Create Group Button (when no groups in group mode or individual mode with hint) */}
            {mode === 'individual' && groups.length === 0 && (
                <button
                    onClick={onManageGroups}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Create a group to share expenses"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Create Group</span>
                </button>
            )}
        </div>
    );
}
