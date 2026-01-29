
import { supabase } from '../lib/supabase';

export const userActionsService = {
    async blockUser(blockerId: string, blockedId: string) {
        const { data, error } = await supabase
            .from('user_blocks')
            .insert({
                blocker_id: blockerId,
                blocked_id: blockedId
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                console.log('User already blocked');
                return; // Already blocked, treat as success
            }
            throw error;
        }
        return data;
    },

    async unblockUser(blockerId: string, blockedId: string) {
        const { error } = await supabase
            .from('user_blocks')
            .delete()
            .match({ blocker_id: blockerId, blocked_id: blockedId });

        if (error) throw error;
    },

    async isUserBlocked(blockerId: string, blockedId: string) {
        const { data, error } = await supabase
            .from('user_blocks')
            .select('id')
            .match({ blocker_id: blockerId, blocked_id: blockedId })
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    // Check if users are blocked in either direction (bidirectional)
    async areUsersBlocked(user1Id: string, user2Id: string) {
        const { data, error } = await supabase
            .from('user_blocks')
            .select('id, blocker_id')
            .or(`and(blocker_id.eq.${user1Id},blocked_id.eq.${user2Id}),and(blocker_id.eq.${user2Id},blocked_id.eq.${user1Id})`)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return {
            isBlocked: !!data,
            blockedByMe: data?.blocker_id === user1Id
        };
    },

    async reportUser(reporterId: string, reportedId: string, reason: string) {
        const { data, error } = await supabase
            .from('user_reports')
            .insert({
                reporter_id: reporterId,
                reported_id: reportedId,
                reason: reason,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
