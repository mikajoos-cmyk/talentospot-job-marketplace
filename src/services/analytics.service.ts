import { supabase } from '../lib/supabase';

export interface ProfileViewStat {
    day: string;
    views: number;
}

export interface DetailedProfileView {
    id: string;
    viewer_id: string;
    created_at: string;
    employer_profiles?: {
        id: string;
        company_name: string;
        logo_url: string;
    } | null;
    candidate_profiles?: {
        id: string;
        title: string;
        profiles: {
            full_name: string;
            avatar_url: string;
        } | null;
    } | null;
}

export const analyticsService = {
    /**
     * Records a profile view.
     * If a view for this viewer and viewed profile already exists, it will do nothing (due to unique constraint).
     */
    async recordView(viewerId: string, viewedId: string, viewedRole: 'candidate' | 'employer') {
        console.log(`[Analytics] Attempting to record view: from ${viewerId} to ${viewedId} (${viewedRole})`);

        if (!viewerId || !viewedId) {
            console.warn('[Analytics] Missing viewerId or viewedId, skipping');
            return;
        }

        if (viewerId === viewedId) return; // Don't count self-views

        const { error } = await supabase
            .from('profile_views')
            .insert({
                viewer_id: viewerId,
                viewed_id: viewedId,
                viewed_role: viewedRole
            });

        if (error) {
            if (error.code === '23505') {
                console.log('[Analytics] Profile view already recorded, skipping.');
            } else {
                console.error('[Analytics] Error recording profile view:', error);
            }
        } else {
            console.log('[Analytics] Profile view recorded successfully');
        }
    },

    /**
     * Fetches view statistics for the last 14 days.
     */
    async getViewStats(userId: string): Promise<ProfileViewStat[]> {
        const { data, error } = await supabase
            .from('profile_views')
            .select('created_at')
            .eq('viewed_id', userId)
            .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            console.error('Error fetching view stats:', error);
            return [];
        }

        // Process data to group by day
        const statsMap: Record<string, number> = {};

        // Initialize last 14 days with 0
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
            statsMap[dayLabel] = 0;
        }

        data.forEach(view => {
            const date = new Date(view.created_at);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (statsMap[dayLabel] !== undefined) {
                statsMap[dayLabel]++;
            }
        });

        return Object.entries(statsMap).map(([day, views]) => ({
            day,
            views
        }));
    },

    /**
     * Gets the total unique profile views.
     */
    async getTotalViews(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('profile_views')
            .select('*', { count: 'exact', head: true })
            .eq('viewed_id', userId);

        if (error) {
            console.error('Error fetching total views:', error);
            return 0;
        }

        return count || 0;
    },

    /**
     * Gets detailed profile views with employer or candidate information.
     */
    async getDetailedViews(userId: string): Promise<DetailedProfileView[]> {
        // 1) Hole zunächst die Views (ohne Join)
        const { data: views, error: viewsError } = await supabase
            .from('profile_views')
            .select('id, viewer_id, created_at')
            .eq('viewed_id', userId)
            .order('created_at', { ascending: false });

        if (viewsError) {
            console.error('Error fetching detailed views:', viewsError);
            return [];
        }

        const safeViews = views || [];
        if (safeViews.length === 0) return [];

        const viewerIds = Array.from(new Set(safeViews.map(v => v.viewer_id).filter(Boolean)));
        if (viewerIds.length === 0) {
            return safeViews.map(v => ({
                id: v.id,
                viewer_id: v.viewer_id,
                created_at: v.created_at
            })) as DetailedProfileView[];
        }

        // 2) Sowohl Employer als auch Candidate Profile laden
        const [empRes, candRes] = await Promise.all([
            supabase
                .from('employer_profiles')
                .select('id, company_name, logo_url')
                .in('id', viewerIds),
            supabase
                .from('candidate_profiles')
                .select('id, title, profiles(full_name, avatar_url)')
                .in('id', viewerIds)
        ]);

        const employersById = new Map<string, any>();
        (empRes.data || []).forEach((e: any) => {
            if (e && e.id) employersById.set(e.id, e);
        });

        const candidatesById = new Map<string, any>();
        (candRes.data || []).forEach((c: any) => {
            if (c && c.id) candidatesById.set(c.id, c);
        });

        // 3) Zusammensetzen
        return safeViews.map(v => ({
            id: v.id,
            viewer_id: v.viewer_id,
            created_at: v.created_at,
            employer_profiles: employersById.get(v.viewer_id) || null,
            candidate_profiles: candidatesById.get(v.viewer_id) || null
        })) as DetailedProfileView[];
    }
};
