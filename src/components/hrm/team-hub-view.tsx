'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle, Megaphone, ClipboardList, Briefcase,
  Send, Hash, Pin, PinOff, Search, SmilePlus,
  MoreHorizontal, User, CheckCircle2, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

// ============ TYPES ============

interface ChatMessage {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  channelName?: string;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline?: boolean;
  type: 'dm' | 'group';
}

interface Announcement {
  id: string;
  author: string;
  authorInitials: string;
  date: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
}

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeInitials: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed';
  checked?: boolean;
}

interface ShiftTask {
  id: string;
  title: string;
  shift: string;
  assignee: string;
  status: 'not-started' | 'in-progress' | 'completed';
  checklist: { id: string; text: string; done: boolean }[];
}

// ============ MOCK DATA ============

const CONVERSATIONS: Conversation[] = [
  { id: 'c1', name: 'Marcus Brown', initials: 'MB', lastMessage: 'Can you review the PR by EOD?', timestamp: '10:32 AM', unread: 2, isOnline: true, type: 'dm' },
  { id: 'c2', name: 'Lisa Chen', initials: 'LC', lastMessage: 'The schedule looks good 👍', timestamp: '9:45 AM', unread: 0, type: 'dm' },
  { id: 'c3', name: 'David Taylor', initials: 'DT', lastMessage: 'Equipment issue in Building 3', timestamp: 'Yesterday', unread: 1, type: 'dm' },
  { id: 'c4', name: 'Sarah Williams', initials: 'SW', lastMessage: 'Meeting rescheduled to 3PM', timestamp: 'Yesterday', unread: 0, type: 'dm' },
  { id: 'c5', name: 'James Anderson', initials: 'JA', lastMessage: 'Deployment successful!', timestamp: 'Mon', unread: 0, type: 'dm' },
  { id: 'g1', name: 'ICT Team', initials: 'ICT', lastMessage: 'Server maintenance tonight', timestamp: '11:00 AM', unread: 5, type: 'group' },
  { id: 'g2', name: 'All Staff', initials: 'AS', lastMessage: 'Holiday party announcement!', timestamp: '10:15 AM', unread: 3, type: 'group' },
  { id: 'g3', name: 'Management', initials: 'MG', lastMessage: 'Q1 budget review notes', timestamp: 'Yesterday', unread: 0, type: 'group' },
  { id: 'g4', name: 'Project Alpha', initials: 'PA', lastMessage: 'Sprint retrospective at 2PM', timestamp: 'Yesterday', unread: 2, type: 'group' },
  { id: 'g5', name: 'Social Committee', initials: 'SC', lastMessage: 'Volunteer sign-up open', timestamp: 'Mon', unread: 0, type: 'group' },
];

