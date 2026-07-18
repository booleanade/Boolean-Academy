export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'development' | 'design' | 'security';
  image: string;
  syllabus: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail?: string;
  assignmentTitle: string;
  githubUrl: string;
  vercelUrl: string;
  screenshotUrl?: string;
  status: 'Pending' | 'Approved' | 'Changes Requested';
  submittedAt: string;
  grade?: string;
  comment?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface User {
  name: string;
  email: string;
  enrolledCourses: string[]; // Course IDs
  role: 'student' | 'admin';
  password?: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

