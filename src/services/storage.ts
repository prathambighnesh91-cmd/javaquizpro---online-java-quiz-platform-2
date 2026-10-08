import { Quiz, User, QuizAttempt, Message, Reminder, SystemSetting, Notification } from '../types';

const USERS_KEY = 'javaquiz_users_v1';
const QUIZZES_KEY = 'javaquiz_quizzes_v1';
const ATTEMPTS_KEY = 'javaquiz_attempts_v1';
const MESSAGES_KEY = 'javaquiz_messages_v1';
const REMINDERS_KEY = 'javaquiz_reminders_v1';
const SETTINGS_KEY = 'javaquiz_settings_v1';
const NOTIFICATIONS_KEY = 'javaquiz_notifications_v1';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Admin Moderator',
    email: 'admin@example.com',
    password: 'password123', // Demo bcrypt hashed equivalent
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-10T09:00:00.000Z',
    avatarUrl: '/src/assets/images/avatar_demo_user_1790624895982.jpg'
  },
  {
    id: 2,
    name: 'Prof. Sarah Jenkins',
    email: 'creator@example.com',
    password: 'password123',
    role: 'QUIZ_CREATOR',
    status: 'ACTIVE',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 3,
    name: 'Alex Rivera',
    email: 'student@example.com',
    password: 'password123',
    role: 'PARTICIPANT',
    status: 'ACTIVE',
    createdAt: '2026-02-01T14:15:00.000Z'
  },
  {
    id: 4,
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    password: 'password123',
    role: 'PARTICIPANT',
    status: 'ACTIVE',
    createdAt: '2026-02-05T11:20:00.000Z'
  },
  {
    id: 5,
    name: 'David Kumar',
    email: 'david.kumar@example.com',
    password: 'password123',
    role: 'PARTICIPANT',
    status: 'ACTIVE',
    createdAt: '2026-02-12T16:45:00.000Z'
  },
  {
    id: 6,
    name: 'Dr. Robert Torres',
    email: 'robert.torres@example.com',
    password: 'password123',
    role: 'QUIZ_CREATOR',
    status: 'ACTIVE',
    createdAt: '2026-01-20T08:00:00.000Z'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 101,
    title: 'Java Fundamentals & Primitive Types',
    description: 'Master core Java memory models, primitive data types, default values, variable scopes, and operator precedence.',
    category: 'Java Basics',
    durationMinutes: 10,
    passingPercentage: 60,
    creatorId: 2,
    creatorName: 'Prof. Sarah Jenkins',
    status: 'PUBLISHED',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-12T14:00:00.000Z',
    totalMarks: 50,
    attemptsCount: 24,
    questions: [
      {
        id: 1,
        questionText: 'What is the default initial value of an uninitialized instance variable of type int in Java?',
        codeSnippet: `public class Example {\n    int count;\n    public void print() {\n        System.out.println(count);\n    }\n}`,
        optionA: '0',
        optionB: '1',
        optionC: 'null',
        optionD: 'undefined',
        correctAnswer: 'A',
        explanation: 'In Java, uninitialized instance variables of numeric primitive types (byte, short, int, long) default to 0.',
        marks: 10
      },
      {
        id: 2,
        questionText: 'What will be printed when executing the following snippet?',
        codeSnippet: `int a = 5;\nint b = a++ + ++a;\nSystem.out.println(b);`,
        optionA: '11',
        optionB: '12',
        optionC: '10',
        optionD: '13',
        correctAnswer: 'B',
        explanation: 'a++ evaluates to 5 and a becomes 6. Then ++a increments a to 7 and evaluates to 7. 5 + 7 = 12.',
        marks: 10
      },
      {
        id: 3,
        questionText: 'Which of the following is NOT a reserved keyword in Java?',
        optionA: 'transient',
        optionB: 'volatile',
        optionC: 'sizeof',
        optionD: 'strictfp',
        correctAnswer: 'C',
        explanation: 'Unlike C/C++, sizeof is not an operator or keyword in Java because primitive sizes are strictly defined across all platforms.',
        marks: 10
      },
      {
        id: 4,
        questionText: 'What is the memory size allocated for a double primitive type in 64-bit Java?',
        optionA: '32 bits (4 bytes)',
        optionB: '64 bits (8 bytes)',
        optionC: '128 bits (16 bytes)',
        optionD: 'Depends on the host OS architecture',
        correctAnswer: 'B',
        explanation: 'According to the Java Language Specification, a double is always 64 bits (8 bytes) IEEE 754 floating point format regardless of hardware.',
        marks: 10
      },
      {
        id: 5,
        questionText: 'What is the result of comparing two String literals with "==" versus ".equals()"?',
        codeSnippet: `String s1 = "Java";\nString s2 = new String("Java");\nSystem.out.println((s1 == s2) + " " + s1.equals(s2));`,
        optionA: 'true true',
        optionB: 'false false',
        optionC: 'false true',
        optionD: 'true false',
        correctAnswer: 'C',
        explanation: '== compares memory references (s1 is in the String constant pool, s2 is a separate heap object), while equals() compares text content.',
        marks: 10
      }
    ]
  },
  {
    id: 102,
    title: 'Object-Oriented Programming & Polymorphism in Java',
    description: 'Comprehensive test on inheritance, interface contracts, abstract classes, method overriding, super keyword, and dynamic dispatch.',
    category: 'OOP in Java',
    durationMinutes: 15,
    passingPercentage: 70,
    creatorId: 2,
    creatorName: 'Prof. Sarah Jenkins',
    status: 'PUBLISHED',
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-02-16T09:30:00.000Z',
    totalMarks: 50,
    attemptsCount: 18,
    questions: [
      {
        id: 6,
        questionText: 'Can a constructor in Java be declared final, synchronized, or static?',
        optionA: 'Yes, a constructor can be marked as final.',
        optionB: 'Yes, a constructor can be synchronized for thread safety.',
        optionC: 'No, constructors cannot be final, static, abstract, or synchronized.',
        optionD: 'Only private constructors can be static.',
        correctAnswer: 'C',
        explanation: 'Constructors initialize object instances and cannot be inherited (hence cannot be final or abstract), cannot belong to the class level (not static), and are inherently single-threaded per invocation.',
        marks: 10
      },
      {
        id: 7,
        questionText: 'What is output by the following dynamic method dispatch code?',
        codeSnippet: `class Base {\n    void display() { System.out.print("Base "); }\n}\nclass Derived extends Base {\n    void display() { System.out.print("Derived "); }\n}\npublic class Test {\n    public static void main(String[] args) {\n        Base obj = new Derived();\n        obj.display();\n    }\n}`,
        optionA: 'Base',
        optionB: 'Derived',
        optionC: 'Base Derived',
        optionD: 'Compilation Error',
        correctAnswer: 'B',
        explanation: 'In Java, virtual method invocation resolves at runtime based on the actual object type in heap memory (Derived), executing Derived.display().',
        marks: 10
      },
      {
        id: 8,
        questionText: 'Which statement accurately describes default methods in Java 8+ interfaces?',
        optionA: 'They allow interfaces to maintain private instance state variables.',
        optionB: 'They provide backward compatibility by allowing concrete methods inside interfaces using the "default" keyword.',
        optionC: 'They must be explicitly re-implemented by every implementing class.',
        optionD: 'They cannot be overridden by implementing subclasses.',
        correctAnswer: 'B',
        explanation: 'Default methods permit interface evolution without breaking existing implementations, providing a fallback implementation.',
        marks: 10
      },
      {
        id: 9,
        questionText: 'What occurs when an overriding method in a subclass attempts to declare a broader checked exception than the superclass method?',
        optionA: 'Subclass method compiles successfully with runtime exception.',
        optionB: 'Compilation error: an overridden method cannot throw broader checked exceptions.',
        optionC: 'Superclass method is automatically converted to unchecked exception.',
        optionD: 'JVM suppresses the checked exception during invocation.',
        correctAnswer: 'B',
        explanation: 'Subclasses cannot declare new or broader checked exceptions than those declared by the overridden superclass method.',
        marks: 10
      },
      {
        id: 10,
        questionText: 'Which keyword prevents an entire class from being extended by any other class in Java?',
        optionA: 'sealed',
        optionB: 'static',
        optionC: 'final',
        optionD: 'const',
        correctAnswer: 'C',
        explanation: 'The final keyword applied to a class declaration completely prevents inheritance (e.g. public final class String).',
        marks: 10
      }
    ]
  },
  {
    id: 103,
    title: 'Collections Framework & Generics Deep-Dive',
    description: 'Assess understanding of ArrayList vs LinkedList, HashMap collisions, TreeMap balancing, Set uniqueness, and wildcard bounds.',
    category: 'Collections',
    durationMinutes: 12,
    passingPercentage: 65,
    creatorId: 6,
    creatorName: 'Dr. Robert Torres',
    status: 'PUBLISHED',
    createdAt: '2026-02-18T14:00:00.000Z',
    updatedAt: '2026-02-20T12:00:00.000Z',
    totalMarks: 40,
    attemptsCount: 15,
    questions: [
      {
        id: 11,
        questionText: 'In Java 8+, how does HashMap handle severe hash bucket collision when a single bucket exceeds the TREEIFY_THRESHOLD (8 entries)?',
        optionA: 'It throws a ConcurrentModificationException.',
        optionB: 'It transforms the bucket linked list into a balanced Red-Black Tree to guarantee O(log n) lookup.',
        optionC: 'It doubles the bucket capacity and purges oldest keys.',
        optionD: 'It switches the map algorithm to open addressing linear probing.',
        correctAnswer: 'B',
        explanation: 'When a bucket chain length reaches 8 and total capacity >= 64, HashMap converts the linked list bucket to a TreeNode Red-Black tree to prevent worst-case O(n) attacks.',
        marks: 10
      },
      {
        id: 12,
        questionText: 'Which Collection interface implementation guarantees insertion-order iteration of unique elements?',
        optionA: 'HashSet',
        optionB: 'TreeSet',
        optionC: 'LinkedHashSet',
        optionD: 'ConcurrentSkipListSet',
        correctAnswer: 'C',
        explanation: 'LinkedHashSet maintains a doubly-linked list running through all of its elements, preserving insertion order while enforcing Set uniqueness.',
        marks: 10
      },
      {
        id: 13,
        questionText: 'Which contract MUST be preserved when overriding the equals() method in a Java custom class?',
        optionA: 'hashCode() must be overridden so equal objects always produce identical hash codes.',
        optionB: 'clone() must be implemented.',
        optionC: 'The class must implement Comparable interface.',
        optionD: 'toString() must return a hexadecimal memory address.',
        correctAnswer: 'A',
        explanation: 'The Java Object contract dictates that if obj1.equals(obj2) is true, then obj1.hashCode() must equal obj2.hashCode().',
        marks: 10
      },
      {
        id: 14,
        questionText: 'What is the effect of the generic wildcard declaration "List<? extends Number>"?',
        optionA: 'You can freely add any Integer or Double to the list.',
        optionB: 'Producer Extends Consumer Super (PECS): You can safely read Numbers from the list, but cannot write (except null).',
        optionC: 'The list can only hold primitive numbers.',
        optionD: 'The list allows mutating elements via index replacement only.',
        correctAnswer: 'B',
        explanation: 'List<? extends Number> represents covariance: you know every item is at least a Number (safe to read), but the exact subtype is unknown, so writing new items is prohibited.',
        marks: 10
      }
    ]
  },
  {
    id: 104,
    title: 'Multithreading & Concurrency in Modern Java',
    description: 'Evaluate synchronization, volatile semantics, ExecutorService, ReentrantLock, and thread-safe data structures.',
    category: 'Multithreading',
    durationMinutes: 15,
    passingPercentage: 60,
    creatorId: 2,
    creatorName: 'Prof. Sarah Jenkins',
    status: 'PENDING',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    totalMarks: 30,
    attemptsCount: 0,
    questions: [
      {
        id: 15,
        questionText: 'What memory visibility guarantee is provided by the "volatile" keyword in Java?',
        optionA: 'Atomicity of compound operations like count++.',
        optionB: 'Reads and writes to the variable are directly synchronized with main memory, preventing thread-local CPU caching.',
        optionC: 'Exclusive monitor locking on the surrounding class.',
        optionD: 'Automatic thread scheduling priority boost.',
        correctAnswer: 'B',
        explanation: 'Volatile guarantees happens-before memory visibility across threads, ensuring a write by one thread is immediately visible to others without CPU cache staleness.',
        marks: 10
      },
      {
        id: 16,
        questionText: 'Which class provides lock-free, atomic thread-safe integer operations using hardware compare-and-swap (CAS)?',
        optionA: 'AtomicInteger',
        optionB: 'IntegerSynchronized',
        optionC: 'VolatileInt',
        optionD: 'ConcurrentInteger',
        correctAnswer: 'A',
        explanation: 'java.util.concurrent.atomic.AtomicInteger uses low-level native CAS (Compare-And-Swap) instructions for lock-free thread safety.',
        marks: 10
      },
      {
        id: 17,
        questionText: 'What is the key difference between Runnable and Callable<V> interfaces?',
        optionA: 'Runnable runs in daemon threads only.',
        optionB: 'Callable can return a computed result and throw checked exceptions, whereas Runnable cannot.',
        optionC: 'Callable cannot be submitted to ExecutorService.',
        optionD: 'Runnable has higher execution priority.',
        correctAnswer: 'B',
        explanation: 'Callable.call() returns a value of generic type V and can throw Exception; Runnable.run() returns void and cannot throw checked exceptions.',
        marks: 10
      }
    ]
  },
  {
    id: 105,
    title: 'Java Exception Handling & Robust Systems',
    description: 'Test mastery of checked vs unchecked exceptions, try-with-resources, AutoCloseable, and multi-catch blocks.',
    category: 'Exception Handling',
    durationMinutes: 10,
    passingPercentage: 70,
    creatorId: 6,
    creatorName: 'Dr. Robert Torres',
    status: 'APPROVED',
    createdAt: '2026-02-25T15:00:00.000Z',
    updatedAt: '2026-02-27T10:00:00.000Z',
    totalMarks: 30,
    attemptsCount: 0,
    questions: [
      {
        id: 18,
        questionText: 'Which base class must a custom exception extend to be treated as an UNCHECKED (runtime) exception?',
        optionA: 'java.lang.Exception',
        optionB: 'java.lang.RuntimeException',
        optionC: 'java.lang.Throwable',
        optionD: 'java.lang.Error',
        correctAnswer: 'B',
        explanation: 'Subclasses of RuntimeException are unchecked; methods are not required to catch or declare them in throws clauses.',
        marks: 10
      },
      {
        id: 19,
        questionText: 'What interface must a resource class implement to be safely managed inside a Java try-with-resources block?',
        optionA: 'java.io.Serializable',
        optionB: 'java.lang.AutoCloseable',
        optionC: 'java.util.concurrent.Callable',
        optionD: 'java.lang.Cleanable',
        correctAnswer: 'B',
        explanation: 'Try-with-resources automatically closes any resource that implements java.lang.AutoCloseable or java.io.Closeable.',
        marks: 10
      },
      {
        id: 20,
        questionText: 'In a try-catch-finally construct, what happens if System.exit(0) is called inside the try block?',
        optionA: 'The finally block executes immediately before shutdown.',
        optionB: 'The finally block does NOT execute as the JVM halts.',
        optionC: 'An ExitInterruptedException is thrown.',
        optionD: 'Execution jumps to the catch block.',
        correctAnswer: 'B',
        explanation: 'System.exit() terminates JVM execution immediately, bypassing finally blocks and normal cleanup.',
        marks: 10
      }
    ]
  }
];

