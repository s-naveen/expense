'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Users, X } from 'lucide-react';
import { groupStorageService } from '@/lib/group-storage';
import { ExpenseGroupMember } from '@/types/group';

interface InvitationWithGroup extends ExpenseGroupMember {
    groupName: string;
}

interface PendingInvitationsProps {
    userEmail: string;
    userId: string;
    onAccept: () => void;
}

export default function PendingInvitations({ userEmail, userId, onAccept }: PendingInvitationsProps) {
    const [invitations, setInvitations] = useState<InvitationWithGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const loadInvitations = async () => {
            const pending = await groupStorageService.getPendingInvitationsWithGroups(userEmail);
            setInvitations(pending);
            setLoading(false);
        };
        loadInvitations();
    }, [userEmail]);

    const handleAccept = async (invitation: InvitationWithGroup) => {
        setProcessing(invitation.id);
        const success = await groupStorageService.acceptInvitation(userId, invitation.groupId);
        if (success) {
            setInvitations(invitations.filter(i => i.id !== invitation.id));
            onAccept();
        }
        setProcessing(null);
    };

    const handleDecline = (invitationId: string) => {
        // For now, just hide it locally - could add a decline API later
        setInvitations(invitations.filter(i => i.id !== invitationId));
    };

    if (loading || invitations.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/40 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                    <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Group Invitations
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        You have been invited to join {invitations.length} group{invitations.length > 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {invitations.map(invitation => (
                    <div
                        key={invitation.id}
                        className="flex items-center justify-between rounded-lg bg-white/80 dark:bg-background/80 p-3 border border-amber-100 dark:border-amber-900/30"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{invitation.groupName}</p>
                                <p className="text-xs text-muted-foreground">
                                    Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDecline(invitation.id)}
                                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleAccept(invitation)}
                                disabled={processing === invitation.id}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {processing === invitation.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Accept
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
