import {useState} from 'react';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  contentType: 'text' | 'image' | 'video';
  media?: {
    url: string;
    type: string;
    thumbnail?: string;
  };
  read: boolean;
  modTime: FirebaseFirestoreTypes.Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: FirebaseFirestoreTypes.Timestamp;
  };
  unreadCount: {
    [userId: string]: number;
  };
  modTime: FirebaseFirestoreTypes.Timestamp;
}

export const useMessageData = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async (userId: string) => {
    setLoading(true);
    try {
      const query = db
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('modTime', 'desc');

      const snapshot = await query.get();
      const fetchedConversations = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Conversation)
      );

      setConversations(fetchedConversations);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const query = db
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .orderBy('modTime', 'desc');

      const snapshot = await query.get();
      const fetchedMessages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Message)
      );

      setMessages(fetchedMessages);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    }
    setLoading(false);
  };

  return {
    messages,
    conversations,
    loading,
    error,
    fetchMessages,
    fetchConversations,
  };
};
