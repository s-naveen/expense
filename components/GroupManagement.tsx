'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, UserPlus, Users, Crown, Shield, User, Check, Clock } from 'lucide-react';
import Modal from './Modal';
import { useGroups } from '@/lib/hooks/useGroups';
import { useExpenseMode } from '@/lib/hooks/useExpenseMode';
import { ExpenseGroup, ExpenseGroupMember } from '@/types/group';

interface GroupManagementProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

export default function GroupManagement({ open, onClose, userId }: GroupManagementProps) {
    const { groups, activeGroup, refreshGroups, setActiveGroup } = useExpenseMode();
    const {
        loading,
        error,
        createGroup,
        updateGroup,
        deleteGroup,
        getGroupMembers,
        addMember,
        removeMember,
        clearError
    } = useGroups(userId);

    const [view, setView] = useState<'list' | 'create' | 'details'>('list');
    const [selectedGroup, setSelectedGroup] = useState<ExpenseGroup | null>(null);
    const [members, setMembers] = useState<ExpenseGroupMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Form states
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setView('list');
            setSelectedGroup(null);
            setMembers([]);
            setNewGroupName('');
            setNewGroupDesc('');
            setNewMemberEmail('');
            clearError();
        }
    }, [open, clearError]);

    // Load members when viewing group details
    useEffect(() => {
        const loadMembers = async () => {
            if (selectedGroup && view === 'details') {
                setLoadingMembers(true);
                const groupMembers = await getGroupMembers(selectedGroup.id);
                setMembers(groupMembers);
                setLoadingMembers(false);
            }
        };
        loadMembers();
    }, [selectedGroup, view, getGroupMembers]);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        const group = await createGroup(newGroupName.trim(), newGroupDesc.trim() || undefined);
        if (group) {
            await refreshGroups();
            setNewGroupName('');
            setNewGroupDesc('');
            setView('list');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this group? All group expenses will become individual expenses.')) {
            return;
        }

        const success = await deleteGroup(groupId);
        if (success) {
            await refreshGroups();
            if (selectedGroup?.id === groupId) {
                setSelectedGroup(null);
                setView('list');
            }
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup || !newMemberEmail.trim()) return;

        const member = await addMember(selectedGroup.id, newMemberEmail.trim());
        if (member) {
            setMembers([...members, member]);
            setNewMemberEmail('');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedGroup) return;
        if (!confirm('Are you sure you want to remove this member?')) return;

        const success = await removeMember(selectedGroup.id, memberId);
        if (success) {
            setMembers(members.filter(m => m.id !== memberId));
        }
    };

    const handleSelectGroup = async (group: ExpenseGroup) => {
        await setActiveGroup(group);
        onClose();
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="h-3.5 w-3.5 text-amber-500" />;
            case 'admin': return <Shield className="h-3.5 w-3.5 text-blue-500" />;
            default: return <User className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> Active
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Pending
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={view === 'create' ? 'Create New Group' : view === 'details' ? selectedGroup?.name || 'Group Details' : 'Manage Groups'}
            description={
                view === 'create'
                    ? 'Create a group to share expenses with others'
                    : view === 'details'
                        ? 'Manage group members and settings'
                        : 'Select or create expense groups'
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <>
                        <div className="space-y-2">
                            {groups.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                    <p className="mt-2 text-sm text-muted-foreground">No groups yet</p>
                                    <p className="text-xs text-muted-foreground">Create a group to share expenses with others</p>
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className={`
                      flex items-center justify-between rounded-lg border p-3 transition-colors
                      ${activeGroup?.id === group.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'}
                    `}
                                    >
                                        <button
                                            onClick={() => handleSelectGroup(group)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{group.name}</span>
                                                {activeGroup?.id === group.id && (
                                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Active</span>
                                                )}
                                            </div>
                                            {group.description && (
                                                <p className="mt-0.5 text-xs text-muted-foreground truncate">{group.description}</p>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    setView('details');
                                                }}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                                title="Group Settings"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
                                                title="Delete Group"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setView('create')}
                            className="btn-primary w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Group
                        </button>
                    </>
                )}

                {/* Create View */}
                {view === 'create' && (
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Group Name</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                placeholder="e.g., Family Expenses"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                placeholder="e.g., Shared household expenses"
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading || !newGroupName.trim()}
                            >
                                {loading ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Details View */}
                {view === 'details' && selectedGroup && (
                    <div className="space-y-4">
                        {/* Add Member Form */}
                        <form onSubmit={handleAddMember} className="flex gap-2">
                            <input
                                type="email"
                                className="input-field flex-1"
                                placeholder="Enter email to invite"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || !newMemberEmail.trim()}
                            >
                                <UserPlus className="h-4 w-4" />
                            </button>
                        </form>

                        {/* Members List */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                            {loadingMembers ? (
                                <div className="text-center py-4">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                                </div>
                            ) : members.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(member.role)}
                                            <div>
                                                <p className="text-sm font-medium">{member.email}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                                                    {getStatusBadge(member.status)}
                                                </div>
                                            </div>
                                        </div>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
                                                title="Remove Member"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedGroup(null);
                                setView('list');
                            }}
                            className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                        >
                            Back to Groups
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
