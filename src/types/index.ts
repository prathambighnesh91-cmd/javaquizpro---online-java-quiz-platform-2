export type Role = 'ADMIN' | 'QUIZ_CREATOR' | 'PARTICIPANT';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type QuizStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

export type AttemptStatus = 'IN_PROGRESS' | 'PASS' | 'FAIL';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  googleSub?: string;
  authProvider?: 'LOCAL' | 'GOOGLE';
}

export interface Question {
  id: number;
  quizId?: number;
  questionText: string;
  codeSnippet?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  passingPercentage: number;
  creatorId: number;
  creatorName?: string;
  status: QuizStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  totalMarks?: number;
  attemptsCount?: number;
}

export interface ParticipantAnswer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  marksObtained: number;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  quizTitle: string;
  quizCategory: string;
  participantId: number;
  participantName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTakenSeconds: number;
  status: AttemptStatus;
  submittedAt: string;
  answers: ParticipantAnswer[];
  feedback?: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: Role;
  receiverId: number;
  receiverName: string;
  quizId?: number;
  quizTitle?: string;
  message: string;
  sentAt: string;
  readStatus: boolean;
  replyToId?: number;
}

export interface Reminder {
  id: number;
  participantId: number;
  quizId: number;
  quizTitle: string;
  reminderDate: string;
  reminderTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface SystemSetting {
  id: number;
  settingName: string;
  settingValue: string;
  description: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface LeaderboardEntry {
  rank: number;
  participantId: number;
  participantName: string;
  quizzesCompleted: number;
  averageScore: number;
  totalPoints: number;
  passRate: number;
}
