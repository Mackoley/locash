import { supabase, isSupabaseConfigured } from './supabase';
import { ChatMessage } from '../types';

export const chatService = {
  // Fetch chat messages
  async getMessages(): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Erro ao buscar mensagens do chat:', error.message);
        return [];
      }

      return data.map((item: any): ChatMessage => ({
        id: item.id,
        leaseId: item.lease_id || 'lease-1',
        senderId: item.sender_id,
        senderName: item.sender_name,
        senderRole: item.sender_role,
        message: item.text || item.message,
        timestamp: item.created_at || item.timestamp,
        attachmentUrl: item.attachment_url,
        tabCategory: item.tab_category || 'CONVERSA'
      }));
    } catch (err) {
      console.error('Falha ao obter mensagens:', err);
      return [];
    }
  },

  // Send message
  async sendMessage(message: ChatMessage): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('chat_messages')
        .insert([{
          id: message.id,
          lease_id: message.leaseId,
          sender_id: message.senderId,
          sender_name: message.senderName,
          sender_role: message.senderRole,
          text: message.message,
          message: message.message,
          created_at: message.timestamp,
          attachment_url: message.attachmentUrl,
          tab_category: message.tabCategory
        }]);
    } catch (err) {
      console.error('Erro ao enviar mensagem no Supabase:', err);
    }
  },

  // Subscribe to real-time chat
  subscribeToChat(onNewMessage: (msg: ChatMessage) => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          const item = payload.new;
          onNewMessage({
            id: item.id,
            leaseId: item.lease_id || 'lease-1',
            senderId: item.sender_id,
            senderName: item.sender_name,
            senderRole: item.sender_role,
            message: item.text || item.message,
            timestamp: item.created_at || item.timestamp,
            attachmentUrl: item.attachment_url,
            tabCategory: item.tab_category || 'CONVERSA'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