export const INITIAL_ATTEMPTS: QuizAttempt[] = [
  {
    id: 1001,
    quizId: 101,
    quizTitle: 'Java Fundamentals & Primitive Types',
    quizCategory: 'Java Basics',
    participantId: 3,
    participantName: 'Alex Rivera',
    score: 40,
    totalMarks: 50,
    percentage: 80,
    correctAnswers: 4,
    wrongAnswers: 1,
    unanswered: 0,
    timeTakenSeconds: 385,
    status: 'PASS',
    submittedAt: '2026-02-14T15:30:00.000Z',
    feedback: 'Excellent grasp of primitive types and String constant pool memory semantics!',
    answers: [
      { questionId: 1, selectedAnswer: 'A', isCorrect: true, marksObtained: 10 },
      { questionId: 2, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 3, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 },
      { questionId: 4, selectedAnswer: 'A', isCorrect: false, marksObtained: 0 },
      { questionId: 5, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 }
    ]
  },
  {
    id: 1002,
    quizId: 102,
    quizTitle: 'Object-Oriented Programming & Polymorphism in Java',
    quizCategory: 'OOP in Java',
    participantId: 3,
    participantName: 'Alex Rivera',
    score: 50,
    totalMarks: 50,
    percentage: 100,
    correctAnswers: 5,
    wrongAnswers: 0,
    unanswered: 0,
    timeTakenSeconds: 520,
    status: 'PASS',
    submittedAt: '2026-02-18T16:45:00.000Z',
    feedback: 'Flawless performance on dynamic dispatch and exception inheritance rules!',
    answers: [
      { questionId: 6, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 },
      { questionId: 7, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 8, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 9, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 10, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 }
    ]
  },
  {
    id: 1003,
    quizId: 101,
    quizTitle: 'Java Fundamentals & Primitive Types',
    quizCategory: 'Java Basics',
    participantId: 4,
    participantName: 'Emily Chen',
    score: 50,
    totalMarks: 50,
    percentage: 100,
    correctAnswers: 5,
    wrongAnswers: 0,
    unanswered: 0,
    timeTakenSeconds: 310,
    status: 'PASS',
    submittedAt: '2026-02-15T11:20:00.000Z',
    answers: [
      { questionId: 1, selectedAnswer: 'A', isCorrect: true, marksObtained: 10 },
      { questionId: 2, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 3, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 },
      { questionId: 4, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 5, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 }
    ]
  },
  {
    id: 1004,
    quizId: 103,
    quizTitle: 'Collections Framework & Generics Deep-Dive',
    quizCategory: 'Collections',
    participantId: 5,
    participantName: 'David Kumar',
    score: 30,
    totalMarks: 40,
    percentage: 75,
    correctAnswers: 3,
    wrongAnswers: 1,
    unanswered: 0,
    timeTakenSeconds: 440,
    status: 'PASS',
    submittedAt: '2026-02-22T14:10:00.000Z',
    answers: [
      { questionId: 11, selectedAnswer: 'B', isCorrect: true, marksObtained: 10 },
      { questionId: 12, selectedAnswer: 'C', isCorrect: true, marksObtained: 10 },
      { questionId: 13, selectedAnswer: 'A', isCorrect: true, marksObtained: 10 },
      { questionId: 14, selectedAnswer: 'A', isCorrect: false, marksObtained: 0 }
    ]
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    senderId: 3,
    senderName: 'Alex Rivera',
    senderRole: 'PARTICIPANT',
    receiverId: 2,
    receiverName: 'Prof. Sarah Jenkins',
    quizId: 101,
    quizTitle: 'Java Fundamentals & Primitive Types',
    message: 'Hello Professor! For Question 4 regarding double size, does 64-bit JVM refer to hardware pointer size or IEEE representation?',
    sentAt: '2026-02-14T16:00:00.000Z',
    readStatus: true
  },
  {
    id: 2,
    senderId: 2,
    senderName: 'Prof. Sarah Jenkins',
    senderRole: 'QUIZ_CREATOR',
    receiverId: 3,
    receiverName: 'Alex Rivera',
    quizId: 101,
    quizTitle: 'Java Fundamentals & Primitive Types',
    message: 'Great question Alex! In Java, IEEE 754 float/double bit sizes are guaranteed by the JVM specification, so double is 64 bits regardless of 32-bit or 64-bit OS architectures.',
    sentAt: '2026-02-14T17:15:00.000Z',
    readStatus: true,
    replyToId: 1
  }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 1,
    participantId: 3,
    quizId: 103,
    quizTitle: 'Collections Framework & Generics Deep-Dive',
    reminderDate: '2026-03-30',
    reminderTime: '15:00',
    isActive: true,
    createdAt: '2026-02-28T10:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: SystemSetting[] = [
  { id: 1, settingName: 'website_name', settingValue: 'Java Quiz Platform', description: 'Platform display brand name' },
  { id: 2, settingName: 'default_duration_minutes', settingValue: '15', description: 'Default quiz duration in minutes' },
  { id: 3, settingName: 'max_questions_per_quiz', settingValue: '25', description: 'Maximum questions allowed per assessment' },
  { id: 4, settingName: 'default_passing_percentage', settingValue: '60', description: 'Default passing percentage threshold' },
  { id: 5, settingName: 'allow_registration', settingValue: 'true', description: 'Allow new user self-registration' },
  { id: 6, settingName: 'enable_leaderboard', settingValue: 'true', description: 'Public competitive leaderboard view' },
  { id: 7, settingName: 'enable_notifications', settingValue: 'true', description: 'Broadcast alert system' },
  { id: 8, settingName: 'maintenance_mode', settingValue: 'false', description: 'Put platform in read-only maintenance' }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    userId: 1,
    title: 'New Quiz Submitted',
    message: 'Prof. Sarah Jenkins submitted "Multithreading & Concurrency in Modern Java" for approval.',
    readStatus: false,
    createdAt: '2026-03-01T09:05:00.000Z',
    type: 'INFO'
  },
  {
    id: 2,
    userId: 1,
    title: 'New Participant Registration',
    message: 'David Kumar registered as a new Participant.',
    readStatus: true,
    createdAt: '2026-02-12T16:46:00.000Z',
    type: 'SUCCESS'
  },
  {
    id: 3,
    userId: 2,
    title: 'Quiz Approved',
    message: 'Admin approved your quiz "Object-Oriented Programming & Polymorphism in Java".',
    readStatus: true,
    createdAt: '2026-02-16T10:00:00.000Z',
    type: 'SUCCESS'
  }
];

// Helper functions for storage persistence
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStoredQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (!raw) {
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(INITIAL_QUIZZES));
      return INITIAL_QUIZZES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUIZZES;
  }
}

export function saveQuizzes(quizzes: Quiz[]): void {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}

export function getStoredAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_ATTEMPTS));
      return INITIAL_ATTEMPTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ATTEMPTS;
  }
}

export function saveAttempts(attempts: QuizAttempt[]): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getStoredMessages(): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getStoredReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function getStoredSettings(): SystemSetting[] {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SystemSetting[]): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getStoredNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function resetAllToDefault(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(INITIAL_QUIZZES));
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_ATTEMPTS));
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(INITIAL_REMINDERS));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
}
