# 🚀 Advanced Real-Time Chat Engine

A high-performance, scalable backend for real-time communication, built with **NestJS**, **GraphQL**, and **WebSockets**. This project follows industry-standard modular architecture and rigorous security practices.

## 🛠 Tech Stack & Tools
- **Framework:** NestJS (Modular Architecture)
- **API:** GraphQL (Code-first approach)
- **Real-time:** Socket.io (WebSockets)
- **ORM:** Prisma (PostgreSQL)
- **Authorization:** CASL (Attribute-based Access Control)
- **File Handling:** Multer (Optimized for local/cloud storage)
- **Security:** JWT Authentication with Socket Handshakes

## ✨ Key Features

### 🔐 Advanced Authorization (CASL)
Integrated **CASL** for fine-grained Access Control (ABAC). This ensures that users can only manage (edit/delete) their own messages and access rooms they are explicitly members of, providing a robust security layer beyond simple RBAC.

### 📡 Real-time Synchronization
Utilizing **Socket.io** for instantaneous updates. Clients are automatically joined to relevant rooms upon connection, enabling seamless broadcasting of events:
- `newMessage`: Instant delivery of new messages.
- `messageUpdated`: Real-time sync for edited content.
- `messageDeleted`: Immediate UI cleanup across all clients in the room.

### 📂 File Management (Multer)
Implemented **Multer** for efficient file uploads. The system is designed to handle media sharing within chat rooms with proper file validation and storage optimization.

### 🏗 Modular & Standard Design
The codebase is strictly organized into **Domain-Driven Modules** (Users, Messages, Rooms, Auth). Each module is encapsulated, following NestJS best practices to ensure maintainability and ease of testing.

## 🚀 Getting Started

1. **Clone & Install:**
   ```bash
   git clone (https://github.com/danialzr/nestjs-realtime-chat-graphql)
   npm install
