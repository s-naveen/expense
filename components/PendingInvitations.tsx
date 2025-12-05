'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { groupStorageService } from '@/lib/group-storage';
import { ExpenseGroupMember } from '@/types/group';

interface PendingInvitationsProps {
    userEmail: string;
    userId: string;
    onAccept: () => void;
}

export default function PendingInvitations({ userEmail, userId, onAccept }: PendingInvitationsProps) {
    const [invitations, setInvitations] = useState<ExpenseGroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const loadInvitations = async () => {
            const pending = await groupStorageService.getPendingInvitations(userEmail);
            setInvitations(pending);
            setLoading(false);
        };
        loadInvitations();
    }, [userEmail]);

    const handleAccept = async (invitation: ExpenseGroupMember) => {
        setProcessing(invitation.id);
        const success = await groupStorageService.acceptInvitation(userId, invitation.groupId);
        if (success) {
            setInvitations(invitations.filter(i => i.id !== invitation.id));
            onAccept();
        }
        setProcessing(null);
    };

    if (loading || invitations.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Pending Group Invitations
                </span>
            </div>
            <div className="space-y-2">
                {invitations.map(invitation => (
                    <div
                        key={invitation.id}
                        className="flex items-center justify-between rounded-md bg-white dark:bg-background p-2 border"
                    >
                        <span className="text-sm">Group invitation</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleAccept(invitation)}
                                disabled={processing === invitation.id}
                                className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors disabled:opacity-50"
                                title="Accept invitation"
                            >
                                {processing === invitation.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
