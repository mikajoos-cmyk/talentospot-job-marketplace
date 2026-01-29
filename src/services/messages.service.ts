import { supabase } from '../lib/supabase';

export const messagesService = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant_1_fkey(
          id,
          full_name,
          avatar_url,
          role,
          employer_profiles(company_name, logo_url, contact_person)
        ),
        participant2:profiles!conversations_participant_2_fkey(
          id,
          full_name,
          avatar_url,
          role,
          employer_profiles(company_name, logo_url, contact_person)
        )
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Add unread count to each conversation
    const conversationsWithUnread = await Promise.all(
      (data || []).map(async (conv) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        return {
          ...conv,
          unread_count: count || 0
        };
      })
    );

    return conversationsWithUnread;
  },

  async getOrCreateConversation(participant1: string, participant2: string) {
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: participant1,
        participant_2: participant2,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string, fileUrl?: string, fileType?: string, fileName?: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        file_url: fileUrl,
        file_type: fileType,
        file_name: fileName,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation with last message info
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_content: content
      })
      .eq('id', conversationId);

    return data;
  },

  async markMessageAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

    if (!conversations) return 0;

    const conversationIds = conversations.map(c => c.id);

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAllAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },
};