const MESSAGES: ChatMessage[] = [
  { id: 'm1', sender: 'Marcus Brown', senderInitials: 'MB', content: 'Good morning team! Let\'s sync on the project status.', timestamp: '9:00 AM', isMe: false },
  { id: 'm2', sender: 'Lisa Chen', senderInitials: 'LC', content: 'Morning! I\'ve updated the Gantt chart with the latest milestones.', timestamp: '9:05 AM', isMe: false },
  { id: 'm3', sender: 'You', senderInitials: 'ME', content: 'Great, I\'ll review the timeline after standup.', timestamp: '9:08 AM', isMe: true },
  { id: 'm4', sender: 'David Taylor', senderInitials: 'DT', content: 'Heads up — the HVAC system in Building 3 needs urgent attention. I\'ve logged a ticket.', timestamp: '9:15 AM', isMe: false },
  { id: 'm5', sender: 'You', senderInitials: 'ME', content: 'Thanks David. I\'ll escalate that to facilities.', timestamp: '9:18 AM', isMe: true },
  { id: 'm6', sender: 'Sarah Williams', senderInitials: 'SW', content: 'The faculty meeting is confirmed for Thursday at 2PM in Room 204.', timestamp: '9:30 AM', isMe: false },
  { id: 'm7', sender: 'Marcus Brown', senderInitials: 'MB', content: 'Perfect. Can someone prepare the attendance report?', timestamp: '9:32 AM', isMe: false },
  { id: 'm8', sender: 'You', senderInitials: 'ME', content: 'I\'ll pull that from the system before the meeting.', timestamp: '9:35 AM', isMe: true },
  { id: 'm9', sender: 'James Anderson', senderInitials: 'JA', content: 'The new HR portal deployment went smoothly last night. All systems green! 🟢', timestamp: '9:45 AM', isMe: false },
  { id: 'm10', sender: 'Lisa Chen', senderInitials: 'LC', content: 'Excellent! No issues reported so far this morning.', timestamp: '9:48 AM', isMe: false },
  { id: 'm11', sender: 'You', senderInitials: 'ME', content: 'Awesome work James! Let\'s monitor throughout the day.', timestamp: '9:50 AM', isMe: true },
  { id: 'm12', sender: 'Marcus Brown', senderInitials: 'MB', content: 'Reminder: performance review season starts next Monday. Please complete your self-assessments.', timestamp: '10:00 AM', isMe: false },
  { id: 'm13', sender: 'Maria Garcia', senderInitials: 'MG', content: 'I\'ve scheduled the interview for the new Admin position. Wednesday at 10AM.', timestamp: '10:15 AM', isMe: false },
  { id: 'm14', sender: 'You', senderInitials: 'ME', content: 'Got it, I\'ll be there. Can you share the candidate\'s resume beforehand?', timestamp: '10:18 AM', isMe: true },
  { id: 'm15', sender: 'Robert Johnson', senderInitials: 'RJ', content: 'Safety inspection completed for the maintenance workshop. All clear! ✅', timestamp: '10:25 AM', isMe: false },
  { id: 'm16', sender: 'Emily Davis', senderInitials: 'ED', content: 'The training module on Data Privacy is now live. All staff need to complete by Feb 28.', timestamp: '10:30 AM', isMe: false },
  { id: 'm17', sender: 'You', senderInitials: 'ME', content: 'Thanks Emily, I\'ll add it to the onboarding checklist too.', timestamp: '10:32 AM', isMe: true },
  { id: 'm18', sender: 'Marcus Brown', senderInitials: 'MB', content: 'Can you review the PR by EOD? It includes the new scheduling algorithm.', timestamp: '10:32 AM', isMe: false },
  { id: 'm19', sender: 'David Taylor', senderInitials: 'DT', content: 'The replacement parts for the generator have arrived. Installation scheduled for Friday.', timestamp: '10:45 AM', isMe: false },
  { id: 'm20', sender: 'Lisa Chen', senderInitials: 'LC', content: 'Updated leave calendar for February. Please check your approved PTO.', timestamp: '11:00 AM', isMe: false },
  { id: 'm21', sender: 'You', senderInitials: 'ME', content: 'Thanks Lisa. My PTO request for Feb 14-17 is still pending — any update?', timestamp: '11:05 AM', isMe: true },
  { id: 'm22', sender: 'Lisa Chen', senderInitials: 'LC', content: 'Let me check on that for you right now.', timestamp: '11:06 AM', isMe: false },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', author: 'HR Department', authorInitials: 'HR', date: 'Jan 17, 2025', title: 'Annual Performance Review Cycle', content: 'The 2025 performance review cycle begins January 27. All employees should complete self-assessments by February 7. Managers will conduct reviews by February 28.', category: 'Policy', isPinned: true, reactions: [{ emoji: '👍', count: 12, hasReacted: true }, { emoji: '📌', count: 5, hasReacted: false }] },
  { id: 'a2', author: 'Sarah Williams', authorInitials: 'SW', date: 'Jan 16, 2025', title: 'New Safety Training Module', content: 'A new mandatory safety training module on Workplace Hazard Awareness is now available. All staff must complete by March 1.', category: 'Policy', isPinned: true, reactions: [{ emoji: '📋', count: 8, hasReacted: false }, { emoji: '✅', count: 3, hasReacted: true }] },
  { id: 'a3', author: 'Social Committee', authorInitials: 'SC', date: 'Jan 15, 2025', title: 'Company Holiday Party — Feb 14', content: 'Join us for the annual company celebration! Live music, food, and fun. RSVP by February 1. Location: Staff Lounge, 6PM.', category: 'Event', isPinned: false, reactions: [{ emoji: '🎉', count: 24, hasReacted: true }, { emoji: '❤️', count: 15, hasReacted: false }, { emoji: '🎊', count: 10, hasReacted: true }] },
  { id: 'a4', author: 'Marcus Brown', authorInitials: 'MB', date: 'Jan 14, 2025', title: 'ICT System Maintenance — Jan 25', content: 'Planned maintenance window: Saturday Jan 25, 10PM–6AM. HR portal and email will be briefly unavailable. Save your work!', category: 'General', isPinned: false, reactions: [{ emoji: '⚠️', count: 6, hasReacted: false }] },
  { id: 'a5', author: 'HR Department', authorInitials: 'HR', date: 'Jan 13, 2025', title: 'Welcome Our New Team Members!', content: 'Please welcome Jessica Martinez (Admin) and Michael Thompson (ICT) who joined us this week. Say hello and make them feel at home!', category: 'Celebration', isPinned: false, reactions: [{ emoji: '👏', count: 18, hasReacted: true }, { emoji: '🎉', count: 12, hasReacted: false }, { emoji: '❤️', count: 8, hasReacted: true }] },
  { id: 'a6', author: 'Facilities', authorInitials: 'FA', date: 'Jan 12, 2025', title: 'Parking Lot Repairs — Jan 20-24', content: 'Sections B and C of the parking lot will be under repair next week. Please use Section A or the overflow lot. Thank you for your patience.', category: 'General', isPinned: false, reactions: [{ emoji: '🚗', count: 4, hasReacted: false }] },
  { id: 'a7', author: 'HR Department', authorInitials: 'HR', date: 'Jan 11, 2025', title: 'Benefits Enrollment Deadline', content: 'Open enrollment for 2025 benefits ends January 31. Review your health, dental, and vision plans. Changes take effect February 1.', category: 'Urgent', isPinned: true, reactions: [{ emoji: '📌', count: 9, hasReacted: false }, { emoji: '👍', count: 7, hasReacted: true }] },
  { id: 'a8', author: 'Lisa Chen', authorInitials: 'LC', date: 'Jan 10, 2025', title: 'Updated Office Hours Policy', content: 'Effective February 1, the standard office hours will be 8:30 AM – 5:00 PM with a 1-hour lunch break. Flexible scheduling remains available with manager approval.', category: 'Policy', isPinned: false, reactions: [{ emoji: '📊', count: 11, hasReacted: false }, { emoji: '⏰', count: 5, hasReacted: true }] },
];

