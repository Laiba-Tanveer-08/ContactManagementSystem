# 📇 Contact Management System

A full-stack web application I built to manage contacts in one place. Users can create an account, log in securely and manage their contact list with features like search, pagination, editing, and detailed contact profiles.

The backend is built with Spring Boot and SQL Server while the frontend uses React.js for a responsive user experience. Authentication is handled using JWT tokens to keep user data secure.

<img width="1080" height="1080" alt="image" src="https://github.com/user-attachments/assets/4deb4ef6-247a-47ba-85c6-b2b05387524b" />

<img width="1080" height="1080" alt="image" src="https://github.com/user-attachments/assets/0c317f35-bdc2-431a-91bc-64a935d2a924" />

<img width="1080" height="1080" alt="image" src="https://github.com/user-attachments/assets/25f1b509-8178-492c-ade5-3968b56ec909" />

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Data JPA + Hibernate
* Spring Security + JWT
* SQL Server
* SLF4J + Logback
* JUnit 5 + Mockito
* SonarQube

### Frontend

* React.js 18
* React Router
* Axios

---

## 🚀 Features

### 🔐 Authentication

* Register using email or phone number
* Secure login with JWT authentication
* Passwords are encrypted before storage
* Change password from profile page
* Logout functionality

### 👥 Contact Management

* Add new contacts
* Edit existing contacts
* Delete contacts
* Search contacts by first or last name
* View detailed contact profiles
* Paginated contact list (10 contacts per page)

### 📞 Contact Information

Each contact can contain:

* First name
* Last name
* Title
* Multiple email addresses (Work, Personal, etc.)
* Multiple phone numbers (Home, Work, Mobile, etc.)

### ⚡ Additional Features

* Import contacts from CSV files
* Export contacts to CSV files
* Global exception handling
* Meaningful error messages
* Application-wide logging
* DTO-based API structure
* Unit testing with JUnit and Mockito

---

## 📂 Project Structure

```text
ContactManagementProject/
├── backend/
│   └── src/
│       ├── main/java/com/laiba/backend/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── mapper/
│       │   ├── repository/
│       │   └── service/
│       └── test/
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

## ⚙️ Getting Started

### Prerequisites

Before running the project, make sure you have:

* Java 17
* Node.js (v18 or later)
* SQL Server Express
* Maven (or Maven Wrapper)

---

## 🗄️ Database Setup

Create the database:

```sql
CREATE DATABASE contactmanagementdb;
```

Create a login and user:

```sql
CREATE LOGIN springuser WITH PASSWORD = 'Spring@12345';

USE contactmanagementdb;

CREATE USER springuser FOR LOGIN springuser;

ALTER ROLE db_owner ADD MEMBER springuser;
```

Hibernate is configured with `ddl-auto=update`, so all required tables will be created automatically when the application starts.

---

## ▶️ Running the Application

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

**Windows**

```bash
mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint                                  | Description            |
| ------ | ----------------------------------------- | ---------------------- |
| POST   | `/api/auth/register`                      | Register a new user    |
| POST   | `/api/auth/login`                         | Login                  |
| GET    | `/api/contact/getcontacts?page=0&size=10` | Get paginated contacts |
| GET    | `/api/contact/{id}`                       | Get contact details    |
| GET    | `/api/contact/search?name=xyz`            | Search contacts        |
| POST   | `/api/contact/addcontact`                 | Create contact         |
| PUT    | `/api/contact/update/{id}`                | Update contact         |
| DELETE | `/api/contact/delete/{id}`                | Delete contact         |

> All contact endpoints require a valid JWT token.

---

## 🧪 Testing

Run backend tests:

```bash
cd backend
./mvnw test
```

The test suite covers:

* Controllers
* Services
* Repositories
* JWT functionality
* Security configuration
* Exception handling

---

## 📊 Code Quality

✅ Achieved **100% code coverage** during SonarQube analysis.

<img width="1600" height="618" alt="image" src="https://github.com/user-attachments/assets/19dbb18c-67b5-40da-a7c0-51e1e9ab5203" />

---

## 📚 What I Learned

Building this project helped me gain practical experience with:

* Spring Security and JWT authentication
* REST API development
* SQL Server integration
* React state management
* Frontend and backend communication
* Unit testing and mocking
* Code quality analysis using SonarQube
* Designing and building a complete full-stack application

---

## 📝 Notes

* JWT tokens expire after 24 hours
* Passwords are never stored in plain text
* Session state is managed using React Context
* Global exception handling provides consistent API responses
* Contacts are displayed in a paginated view for better performance

---

## 🔀 Git Workflow

Development was done on a feature branch and later merged into the main branch after testing and verification.
