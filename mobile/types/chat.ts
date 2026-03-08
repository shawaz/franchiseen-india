export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  avatar?: string;
  isOnline?: boolean;
}

export const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey, how are you doing?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Let\'s meet tomorrow',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Acme Inc. Recruiter',
    lastMessage: 'Your application has been reviewed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 1,
  },
  {
    id: '4',
    name: 'Tech Conference',
    lastMessage: 'Reminder: Event starts in 2 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 0,
  },
];
