export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdBy: UserSummary;
  assignedAgent: UserSummary | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface Comment {
  id: number;
  message: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  myAssignedTickets: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  last7DaysCounts: number[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
}
