export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
}

export interface PQR {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: string;
  property: string;
  description: string;
  comments: Comment[];
  assignedTo: string | null;
}

export interface User {
  id: number;
  name: string;
  role: string;
}