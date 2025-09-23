# 🍔 YummyGo – Online Food Delivery System

<div align="center">
  <img src="https://i.ibb.co/cQdR8Lj/yummygo-logo.png" alt="YummyGo Logo" width="180"/>
</div>  

**YummyGo** is an **Online Food Delivery System** developed as part of GDSE 72 coursework.  
It provides **real-time food ordering and delivery services**, focusing on **efficiency, cost-effectiveness, and scalability**.

The platform supports **Customers, Businesses, Riders, and Administrators**,  
with different dashboards and role-based features.

---

## 🎨 Theme

YummyGo follows a **modern design inspired by Uber Eats**:
- **Primary Colors**: Black ⚫, White ⚪, Yellow 🟡, Red 🔴, and Green 🟢
- **Clean UI** for smooth food ordering experience
- **Icons & Illustrations** to make dashboards interactive

---

## 🚀 Features

### 🔑 User Management
- Role-based registration (**Customer, Business, Rider, Admin**).
- **Google Sign-In** support.
- Validations & **exception handling** during login.
- **Forget Password** with OTP verification.
- Secure password storage with **encryption**.

---

### 🏪 Business Dashboard
- Manage one or multiple businesses under a single account.
- Business profile includes:
    - Name, contacts, email
    - City, postal code
    - Opening/closing time
    - Status & description
    - Location via **Leaflet Map**
    - Uploadable business logo
- Receive **notification sounds** for new orders.
- Add/manage food items in multiple categories.
- Update order statuses in real time (**Accepted, Rejected, Preparing**).

📸 **Business Dashboard**  
![Business Dashboard](https://i.ibb.co/ZHjM0CB/business-dashboard.png)

---

### 👥 Customer Side
- Register/login as a customer.
- Save and manage **delivery locations**.
- Search for businesses by area or manually.
- Place orders with **shopping cart** functionality.
- Confirm delivery location with **Leaflet Map**:
    - Drag & drop pin
    - Text search
- Payment options:
    - **PayHere Bank Payment**
    - **Cash on Delivery**
- Track orders live.

📸 **Customer Side**  
![Customer Dashboard](https://i.ibb.co/vvCmgHL/customer-dashboard.png)

---

### 🛵 Rider Side
- Register with **vehicle details**.
- Get alerts when new orders are available.
- First rider to accept → others blocked.
- View **real-time map** with:
    - Rider location
    - Shop location
    - Delivery location
- Mark orders as **Delivered** after completion.

📸 **Rider Dashboard**  
![Rider Dashboard](https://i.ibb.co/rytkWvm/rider-dashboard.png)

---

### 🛠️ Admin Dashboard
- Pre-configured **Admin account** included.
- Admin can manage:
    - Overview
    - Users
    - Businesses
    - Vehicles
    - Orders
    - Payments
    - User history
- **Activate/Deactivate** accounts (blocked users cannot log in).

📸 **Admin Dashboard**  
<div align="center">
    <img src="https://i.ibb.co/DHvgPzXN/Screenshot-2025-09-21-231946.png" alt="Screenshot-2025-09-21-231946" width="600" />
</div> 

---

## ⚙️ Backend Implementation
- Built with **Spring Boot** + **Hibernate ORM**.
- **9 entities** with Hibernate relationships.
- Robust **exception handling**.
- Passwords stored with **encoding**.
- Authentication:
    - **Login, Register, Role Selection, Update** → No token needed.
    - All other APIs → Require **Access Token**.

---

## 🧰 Technologies Used
- **Spring Boot**
- **Hibernate**
- **Lombok**
- **Email Server** (for OTP & notifications)
- **PayHere** (payment gateway)
- **Leaflet Map** (location services)
- **IMGBB** (image storage)

---

## 🎯 Project Purpose
- Make food ordering **easy, fast & affordable**.
- Create **job opportunities** for riders.
- Help businesses **digitally manage orders**.
- Provide admins with **full control** over the system.

---

## 📽️ Video Demonstration
🎥 A full video demo is available to showcase **YummyGo** features.

---

## 🙏 Conclusion
**YummyGo** makes food ordering easier for customers,  
empowers businesses to go digital,  
creates income opportunities for riders,  
and provides full centralized control for admins.

<div align="center">
  <b>Built with ❤️ by Dusan Navidu (GDSE 72 – Galle Branch)</b>
</div>
