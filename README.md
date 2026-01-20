# Distributed Parcel Delivery & Tracking System

## Project Overview
This project implements a **distributed parcel delivery system** using microservices and a **Pub/Sub messaging pattern**. It allows customers to create shipment requests, track their packages, and receive real-time updates. The system is designed for **scalability, reliability, and real-time communication**.

---

## Team Members

| Name | Email | Role |
|------|-------|------|
| Liya Tsegaye | liyatsegaye2301@gmail.com | Project Lead |
| Maedot Amha | maedotamha@gmail.com | Backend Developer |
| Marsilas Wondimagegnehu | marsilasw0@gmail.com | Integration Engineer |
| Meklit Habtamu | mkedu101@gmail.com | Testing / QA Engineer |
| Meklit Melkamu | meklitmelkamu34@gmail.com | DevOps / Deployment |
| Melat Mekonnen | melatmek8@gmail.com | Documentation Lead / Frontend Developer |

---

## Problem Statement
Parcel delivery platforms require several independent backend components to work together so customers can create shipment requests, track their packages, and receive real-time updates. Monolithic applications struggle with scalability and real-time event handling. This project addresses these challenges by implementing a distributed system with microservices and asynchronous messaging.

---

## Objectives
- Implement four independent microservices: User Service, Order Service, Payment Service, and Notification Service.
- Use REST APIs for synchronous operations such as user management, order creation, and payment initiation.
- Use asynchronous messaging (RabbitMQ) for event-driven communication between services.
- Ensure loose coupling between services through message-based integration.
- Deploy all services and supporting infrastructure using Docker Compose.
- Provide clear documentation including API contracts, event flows, and service responsibilities.

---

## Proposed Architecture
The system consists of three independent microservices:

1. **User Service**
- Manages customer and courier accounts.
- Handles user registration, authentication, and profile management.
- Publishes events such as user.created and user.updated.

2. **Order Service**
- Manages parcel orders, addresses, parcels, and tracking events.
- Creates and updates delivery orders.
- Publishes domain events such as order.created, order.status.updated, and parcel.created.

3. **Payment Service**
- Handles payment initiation and verification (e.g., Chapa integration).
- Listens to order.created events to prepare payment records.
- Publishes payment.initiated, payment.completed, and payment.failed events.

4. **Notification Service**

- Subscribes to events from Order and Payment services.
- Ensures customers receive real-time updates throughout the delivery lifecycle.

---

## Repository Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/meklithab/distributed-parcel-delivery-system
   cd distributed-parcel-delivery-system

