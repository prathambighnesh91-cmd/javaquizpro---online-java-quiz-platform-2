import {
  User,
  Quiz,
  Question,
  QuizAttempt,
  Message,
  Reminder,
  SystemSetting,
  Notification,
  LeaderboardEntry,
  Role,
  UserStatus,
  QuizStatus,
  ParticipantAnswer
} from '../types';
import {
  getStoredUsers,
  saveUsers,
  getStoredQuizzes,
  saveQuizzes,
  getStoredAttempts,
  saveAttempts,
  getStoredMessages,
  saveMessages,
  getStoredReminders,
  saveReminders,
  getStoredSettings,
  saveSettings,
  getStoredNotifications,
  saveNotifications
} from './storage';

// Simulated realistic network delay helper (50-150ms for snappy real-feel)
const delay = (ms = 80) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // ================= AUTHENTICATION =================
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await delay();
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Invalid email or password. Please verify credentials.');
    }
    if (user.status === 'INACTIVE') {
      throw new Error('This account has been deactivated by the system administrator.');
    }
    // Accept password123, or user.password, or match demo
    if (user.password && user.password !== password && password !== 'password123') {
      throw new Error('Invalid email or password. Please try again.');
    }

    const token = `jwt-token-${user.id}-${Date.now()}`;
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser as User };
  },

  async loginWithGoogle(payload: {
    sub: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role?: Role;
  }): Promise<{ token: string; user: User }> {
    await delay();
    const users = getStoredUsers();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanSub = payload.sub.trim();

    if (!cleanSub) {
      throw new Error('Missing Google user unique identifier (sub).');
    }
    if (!cleanEmail) {
      throw new Error('Missing Google user email address.');
    }

    // 1. PRIMARY LOOKUP: Match by immutable Google 'sub'
    let user = users.find(u => u.googleSub === cleanSub);

    // 2. SECONDARY LOOKUP: Match by verified email (link Google ID if pre-existing account)
    if (!user) {
      user = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.googleSub = cleanSub;
        user.authProvider = 'GOOGLE';
      }
    }

    if (user) {
      if (user.status === 'INACTIVE') {
        throw new Error('This account has been deactivated by the system administrator.');
      }
      // CRITICAL: Always update name to the CURRENT Google user's name
      // This prevents ever displaying old, stale, or wrong display names
      user.name = payload.name.trim();
      if (payload.avatarUrl) {
        user.avatarUrl = payload.avatarUrl;
      }
      user.googleSub = cleanSub;
      user.authProvider = 'GOOGLE';
    } else {
      // 3. CREATE NEW UNIQUE RECORD for this Google account
      const newId = Date.now();
      const newUser: User = {
        id: newId,
        googleSub: cleanSub,
        name: payload.name.trim(),
        email: cleanEmail,
        role: payload.role || 'PARTICIPANT',
        status: 'ACTIVE',
        authProvider: 'GOOGLE',
        avatarUrl: payload.avatarUrl,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      user = newUser;

      // Notify Admin
      const notifs = getStoredNotifications();
      notifs.unshift({
        id: Date.now(),
        userId: 1, // Admin
        title: 'New Google User Signed In',
        message: `${newUser.name} (${newUser.email}) signed in via Google.`,
        readStatus: false,
        createdAt: new Date().toISOString(),
        type: 'INFO'
      });
      saveNotifications(notifs);
    }

    saveUsers(users);

    const token = `jwt-google-${user.id}-${cleanSub.slice(-6)}-${Date.now()}`;
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser as User };
  },

  async getCurrentUser(userId: number): Promise<User> {
    await delay(30);
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Authenticated user session not found.');
    }
    const { password: _, ...safeUser } = user;
    return safeUser as User;
  },

  async updateUserRole(userId: number, role: Role): Promise<User> {
    await delay();
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }
    user.role = role;
    saveUsers(users);
    const { password: _, ...safeUser } = user;
    return safeUser as User;
  },

  async register(data: { name: string; email: string; password: string; role: Role }): Promise<{ token: string; user: User }> {
    await delay();
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    if (data.role === 'ADMIN') {
      throw new Error('Admin registration is restricted. Please contact the administrator.');
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      role: data.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Notify Admin of registration
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: Date.now(),
      userId: 1, // Admin
      title: 'New User Registered',
      message: `${newUser.name} registered as a ${newUser.role.replace('_', ' ')}.`,
      readStatus: false,
      createdAt: new Date().toISOString(),
      type: 'INFO'
    });
    saveNotifications(notifs);

    const token = `jwt-token-${newUser.id}-${Date.now()}`;
    const { password: _, ...safeUser } = newUser;
    return { token, user: safeUser as User };
  },

  // ================= USERS (ADMIN) =================
  async getUsers(): Promise<User[]> {
    await delay();
    return getStoredUsers().map(({ password: _, ...u }) => u as User);
  },

  async addUser(data: { name: string; email: string; password?: string; role: Role; status?: UserStatus }): Promise<User> {
    await delay();
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('A user with this email address already exists.');
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || 'password123',
      role: data.role,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    users.unshift(newUser);
    saveUsers(users);
    const { password: _, ...safeUser } = newUser;
    return safeUser as User;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    await delay();
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found.');

    if (data.email) {
      const emailDup = users.find(u => u.email.toLowerCase() === data.email!.trim().toLowerCase() && u.id !== id);
      if (emailDup) throw new Error('Another user is already registered with this email.');
    }

    users[idx] = { ...users[idx], ...data };
    saveUsers(users);
    const { password: _, ...safeUser } = users[idx];
    return safeUser as User;
  },

  async deleteUser(id: number): Promise<boolean> {
    await delay();
    let users = getStoredUsers();
    if (id === 1) throw new Error('The primary administrator account cannot be deleted.');
    users = users.filter(u => u.id !== id);
    saveUsers(users);
    return true;
  },

  // ================= QUIZZES =================
  async getQuizzes(filter?: { status?: QuizStatus; creatorId?: number; category?: string }): Promise<Quiz[]> {
    await delay();
    let quizzes = getStoredQuizzes();
    if (filter?.status) {
      quizzes = quizzes.filter(q => q.status === filter.status);
    }
    if (filter?.creatorId) {
      quizzes = quizzes.filter(q => q.creatorId === filter.creatorId);
    }
    if (filter?.category && filter.category !== 'All') {
      quizzes = quizzes.filter(q => q.category === filter.category);
    }
    return quizzes;
  },

  async getQuizById(id: number): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) throw new Error(`Quiz #${id} not found.`);
    return quiz;
  },

  async createQuiz(data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'attemptsCount' | 'totalMarks'>): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const totalMarks = data.questions.reduce((acc, q) => acc + (Number(q.marks) || 10), 0);

    const newQuiz: Quiz = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attemptsCount: 0,
      totalMarks,
      status: data.status || 'DRAFT'
    };

    quizzes.unshift(newQuiz);
    saveQuizzes(quizzes);

    if (newQuiz.status === 'PENDING') {
      const notifs = getStoredNotifications();
      notifs.unshift({
        id: Date.now(),
        userId: 1, // Admin
        title: 'New Quiz Submitted for Review',
        message: `"${newQuiz.title}" by ${newQuiz.creatorName || 'Quiz Creator'} is waiting for approval.`,
        readStatus: false,
        createdAt: new Date().toISOString(),
        type: 'INFO'
      });
      saveNotifications(notifs);
    }

    return newQuiz;
  },

  async updateQuiz(id: number, data: Partial<Quiz>): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const idx = quizzes.findIndex(q => q.id === id);
    if (idx === -1) throw new Error('Quiz not found.');

    const updatedQuestions = data.questions || quizzes[idx].questions;
    const totalMarks = updatedQuestions.reduce((acc, q) => acc + (Number(q.marks) || 10), 0);

    quizzes[idx] = {
      ...quizzes[idx],
      ...data,
      questions: updatedQuestions,
      totalMarks,
      updatedAt: new Date().toISOString()
    };

    saveQuizzes(quizzes);
    return quizzes[idx];
  },

  async deleteQuiz(id: number): Promise<boolean> {
    await delay();
    let quizzes = getStoredQuizzes();
    quizzes = quizzes.filter(q => q.id !== id);
    saveQuizzes(quizzes);
    return true;
  },

  async submitQuizForApproval(quizId: number): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const idx = quizzes.findIndex(q => q.id === quizId);
    if (idx === -1) throw new Error('Quiz not found.');

    quizzes[idx].status = 'PENDING';
    quizzes[idx].updatedAt = new Date().toISOString();
    saveQuizzes(quizzes);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: Date.now(),
      userId: 1, // Admin
      title: 'Quiz Submitted for Review',
      message: `"${quizzes[idx].title}" submitted by ${quizzes[idx].creatorName || 'Creator'} is ready for approval.`,
      readStatus: false,
      createdAt: new Date().toISOString(),
      type: 'INFO'
    });
    saveNotifications(notifs);

    return quizzes[idx];
  },

  async approveQuiz(quizId: number): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const idx = quizzes.findIndex(q => q.id === quizId);
    if (idx === -1) throw new Error('Quiz not found.');

    quizzes[idx].status = 'APPROVED';
    quizzes[idx].rejectionReason = undefined;
    quizzes[idx].updatedAt = new Date().toISOString();
    saveQuizzes(quizzes);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: Date.now(),
      userId: quizzes[idx].creatorId,
      title: 'Quiz Approved!',
      message: `Your quiz "${quizzes[idx].title}" was approved by the administrator. You can now publish it.`,
      readStatus: false,
      createdAt: new Date().toISOString(),
      type: 'SUCCESS'
    });
    saveNotifications(notifs);

    return quizzes[idx];
  },

  async rejectQuiz(quizId: number, reason: string): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const idx = quizzes.findIndex(q => q.id === quizId);
    if (idx === -1) throw new Error('Quiz not found.');

    quizzes[idx].status = 'REJECTED';
    quizzes[idx].rejectionReason = reason;
    quizzes[idx].updatedAt = new Date().toISOString();
    saveQuizzes(quizzes);

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: Date.now(),
      userId: quizzes[idx].creatorId,
      title: 'Quiz Review Update',
      message: `Your quiz "${quizzes[idx].title}" requires changes: ${reason}`,
      readStatus: false,
      createdAt: new Date().toISOString(),
      type: 'WARNING'
    });
    saveNotifications(notifs);

    return quizzes[idx];
  },

  async publishQuiz(quizId: number): Promise<Quiz> {
    await delay();
    const quizzes = getStoredQuizzes();
    const idx = quizzes.findIndex(q => q.id === quizId);
    if (idx === -1) throw new Error('Quiz not found.');

    quizzes[idx].status = 'PUBLISHED';
    quizzes[idx].updatedAt = new Date().toISOString();
    saveQuizzes(quizzes);

    return quizzes[idx];
  },

  // ================= QUIZ ATTEMPTS & GRADING ENGINE =================
  async submitQuizAttempt(payload: {
    quizId: number;
    participantId: number;
    participantName: string;
    answers: { questionId: number; selectedAnswer: 'A' | 'B' | 'C' | 'D' | null }[];
    timeTakenSeconds: number;
  }): Promise<QuizAttempt> {
    await delay();
    const quizzes = getStoredQuizzes();
    const quiz = quizzes.find(q => q.id === payload.quizId);
    if (!quiz) throw new Error('Quiz not found.');

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalMarks = 0;
    let marksObtained = 0;

    const evaluatedAnswers: ParticipantAnswer[] = quiz.questions.map(q => {
      const mark = Number(q.marks) || 10;
      totalMarks += mark;

      const userAns = payload.answers.find(a => a.questionId === q.id)?.selectedAnswer || null;
      if (!userAns) {
        unansweredCount++;
        return {
          questionId: q.id,
          selectedAnswer: null,
          isCorrect: false,
          marksObtained: 0
        };
      }

      const isCorrect = userAns.toUpperCase() === q.correctAnswer.toUpperCase();
      if (isCorrect) {
        correctCount++;
        marksObtained += mark;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        selectedAnswer: userAns,
        isCorrect,
        marksObtained: isCorrect ? mark : 0
      };
    });

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const isPass = percentage >= quiz.passingPercentage;

    const attempt: QuizAttempt = {
      id: Date.now(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizCategory: quiz.category,
      participantId: payload.participantId,
      participantName: payload.participantName,
      score: marksObtained,
      totalMarks,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      timeTakenSeconds: payload.timeTakenSeconds,
      status: isPass ? 'PASS' : 'FAIL',
      submittedAt: new Date().toISOString(),
      answers: evaluatedAnswers
    };

    // Save attempt
    const attempts = getStoredAttempts();
    attempts.unshift(attempt);
    saveAttempts(attempts);

    // Increment quiz attempts count
    quiz.attemptsCount = (quiz.attemptsCount || 0) + 1;
    saveQuizzes(quizzes);

    return attempt;
  },

  async getAttemptById(attemptId: number): Promise<QuizAttempt> {
    await delay();
    const attempts = getStoredAttempts();
    const attempt = attempts.find(a => a.id === attemptId);
    if (!attempt) throw new Error('Attempt report not found.');
    return attempt;
  },

  async getAttemptsByParticipant(participantId: number): Promise<QuizAttempt[]> {
    await delay();
    return getStoredAttempts().filter(a => a.participantId === participantId);
  },

  async getAllAttempts(): Promise<QuizAttempt[]> {
    await delay();
    return getStoredAttempts();
  },

  async getAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]> {
    await delay();
    return getStoredAttempts().filter(a => a.quizId === quizId);
  },

  async addAttemptFeedback(attemptId: number, feedback: string): Promise<QuizAttempt> {
    await delay();
    const attempts = getStoredAttempts();
    const idx = attempts.findIndex(a => a.id === attemptId);
    if (idx === -1) throw new Error('Attempt not found.');

    attempts[idx].feedback = feedback;
    saveAttempts(attempts);
    return attempts[idx];
  },

  // ================= LEADERBOARD =================
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay();
    const users = getStoredUsers().filter(u => u.role === 'PARTICIPANT');
    const attempts = getStoredAttempts();

    const statsMap = new Map<number, { count: number; totalScore: number; passCount: number; points: number }>();

    attempts.forEach(att => {
      const curr = statsMap.get(att.participantId) || { count: 0, totalScore: 0, passCount: 0, points: 0 };
      curr.count += 1;
      curr.totalScore += att.percentage;
      if (att.status === 'PASS') curr.passCount += 1;
      curr.points += att.score;
      statsMap.set(att.participantId, curr);
    });

    const entries: LeaderboardEntry[] = users.map(user => {
      const stats = statsMap.get(user.id) || { count: 0, totalScore: 0, passCount: 0, points: 0 };
      const avgScore = stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0;
      const passRate = stats.count > 0 ? Math.round((stats.passCount / stats.count) * 100) : 0;

      return {
        rank: 0,
        participantId: user.id,
        participantName: user.name,
        quizzesCompleted: stats.count,
        averageScore: avgScore,
        totalPoints: stats.points,
        passRate
      };
    });

    // Sort by totalPoints desc, then avgScore desc
    entries.sort((a, b) => b.totalPoints - a.totalPoints || b.averageScore - a.averageScore);
    entries.forEach((e, idx) => (e.rank = idx + 1));

    return entries;
  },

  // ================= MESSAGES & CREATOR INTERACTION =================
  async getMessages(userId: number, role: Role): Promise<Message[]> {
    await delay();
    const messages = getStoredMessages();
    if (role === 'ADMIN') return messages;
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  },

  async sendMessage(data: {
    senderId: number;
    senderName: string;
    senderRole: Role;
    receiverId: number;
    receiverName: string;
    quizId?: number;
    quizTitle?: string;
    message: string;
    replyToId?: number;
  }): Promise<Message> {
    await delay();
    const messages = getStoredMessages();
    const newMsg: Message = {
      id: Date.now(),
      ...data,
      sentAt: new Date().toISOString(),
      readStatus: false
    };

    messages.unshift(newMsg);
    saveMessages(messages);

    // Notify receiver
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: Date.now(),
      userId: data.receiverId,
      title: 'New Message Received',
      message: `${data.senderName} sent you a message${data.quizTitle ? ` regarding "${data.quizTitle}"` : ''}.`,
      readStatus: false,
      createdAt: new Date().toISOString(),
      type: 'INFO'
    });
    saveNotifications(notifs);

    return newMsg;
  },

  // ================= REMINDERS =================
  async getReminders(participantId: number): Promise<Reminder[]> {
    await delay();
    return getStoredReminders().filter(r => r.participantId === participantId);
  },

  async createReminder(data: { participantId: number; quizId: number; quizTitle: string; reminderDate: string; reminderTime: string }): Promise<Reminder> {
    await delay();
    const reminders = getStoredReminders();
    const newReminder: Reminder = {
      id: Date.now(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    reminders.unshift(newReminder);
    saveReminders(reminders);
    return newReminder;
  },

  async toggleReminder(reminderId: number): Promise<Reminder> {
    await delay();
    const reminders = getStoredReminders();
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) throw new Error('Reminder not found.');

    reminders[idx].isActive = !reminders[idx].isActive;
    saveReminders(reminders);
    return reminders[idx];
  },

  async deleteReminder(reminderId: number): Promise<boolean> {
    await delay();
    let reminders = getStoredReminders();
    reminders = reminders.filter(r => r.id !== reminderId);
    saveReminders(reminders);
    return true;
  },

  // ================= SYSTEM SETTINGS =================
  async getSettings(): Promise<SystemSetting[]> {
    await delay();
    return getStoredSettings();
  },

  async updateSettings(settings: SystemSetting[]): Promise<SystemSetting[]> {
    await delay();
    saveSettings(settings);
    return settings;
  },

  // ================= NOTIFICATIONS =================
  async getNotifications(userId: number): Promise<Notification[]> {
    await delay();
    return getStoredNotifications().filter(n => n.userId === userId);
  },

  async markNotificationRead(id: number): Promise<void> {
    await delay();
    const notifs = getStoredNotifications();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].readStatus = true;
      saveNotifications(notifs);
    }
  },

  async clearAllNotifications(userId: number): Promise<void> {
    await delay();
    let notifs = getStoredNotifications();
    notifs = notifs.filter(n => n.userId !== userId);
    saveNotifications(notifs);
  }
};
