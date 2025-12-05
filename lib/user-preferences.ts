import { createClient } from '@/lib/supabase/client';
import {
    UserPreferences,
    DatabaseUserPreferences,
    fromDatabasePreferences,
} from '@/types/group';

export const userPreferencesService = {
    // Get user preferences (creates default if not exists)
    getPreferences: async (userId: string): Promise<UserPreferences> => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // No preferences found, create default
                const { data: newData, error: insertError } = await supabase
                    .from('user_preferences')
                    .insert([
                        {
                            user_id: userId,
                            expense_mode: 'individual',
                        },
                    ])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating preferences:', insertError);
                    // Return default preferences
                    return {
                        id: '',
                        userId,
                        expenseMode: 'individual',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                }

                return fromDatabasePreferences(newData as DatabaseUserPreferences);
            }

            if (error) {
                console.error('Error fetching preferences:', error);
                // Return default preferences
                return {
                    id: '',
                    userId,
                    expenseMode: 'individual',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }

            return fromDatabasePreferences(data as DatabaseUserPreferences);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return {
                id: '',
                userId,
                expenseMode: 'individual',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }
    },

    // Set expense mode (individual or group)
    setExpenseMode: async (
        userId: string,
        mode: 'individual' | 'group',
        lastGroupId?: string
    ): Promise<boolean> => {
        try {
            const supabase = createClient();

            // Try to update existing preferences
            const { data, error } = await supabase
                .from('user_preferences')
                .update({
                    expense_mode: mode,
                    last_group_id: lastGroupId || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error && error.code === 'PGRST116') {
                // No preferences found, create new
                const { error: insertError } = await supabase
                    .from('user_preferences')
                    .insert([
                        {
                            user_id: userId,
                            expense_mode: mode,
                            last_group_id: lastGroupId || null,
                        },
                    ]);

                if (insertError) {
                    console.error('Error creating preferences:', insertError);
                    return false;
                }

                return true;
            }

            if (error) {
                console.error('Error updating expense mode:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating expense mode:', error);
            return false;
        }
    },

    // Set active group
    setActiveGroup: async (userId: string, groupId: string | null): Promise<boolean> => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('user_preferences')
                .update({
                    last_group_id: groupId,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error setting active group:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error setting active group:', error);
            return false;
        }
    },
};
