const supabase = require('./supabaseClient');

class DatabaseService {
    // User Settings Operations
    async getUserSettings(userId) {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error fetching user settings:', error);
            throw error;
        }
    }

    async upsertUserSettings(userId, settings) {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: userId,
                    ...settings,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error upserting user settings:', error);
            throw error;
        }
    }

    // Conversation Operations
    async createConversation(userId, title = 'New Conversation') {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .insert({
                    user_id: userId,
                    title: title
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    async getUserConversations(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('conversation_summaries')
                .select('*')
                .eq('user_id', userId)
                .order('last_message_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    async getConversation(conversationId) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    }

    async updateConversationTitle(conversationId, title) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .update({ title: title })
                .eq('id', conversationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating conversation title:', error);
            throw error;
        }
    }

    async deleteConversation(conversationId) {
        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }

    // Message Operations
    async addMessage(conversationId, sender, content, messageType = 'text') {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender: sender,
                    content: content,
                    message_type: messageType
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    async getConversationMessages(conversationId, limit = 100) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    // Utility Methods
    async verifyUserAccess(userId, conversationId) {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('user_id')
                .eq('id', conversationId)
                .single();

            if (error) throw error;
            return data && data.user_id === userId;
        } catch (error) {
            console.error('Error verifying user access:', error);
            return false;
        }
    }
}

module.exports = new DatabaseService();

