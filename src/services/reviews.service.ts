import { supabase } from '../lib/supabase';
import { Review as ReviewType } from '../types/review';

export const reviewsService = {
  async getReviewsForTarget(targetId: string): Promise<ReviewType[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:reviewer_id (
          full_name,
          avatar_url
        )
      `)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data as any[]).map(r => ({
      id: r.id,
      reviewerId: r.reviewer_id,
      reviewerName: r.profiles?.full_name || 'Anonymous',
      reviewerAvatar: r.profiles?.avatar_url || '',
      reviewerRole: r.target_role === 'employer' ? 'candidate' : 'employer', // Simplification
      targetId: r.target_id,
      targetRole: r.target_role,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at
    }));
  },

  async submitReview(review: {
    reviewer_id: string;
    target_id: string;
    target_role: 'candidate' | 'employer';
    rating: number;
    comment: string;
  }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getAverageRating(targetId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', targetId);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / data.length;
  }
};