const KANBAN_TASKS: KanbanTask[] = [
  { id: 'kt1', title: 'Update employee handbook', description: 'Review and update policies for 2025', assignee: 'Lisa Chen', assigneeInitials: 'LC', priority: 'high', dueDate: 'Jan 25', status: 'todo' },
  { id: 'kt2', title: 'Schedule Q1 reviews', description: 'Coordinate review meetings with all departments', assignee: 'Marcus Brown', assigneeInitials: 'MB', priority: 'high', dueDate: 'Jan 27', status: 'todo' },
  { id: 'kt3', title: 'Onboard new hires', description: 'Complete orientation for 2 new team members', assignee: 'Sarah Williams', assigneeInitials: 'SW', priority: 'medium', dueDate: 'Jan 22', status: 'in-progress' },
  { id: 'kt4', title: 'Implement new scheduling UI', description: 'Build drag-and-drop calendar interface', assignee: 'James Anderson', assigneeInitials: 'JA', priority: 'high', dueDate: 'Feb 1', status: 'in-progress' },
  { id: 'kt5', title: 'Complete safety audit', description: 'Annual workplace safety inspection', assignee: 'Robert Johnson', assigneeInitials: 'RJ', priority: 'medium', dueDate: 'Jan 30', status: 'in-progress' },
  { id: 'kt6', title: 'Prepare payroll report', description: 'Month-end payroll reconciliation', assignee: 'Maria Garcia', assigneeInitials: 'MG', priority: 'low', dueDate: 'Jan 31', status: 'completed', checked: true },
  { id: 'kt7', title: 'Update training catalog', description: 'Add 3 new courses for Q1', assignee: 'Emily Davis', assigneeInitials: 'ED', priority: 'medium', dueDate: 'Jan 28', status: 'completed', checked: true },
  { id: 'kt8', title: 'Fix attendance API bug', description: 'Resolve timezone issue in clock records', assignee: 'Michael Thompson', assigneeInitials: 'MT', priority: 'high', dueDate: 'Jan 20', status: 'completed', checked: true },
  { id: 'kt9', title: 'Draft benefits summary', description: 'Create one-page benefits overview for new hires', assignee: 'Lisa Chen', assigneeInitials: 'LC', priority: 'low', dueDate: 'Feb 5', status: 'todo' },
  { id: 'kt10', title: 'Migrate database records', description: 'Move legacy records to new schema', assignee: 'James Anderson', assigneeInitials: 'JA', priority: 'medium', dueDate: 'Feb 10', status: 'in-progress' },
  { id: 'kt11', title: 'Organize team building event', description: 'Plan Q1 team activity for ICT department', assignee: 'Marcus Brown', assigneeInitials: 'MB', priority: 'low', dueDate: 'Feb 15', status: 'todo' },
  { id: 'kt12', title: 'Review compliance checklist', description: 'Ensure all regulatory requirements are met', assignee: 'Sarah Williams', assigneeInitials: 'SW', priority: 'high', dueDate: 'Jan 31', status: 'todo' },
];

