<div align="center">

# 📇 Contact Management System

### A full-stack web application to manage all your contacts in one secure place

<br/>

[![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge&logo=sonarqube&logoColor=white)](https://www.sonarqube.org/)

<br/>

*Users can register securely, log in and manage a full contact list with search, pagination, editing and detailed profiles. The backend is powered by **Spring Boot** and **SQL Server** while the frontend is built with **React.js**. All routes are protected using **JWT token** authentication.*

<br/>

---

</div>

## 📸 &nbsp; Screenshots

<div align="center">

| Dashboard | Contact Details | Contact Form |
|:---------:|:---------------:|:------------:|
| ![Dashboard](https://github.com/user-attachments/assets/4deb4ef6-247a-47ba-85c6-b2b05387524b) | ![Details](https://github.com/user-attachments/assets/0c317f35-bdc2-431a-91bc-64a935d2a924) | ![Form](https://github.com/user-attachments/assets/25f1b509-8178-492c-ade5-3968b56ec909) |

</div>

<br/>

---

## 🛠️ &nbsp; Tech Stack

<div align="center">

### ⚙️ Backend

| Technology | Purpose |
|:----------:|:-------:|
| Java 17 | Core language |
| Spring Boot | Application framework |
| Spring Data JPA + Hibernate | ORM & database access |
| Spring Security + JWT | Authentication & authorization |
| SQL Server | Relational database |
| SLF4J + Logback | Logging |
| JUnit 5 + Mockito | Unit testing |
| SonarQube | Code quality analysis |

<br/>

### 🎨 Frontend

| Technology | Purpose |
|:----------:|:-------:|
| React.js 18 | UI framework |
| React Router | Client-side routing |
| Axios | HTTP client |

</div>

<br/>

---

## 🚀 &nbsp; Features

### 🔐 Authentication
- Register using email or phone number
- Secure login with JWT authentication
- Passwords are encrypted before storage
- Change password from the profile page
- Logout functionality

### 👥 Contact Management
- Add, edit and delete contacts
- Search contacts by first or last name
- View detailed contact profiles
- Paginated contact list *(10 contacts per page)*

### 📞 Contact Information
Each contact can store:
- First name & last name
- Title
- Multiple email addresses *(Work, Personal, etc.)*
- Multiple phone numbers *(Home, Work, Mobile, etc.)*

### ⚡ Additional Features
- Import contacts from CSV files
- Export contacts to CSV files
- Global exception handling with meaningful error messages
- Application-wide logging
- DTO-based API structure
- Unit testing with JUnit and Mockito

<br/>

---

## 📂 &nbsp; Project Structure

```
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

<br/>

---

## ⚙️ &nbsp; Getting Started

### Prerequisites

Make sure you have the following installed before running the project:

| Requirement | Version |
|:-----------:|:-------:|
| [Java](https://www.oracle.com/java/technologies/downloads/#java17) | 17+ |
| [Node.js](https://nodejs.org/) | 18+ |
| [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) | Any |
| [Maven](https://maven.apache.org/) | Latest *(or use the included wrapper)* |

<br/>

---

## 🗄️ &nbsp; Database Setup

**Step 1 — Create the database:**
```sql
CREATE DATABASE contactmanagementdb;
```

**Step 2 — Create a login and user:**
```sql
CREATE LOGIN springuser WITH PASSWORD = 'Spring@12345';

USE contactmanagementdb;

CREATE USER springuser FOR LOGIN springuser;

ALTER ROLE db_owner ADD MEMBER springuser;
```

> 💡 Hibernate is configured with `ddl-auto=update` — all required tables are created automatically on first run.

<br/>

---

## ▶️ &nbsp; Running the Application

### Backend

```bash
cd backend

# macOS / Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

🌐 Backend runs at: `http://localhost:8080`

<br/>

### Frontend

```bash
cd frontend
npm install
npm start
```

🌐 Frontend runs at: `http://localhost:3000`

<br/>

---

## 📡 &nbsp; API Endpoints

<div align="center">

> 🔒 All contact endpoints require a valid **JWT token** in the `Authorization` header.

| Method | Endpoint | Description |
|:------:|:--------:|:-----------:|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/contact/getcontacts?page=0&size=10` | Get paginated contacts |
| `GET` | `/api/contact/{id}` | Get contact details |
| `GET` | `/api/contact/search?name=xyz` | Search contacts |
| `POST` | `/api/contact/addcontact` | Create a contact |
| `PUT` | `/api/contact/update/{id}` | Update a contact |
| `DELETE` | `/api/contact/delete/{id}` | Delete a contact |

</div>

<br/>

---

## 🧪 &nbsp; Testing

Run the full backend test suite:

```bash
cd backend
./mvnw test
```



| Area Covered |
|:------------:|
| Controllers |
| Services |
| Repositories |
| JWT functionality |
| Security configuration |
| Exception handling |



<br/>

---

## 📊 &nbsp; Code Quality

<div align="center">

### ✅ Achieved 100% Code Coverage via SonarQube

![SonarQube Report](https://github.com/user-attachments/assets/19dbb18c-67b5-40da-a7c0-51e1e9ab5203)

</div>

<br/>

---

## 📝 &nbsp; Notes

| Detail | Info |
|:------:|:----:|
| 🔑 JWT Expiry | 24 hours |
| 🔒 Password Storage | Encrypted — never plain text |
| 🧠 Session State | Managed via React Context |
| 🛡️ Error Handling | Global exception handler for consistent API responses |
| 📄 Pagination | 10 contacts per page for better performance |

<br/>

---

## 🔀 &nbsp; Git Workflow

Development was done on a dedicated **feature branch** and merged into `main` after testing and verification.

<br/>

---

## 📚 &nbsp; What I Learned

Building this project gave me hands-on experience with:

- Spring Security and JWT authentication
- REST API design and development
- SQL Server integration with Hibernate
- React state management with Context API
- Full-stack frontend–backend communication
- Unit testing and mocking with JUnit & Mockito
- Code quality analysis with SonarQube
- Designing and delivering a complete full-stack application end-to-end

<br/>

---

## 👩‍💻 &nbsp; Author

<div align="center">

### Laiba Tanveer

<br/>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/laiba-tanveerr/)
&nbsp;
[![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:laibaatanveerr@gmail.com)

<br/>

*Feel free to reach out for collaboration or feedback!*

</div>
