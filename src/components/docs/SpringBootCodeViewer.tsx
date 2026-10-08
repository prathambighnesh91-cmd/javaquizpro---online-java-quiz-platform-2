import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CodeSnippet } from '../common/CodeSnippet';
import { Copy, Check, Download, FileCode, Database, Server, Shield } from 'lucide-react';
import { useToast } from '../common/Toast';

interface SpringBootCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CodeFile {
  name: string;
  category: 'sql' | 'controller' | 'entity' | 'security' | 'config';
  language: string;
  description: string;
  content: string;
}

const SPRING_BOOT_FILES: CodeFile[] = [
  {
    name: 'schema.sql',
    category: 'sql',
    language: 'sql',
    description: 'Production MySQL schema with all 9 normalized relational tables, constraints, and indexes',
    content: `-- ========================================================
-- Java Online Quiz Platform - MySQL Database Schema
-- Compatible with MySQL 8.0+ and Spring Boot Data JPA
-- ========================================================

CREATE DATABASE IF NOT EXISTS java_quiz_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE java_quiz_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'QUIZ_CREATOR', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    passing_percentage INT NOT NULL DEFAULT 60,
    creator_id BIGINT NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_status (status),
    INDEX idx_quiz_category (category)
) ENGINE=InnoDB;

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    explanation TEXT,
    marks INT NOT NULL DEFAULT 10,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_question_quiz (quiz_id)
) ENGINE=InnoDB;

-- 4. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL DEFAULT 0,
    percentage INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    unanswered INT NOT NULL DEFAULT 0,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    status ENUM('PASS', 'FAIL') NOT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_participant FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attempt_participant (participant_id)
) ENGINE=InnoDB;

-- 5. PARTICIPANT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS participant_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer ENUM('A', 'B', 'C', 'D'),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    marks_obtained INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    quiz_id BIGINT,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    reply_to_id BIGINT,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rem_participant FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rem_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) DEFAULT 'INFO',
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;`
  },
  {
    name: 'QuizController.java',
    category: 'controller',
    language: 'java',
    description: 'Spring Boot REST Controller handling Quiz CRUD, admin approvals, and question submissions',
    content: `package com.javaquizpro.controller;

import com.javaquizpro.dto.QuizRequest;
import com.javaquizpro.dto.QuizResponse;
import com.javaquizpro.entity.Quiz;
import com.javaquizpro.entity.QuizStatus;
import com.javaquizpro.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getPublishedQuizzes(
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(quizService.getQuizzesByStatusAndCategory(QuizStatus.PUBLISHED, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUIZ_CREATOR', 'ADMIN')")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUIZ_CREATOR', 'ADMIN')")
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long id, @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUIZ_CREATOR', 'ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/submit-approval")
    @PreAuthorize("hasRole('QUIZ_CREATOR')")
    public ResponseEntity<QuizResponse> submitForApproval(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.changeStatus(id, QuizStatus.PENDING, null));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizResponse> approveQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.changeStatus(id, QuizStatus.APPROVED, null));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizResponse> rejectQuiz(
            @PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(quizService.changeStatus(id, QuizStatus.REJECTED, reason));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('QUIZ_CREATOR', 'ADMIN')")
    public ResponseEntity<QuizResponse> publishQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.changeStatus(id, QuizStatus.PUBLISHED, null));
    }
}`
  },
  {
    name: 'SecurityConfig.java',
    category: 'security',
    language: 'java',
    description: 'Spring Security 6 & JWT filter chain enforcing role-based permissions (BCrypt & RBAC)',
    content: `package com.javaquizpro.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/quizzes/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/creator/**").hasAnyRole("QUIZ_CREATOR", "ADMIN")
                .requestMatchers("/api/participant/**").hasAnyRole("PARTICIPANT", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`
  },
  {
    name: 'pom.xml',
    category: 'config',
    language: 'xml',
    description: 'Maven dependencies configuration with Spring Boot 3, Spring Data JPA, MySQL Connector, and JJWT',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.javaquizpro</groupId>
    <artifactId>java-quiz-platform</artifactId>
    <version>1.0.0-RELEASE</version>
    <name>JavaQuizPro</name>
    <description>College Major Project - Online Java Quiz & Assessment Platform</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.11.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web MVC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Spring Security & BCrypt -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- MySQL Connector -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JJWT for JWT Token Authentication -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok for clean getters/setters -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  }
];

export const SpringBootCodeViewer: React.FC<SpringBootCodeViewerProps> = ({ isOpen, onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const currentFile = SPRING_BOOT_FILES[selectedFileIdx];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    showToast(`Copied ${currentFile.name} to clipboard.`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${currentFile.name}`, 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Java Spring Boot & MySQL Production Source Code"
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-600 leading-relaxed">
          The following backend artifacts provide the complete, idiomatic <strong>Java 17 / Spring Boot 3</strong> and <strong>MySQL 8.0</strong> architecture for submission as a college major project.
        </p>

        {/* File Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {SPRING_BOOT_FILES.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setSelectedFileIdx(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                selectedFileIdx === idx
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.category === 'sql' ? (
                <Database className="w-3.5 h-3.5 text-amber-400" />
              ) : f.category === 'security' ? (
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* File Header Details & Action Buttons */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <div>
            <div className="font-bold text-slate-900 font-mono text-sm">{currentFile.name}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">{currentFile.description}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="max-h-[50vh] overflow-y-auto rounded-lg">
          <CodeSnippet code={currentFile.content} language={currentFile.language} />
        </div>
      </div>
    </Modal>
  );
};
