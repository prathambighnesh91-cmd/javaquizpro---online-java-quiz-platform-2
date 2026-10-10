# JavaQuizPro - Modern Java-Based Online Quiz Platform

[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

A modern, responsive, full-stack online assessment and learning platform focused on **Java programming**. Built as a comprehensive college major project, this system implements multi-role authentication and authorization, an exam-grade timed quiz engine with auto-submission, live performance analytics with Chart.js, instructor feedback channels, and real-time competitive leaderboards.

---

## 1. Key Features

### Role-Based Access Control (RBAC)
* **Administrator**:
  * Complete User Management (Create, View, Edit, Delete, Toggle Active/Inactive status, Search, Filter by role).
  * Quiz Approval Workflow (Review submissions from instructors, Approve, Reject with detailed feedback reason, Publish live, Delete).
  * System Configuration Settings (Site branding, default time limits, question caps, pass thresholds, self-registration toggle).
  * System-wide Analytics (Pass/fail ratios, category engagement, registration distribution using Chart.js).
  * Platform Notifications and Alerts.
* **Quiz Creator (Instructor)**:
  * Intuitive Quiz Authoring Studio supporting Java code snippets with syntax formatting.
  * Quiz lifecycle management (Draft -> Submit to Admin -> Approved -> Published).
  * Detailed submissions viewer with student answer analysis.
  * Direct instructor feedback delivery to participant attempts.
  * Direct participant Q&A messaging panel.
* **Participant (Student)**:
  * Timed Quiz Engine with live countdown timer (`MM:SS`) and auto-submission on expiry.
  * Interactive question palette navigator (Answered, Unanswered, Current, Flagged).
  * Instant post-quiz scoring (Total Marks, Percentage, Correct/Wrong/Unanswered, Pass/Fail status).
  * Comprehensive question-by-question performance review with Java code snippets and authoritative explanations.
  * Interactive Chart.js analytics for score progress and accuracy breakdown.
  * Competitive community leaderboard highlighting student rank and points.
  * Quiz reminders scheduler with alert dates and times.
  * Inquiry messenger to communicate directly with quiz authors.

---

## 2. Technology Stack

### Backend
* **Language**: Java 17 LTS
* **Framework**: Spring Boot 3.2.3, Spring MVC, Spring Data JPA
* **Security**: Spring Security 6, BCrypt Password Encoder, JJWT (JSON Web Token)
* **Build Tool**: Maven 3.8+
* **Database**: MySQL 8.0+

### Frontend
* **UI Library**: React 19 (Functional components & Hooks)
* **Styling**: Tailwind CSS v4, Lucide React icons
* **Charting**: Chart.js 4 & React-Chartjs-2
* **Animations**: Canvas Confetti

---

## 3. Demo Login Credentials

The application comes pre-seeded with sample data across all roles for immediate testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password123` | Full administrative control, user moderation, quiz approvals |
| **Quiz Creator** | `creator@example.com` | `password123` | Author quizzes, view submissions, reply to students |
| **Participant** | `student@example.com` | `password123` | Take timed quizzes, view reports, track progress |

*Note: You can also register a new Participant or Quiz Creator account directly on the registration page, or use the 1-click Quick Role Switcher in the top navigation bar.*

---

## 4. Database Setup (MySQL)

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or CLI) and run the script:
   ```bash
   mysql -u root -p < backend-spring-boot/src/main/resources/schema.sql
   ```
2. The script creates the `java_quiz_db` database and normalized tables:
   * `users`
   * `quizzes`
   * `questions`
   * `quiz_attempts`
   * `participant_answers`
   * `messages`
   * `reminders`
   * `system_settings`
   * `notifications`

---

## 5. How to Run the Application Locally

### Running the Frontend
1. Ensure Node.js (v18+) is installed.
2. Install dependencies:
   ```bash
   npm install react-is --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.

### Running the Spring Boot Backend (Optional / Standalone)
1. Ensure JDK 17+ and Maven are installed:
   ```bash
   java -version
   mvn -version
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend-spring-boot
   ```
3. Configure `src/main/resources/application.properties` with your MySQL credentials.
4. Build and start the Spring Boot server:
   ```bash
   mvn clean spring-boot:run
   ```
5. The REST API will be accessible on `http://localhost:8080/api`.

---

## 6. REST API Endpoints Specification

### Authentication
* `POST /api/auth/register` — Register a new Participant or Quiz Creator
* `POST /api/auth/login` — Authenticate and receive JWT token

### Quizzes
* `GET /api/quizzes` — Get published quizzes (optional category filter)
* `GET /api/quizzes/{id}` — Get quiz details and questions
* `POST /api/quizzes` — Create new quiz (Creator/Admin)
* `PUT /api/quizzes/{id}` — Update quiz
* `DELETE /api/quizzes/{id}` — Delete quiz
* `PUT /api/quizzes/{id}/submit-approval` — Submit draft for admin review
* `PUT /api/quizzes/{id}/publish` — Publish approved quiz

### Admin Management
* `GET /api/admin/users` — List all registered users
* `POST /api/admin/users` — Add a new user
* `PUT /api/admin/users/{id}` — Update user details or status
* `DELETE /api/admin/users/{id}` — Remove user
* `PUT /api/admin/quizzes/{id}/approve` — Approve quiz submission
* `PUT /api/admin/quizzes/{id}/reject?reason=...` — Reject quiz with feedback

### Quiz Attempts & Engine
* `POST /api/attempts/submit` — Submit quiz attempt for automatic grading
* `GET /api/attempts/{id}` — Get detailed attempt report with question breakdown
* `GET /api/participants/{id}/attempts` — Get history of attempts by participant

---

## 7. Project Architecture

```
java-quiz-platform/
├── backend-spring-boot/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/javaquizpro/
│           │   ├── JavaQuizProApplication.java
│           │   ├── controller/
│           │   ├── entity/
│           │   ├── repository/
│           │   ├── service/
│           │   └── security/
│           └── resources/
│               ├── application.properties
│               └── schema.sql
├── src/
│   ├── components/
│   │   ├── auth/          # Login & Register views
│   │   ├── charts/        # Chart.js Bar, Line, and Doughnut charts
│   │   ├── common/        # Navbar, Sidebar, Toast, Modal, CodeSnippet
│   │   ├── dashboards/    # Admin, Quiz Creator, and Participant views
│   │   ├── docs/          # In-app Spring Boot & SQL source code inspector
│   │   ├── landing/       # Responsive Landing Page
│   │   └── quiz/          # Timed Quiz engine & Question analysis view
│   ├── context/           # AuthContext & Session management
│   ├── services/          # REST API Client & persistent storage engine
│   ├── types/             # TypeScript interfaces & Enums
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```
# javaquizpro---online-java-quiz-platform-2
# Java-Quiz