const SHIFT_TASKS: ShiftTask[] = [
  { id: 'st1', title: 'Morning Setup Checklist', shift: 'Morning (6AM–2PM)', assignee: 'David Taylor', status: 'in-progress', checklist: [{ id: 'cl1', text: 'Unlock all buildings', done: true }, { id: 'cl2', text: 'Check HVAC systems', done: true }, { id: 'cl3', text: 'Verify security cameras', done: false }, { id: 'cl4', text: 'Restock supplies in common areas', done: false }, { id: 'cl5', text: 'Test emergency lighting', done: false }] },
  { id: 'st2', title: 'IT System Health Check', shift: 'Standard Office (8:30AM–5PM)', assignee: 'James Anderson', status: 'in-progress', checklist: [{ id: 'cl6', text: 'Check server status dashboard', done: true }, { id: 'cl7', text: 'Review backup logs', done: true }, { id: 'cl8', text: 'Test network connectivity', done: true }, { id: 'cl9', text: 'Update antivirus definitions', done: false }] },
  { id: 'st3', title: 'Reception & Front Desk Duties', shift: 'Standard Office (8:30AM–5PM)', assignee: 'Maria Garcia', status: 'not-started', checklist: [{ id: 'cl10', text: 'Sort incoming mail', done: false }, { id: 'cl11', text: 'Prepare visitor badges', done: false }, { id: 'cl12', text: 'Answer phone calls', done: false }, { id: 'cl13', text: 'Update appointment calendar', done: false }, { id: 'cl14', text: 'Process deliveries', done: false }] },
  { id: 'st4', title: 'Evening Security Round', shift: 'Afternoon (2PM–10PM)', assignee: 'Robert Johnson', status: 'not-started', checklist: [{ id: 'cl15', text: 'Lock all exterior doors', done: false }, { id: 'cl16', text: 'Check alarm systems', done: false }, { id: 'cl17', text: 'Inspect parking lot', done: false }, { id: 'cl18', text: 'Submit daily security report', done: false }] },
  { id: 'st5', title: 'Lab Preparation', shift: 'Morning (6AM–2PM)', assignee: 'Emily Davis', status: 'completed', checklist: [{ id: 'cl19', text: 'Prepare lab materials', done: true }, { id: 'cl20', text: 'Calibrate equipment', done: true }, { id: 'cl21', text: 'Update lab safety protocols', done: true }, { id: 'cl22', text: 'Clean workstations', done: true }] },
  { id: 'st6', title: 'Weekend Maintenance', shift: 'Weekend (8AM–6PM)', assignee: 'David Taylor', status: 'not-started', checklist: [{ id: 'cl23', text: 'Deep clean common areas', done: false }, { id: 'cl24', text: 'Service elevator', done: false }, { id: 'cl25', text: 'Replace ceiling tiles in Building 2', done: false }] },
];

