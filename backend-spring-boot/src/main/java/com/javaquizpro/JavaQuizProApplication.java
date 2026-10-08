package com.javaquizpro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JavaQuizProApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaQuizProApplication.class, args);
        System.out.println("JavaQuizPro Platform Backend successfully started on port 8080!");
    }
}