// ============ MAIN COMPONENT ============

export function TeamHubView() {
  const { employees } = useAppStore();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState(CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(MESSAGES);
  const [announcementFilter, setAnnouncementFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kanbanTasks, setKanbanTasks] = useState(KANBAN_TASKS);
  const [shiftTasks, setShiftTasks] = useState(SHIFT_TASKS);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState(MESSAGES);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages.length]);

  // Conversation messages (filter by selected)
  const convoMessages = useMemo(() => {
    return localMessages;
  }, [localMessages]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `m${localMessages.length + 1}`,
      sender: 'You',
      senderInitials: 'ME',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setMessageInput('');

    // Simulate typing indicator then response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        'Got it, thanks!',
        'I\'ll look into that right away.',
        'Sounds good to me 👍',
        'Let me check and get back to you.',
        'Great idea! Let\'s discuss at the next standup.',
      ];
      const reply: ChatMessage = {
        id: `m${localMessages.length + 2}`,
        sender: selectedConversation.name,
        senderInitials: selectedConversation.initials,
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setLocalMessages(prev => [...prev, reply]);
    }, 1500 + Math.random() * 1500);
  }, [messageInput, localMessages.length, selectedConversation]);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcementFilter === 'all'
      ? announcements
      : announcements.filter(a => a.category === announcementFilter);
  }, [announcementFilter, announcements]);

  const handleTogglePin = useCallback((id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  }, []);

  const handleReaction = useCallback((annId: string, emoji: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id !== annId) return a;
      const existing = a.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...a,
          reactions: a.reactions.map(r =>
            r.emoji === emoji ? { ...r, count: r.hasReacted ? r.count - 1 : r.count + 1, hasReacted: !r.hasReacted } : r
          ).filter(r => r.count > 0),
        };
      }
      return { ...a, reactions: [...a.reactions, { emoji, count: 1, hasReacted: true }] };
    }));
  }, []);

  // Kanban columns
  const todoTasks = kanbanTasks.filter(t => t.status === 'todo');
  const inProgressTasks = kanbanTasks.filter(t => t.status === 'in-progress');
  const completedTasks = kanbanTasks.filter(t => t.status === 'completed');

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const categoryColors: Record<string, string> = {
    General: 'bg-slate-500/20 text-slate-300',
    Policy: 'bg-violet-500/20 text-violet-300',
    Event: 'bg-msbm-red/20 text-msbm-red-bright',
    Celebration: 'bg-amber-500/20 text-amber-300',
    Urgent: 'bg-red-500/20 text-red-300',
  };

  const statusColors: Record<string, string> = {
    'not-started': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'completed': 'bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-msbm-red-bright" />
          Team Communication Hub
        </h2>
        <p className="text-muted-foreground mt-1">Chat, announcements, tasks, and shift coordination</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="chat" className="text-xs sm:text-sm">Team Chat</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs sm:text-sm">Announcements</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="shift-tasks" className="text-xs sm:text-sm">Shift Tasks</TabsTrigger>
        </TabsList>

        {/* ============ TEAM CHAT TAB ============ */}
        <TabsContent value="chat" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 border border-border rounded-xl overflow-hidden h-[600px]">
            {/* Sidebar: Conversations */}
            <div className={`${sidebarOpen ? '' : 'hidden'} md:block border-r border-border bg-card`}>
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-8 h-9 text-sm" />
                </div>
              </div>
              <ScrollArea className="h-[540px]">
                <div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Direct Messages</p>
                  </div>
                  {CONVERSATIONS.filter(c => c.type === 'dm').map(c => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                        selectedConversation.id === c.id ? 'bg-msbm-red/10 border-r-2 border-msbm-red' : ''
                      }`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-msbm-red to-inner-blue text-white">{c.initials}</AvatarFallback>
                        </Avatar>
                        {c.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{c.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && (
                        <Badge className="bg-msbm-red text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center px-1">{c.unread}</Badge>
                      )}
                    </button>
                  ))}
                  <div className="px-3 py-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Group Channels</p>
                  </div>
                  {CONVERSATIONS.filter(c => c.type === 'group').map(c => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                        selectedConversation.id === c.id ? 'bg-msbm-red/10 border-r-2 border-msbm-red' : ''
                      }`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && (
                        <Badge className="bg-msbm-red text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center px-1">{c.unread}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col bg-background">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Sidebar" aria-label="Toggle Sidebar">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {selectedConversation.type === 'dm' ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-msbm-red to-inner-blue text-white">{selectedConversation.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedConversation.name}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedConversation.isOnline ? '🟢 Online' : '⚫ Offline'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {selectedConversation.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1"><Hash className="h-3 w-3" />{selectedConversation.name}</p>
                        <p className="text-[10px] text-muted-foreground">{CONVERSATIONS.length} members</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" title="More options" aria-label="More options"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-4">
                  {convoMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                        <AvatarFallback className={`text-[10px] ${msg.isMe ? 'bg-gradient-to-br from-msbm-red to-inner-blue text-white' : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'}`}>
                          {msg.senderInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${msg.isMe ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-0.5">
                          {!msg.isMe && <span className="text-xs font-medium">{msg.sender}</span>}
                          <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div className={`inline-block px-3 py-2 rounded-xl text-sm ${
                          msg.isMe
                            ? 'bg-msbm-red-bright text-white rounded-br-sm'
                            : 'bg-muted/80 text-foreground rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                          {selectedConversation.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="inline-block px-4 py-2 rounded-xl rounded-bl-sm bg-muted/80">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="shrink-0" title="Add emoji" aria-label="Add emoji"><SmilePlus className="h-5 w-5 text-muted-foreground" /></Button>
                  <Input
                    placeholder={`Message ${selectedConversation.name}...`}
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button size="sm" className="shrink-0 bg-msbm-red hover:bg-msbm-red/80" onClick={handleSendMessage} title="Send message" aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============ ANNOUNCEMENTS TAB ============ */}
        <TabsContent value="announcements" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {['all', 'General', 'Policy', 'Event', 'Celebration', 'Urgent'].map(cat => (
                <Button
                  key={cat}
                  variant={announcementFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => setAnnouncementFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAnnouncements
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
              .map(ann => (
              <Card key={ann.id} className={ann.isPinned ? 'border-l-4 border-l-amber-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[9px] bg-gradient-to-br from-msbm-red to-inner-blue text-white">{ann.authorInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{ann.author}</span>
                        <span className="text-[10px] text-muted-foreground">{ann.date}</span>
                        <Badge variant="outline" className={`text-[10px] ${categoryColors[ann.category] || ''}`}>{ann.category}</Badge>
                        {ann.isPinned && <Pin className="h-3 w-3 text-amber-400" />}
                      </div>
                      <h3 className="font-semibold text-sm mt-2">{ann.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                      {/* Reactions */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {ann.reactions.map(r => (
                          <button
                            key={r.emoji}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                              r.hasReacted ? 'bg-msbm-red/20 border-msbm-red/50 text-msbm-red-bright' : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'
                            }`}
                            onClick={() => handleReaction(ann.id, r.emoji)}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.count}</span>
                          </button>
                        ))}
                        <button
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-border/50 text-muted-foreground hover:bg-muted/50 transition-colors"
                          onClick={() => handleReaction(ann.id, '👍')}
                          title="Like announcement"
                          aria-label="Like announcement"
                        >
                          <SmilePlus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleTogglePin(ann.id)}
                      title={ann.isPinned ? "Unpin announcement" : "Pin announcement"}
                      aria-label={ann.isPinned ? "Unpin announcement" : "Pin announcement"}
                    >
                      {ann.isPinned ? <PinOff className="h-4 w-4 text-muted-foreground" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============ KANBAN TASKS TAB ============ */}
        <TabsContent value="tasks" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* To Do */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  To Do
                  <Badge variant="outline" className="text-xs">{todoTasks.length}</Badge>
                </h3>
              </div>
              <div className="space-y-2">
                {todoTasks.map(task => (
                  <Card key={task.id} className="card-lift">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-msbm-red to-inner-blue text-white">{task.assigneeInitials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Due {task.dueDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  In Progress
                  <Badge variant="outline" className="text-xs">{inProgressTasks.length}</Badge>
                </h3>
              </div>
              <div className="space-y-2">
                {inProgressTasks.map(task => (
                  <Card key={task.id} className="card-lift border-l-4 border-l-amber-500">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-amber-500 to-orange-600 text-white">{task.assigneeInitials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Due {task.dueDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-msbm-red-bright" />
                  Completed
                  <Badge variant="outline" className="text-xs">{completedTasks.length}</Badge>
                </h3>
              </div>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <Card key={task.id} className="card-lift opacity-75">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium line-through text-muted-foreground">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-msbm-red to-inner-blue text-white">{task.assigneeInitials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============ SHIFT TASKS TAB ============ */}
        <TabsContent value="shift-tasks" className="mt-4 space-y-4">
          {shiftTasks.map(task => {
            const doneCount = task.checklist.filter(c => c.done).length;
            const totalCount = task.checklist.length;
            const pct = (doneCount / totalCount) * 100;

            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-sm">{task.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[task.status]}`}>
                          {task.status === 'not-started' ? 'Not Started' : task.status === 'in-progress' ? 'In Progress' : 'Completed'}
                        </Badge>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{task.shift}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignee}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs font-medium">{doneCount}/{totalCount}</span>
                      </div>

                      {/* Checklist */}
                      <div className="space-y-2">
                        {task.checklist.map(item => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox
                              checked={item.done}
                              onCheckedChange={() => {
                                setShiftTasks(prev => prev.map(t =>
                                  t.id === task.id
                                    ? {
                                        ...t,
                                        checklist: t.checklist.map(c => c.id === item.id ? { ...c, done: !c.done } : c),
                                        status: t.checklist.every(c => c.id === item.id ? !c.done : c.done) ? 'completed' : 'in-progress',
                                      }
                                    : t
                                ));
                              }}
                            />
                            <span className={`text-sm transition-colors ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                              {item.text}
                            </span>
                            {item.done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 shrink-0">
                      {task.status === 'completed' && <CheckCircle2 className="h-6 w-6 text-emerald-400" />}
                      {task.status === 'in-progress' && <Clock className="h-6 w-6 text-amber-400" />}
                      {task.status === 'not-started' && <AlertCircle className="h-6 w-6 text-slate-400" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
