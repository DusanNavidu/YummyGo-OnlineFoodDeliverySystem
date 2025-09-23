# 🍔 YummyGo – Online Food Delivery System

<div align="center">
  <img src="https://i.ibb.co/FqJgDw85/Screenshot-2025-09-23-091416.png" alt="YummyGo Logo" width="400">
</div>

**YummyGo** is an **Online Food Delivery System** developed as part of GDSE 72 coursework.
It provides **real-time food ordering and delivery services**, focusing on **efficiency, cost-effectiveness, and scalability**.

The platform supports **Customers, Businesses, Riders, and Administrators**,
with different dashboards and role-based features.

---

## 🎨 Theme

YummyGo follows a **modern design inspired by Uber Eats**:

* **Primary Colors**: Black ⚫, White ⚪, Yellow 🟡, Red 🔴, and Green 🟢
* **Clean UI** for a smooth food ordering experience
* **Icons & Illustrations** to make dashboards interactive

---

## 🚀 Features

### 🔑 User Management

* Role-based registration (**Customer, Business, Rider, Admin**)
* **Google Sign-In** support
* Validations & **exception handling** during login
* **Forget Password** with OTP verification
* Secure password storage with **encryption**

---

### 🏪 Business Dashboard

* Manage one or multiple businesses under a single account
* Business profile includes:

  * Name, contacts, email
  * City, postal code
  * Opening/closing time
  * Status & description
  * Location via **Leaflet Map**
  * Uploadable business logo
* Receive **notification sounds** for new orders
* Add/manage food items in multiple categories
* Update order statuses in real time (**Accepted, Rejected, Preparing**)

📸 **Business Dashboard**

<div align="center">
  <img src="https://i.ibb.co/DHxfMP2f/Screenshot-2025-09-23-090644.png" width="400">
  <img src="https://i.ibb.co/Gjh0WFj/Screenshot-2025-09-23-090704.png" width="400">
</div>

---

### 👥 Customer Side

* Register/login as a customer
* Save and manage **delivery locations**
* Search for businesses by area or manually
* Place orders with **shopping cart** functionality
* Confirm delivery location with **Leaflet Map** (drag & drop pin / text search)
* Payment options:

  * **PayHere Bank Payment**
  * **Cash on Delivery**
* Track orders live

📸 **Customer Side**

<div align="center">
  <img src="https://i.ibb.co/MyR8h4y2/Screenshot-2025-09-23-090327.png" width="350">
  <img src="https://i.ibb.co/zWLYq0Dj/Screenshot-2025-09-23-090429.png" width="350"><br><br>
  <img src="https://i.ibb.co/CK6cVt2S/Screenshot-2025-09-23-090506.png" width="350">
  <img src="https://i.ibb.co/d4d2Sqfs/Screenshot-2025-09-23-090526.png" width="350"><br><br>
  <img src="https://i.ibb.co/Jw5hyyG7/Screenshot-2025-09-23-090549.png" width="350">
  <img src="https://i.ibb.co/hR7N6w68/Screenshot-2025-09-23-093044.png" width="350">
</div>

---

### 🛵 Rider Side

* Register with **vehicle details**
* Get alerts when new orders are available
* First rider to accept → others blocked
* View **real-time map** with:

  * Rider location
  * Shop location
  * Delivery location
* Mark orders as **Delivered** after completion

📸 **Rider Dashboard**

<div align="center">
  <img src="https://i.ibb.co/n8M0gqvb/Screenshot-2025-09-23-091049.png" width="400">
  <img src="https://i.ibb.co/pBzC9Mmw/Screenshot-2025-09-23-091136.png" width="400">
</div>

---

### 🛠️ Admin Dashboard

* Pre-configured **Admin account** included
* Admin can manage:

  * Overview
  * Users
  * Businesses
  * Vehicles
  * Orders
  * Payments
  * User history
* **Activate/Deactivate** accounts (blocked users cannot log in)

📸 **Admin Dashboard**

<div align="center">
  <img src="https://i.ibb.co/zTrrVyqf/Screenshot-2025-09-23-090850.png" width="350">
  <img src="https://i.ibb.co/6cMn8RPr/Screenshot-2025-09-23-090942.png" width="350"><br><br>
  <img src="https://i.ibb.co/39sXrzWQ/Screenshot-2025-09-23-091000.png" width="350">
  <img src="https://i.ibb.co/Ng1pQY8s/Screenshot-2025-09-23-091015.png" width="350">
</div>

---

## ⚙️ Backend Implementation

* Built with **Spring Boot** + **Hibernate ORM**
* **9 entities** with Hibernate relationships
* Robust **exception handling**
* Passwords stored with **encoding**
* Authentication:

  * **Login, Register, Role Selection, Update** → No token needed
  * All other APIs → Require **Access Token**

---

## 🧰 Technologies Used

* **Spring Boot**
* **Hibernate**
* **Lombok**
* **Email Server** (for OTP & notifications)
* **PayHere** (payment gateway)
* **Leaflet Map** (location services)
* **IMGBB** (image storage)

---

## 🎯 Project Purpose

* Make food ordering **easy, fast & affordable**
* Create **job opportunities** for riders
* Help businesses **digitally manage orders**
* Provide admins with **full control** over the system

---

## 📽️ Video Demonstration

🎥 A full video demo is available to showcase **YummyGo** features.

[YouTube – YummyGo Demo](https://youtu.be/xds_9bmyPE0)

<iframe width="560" height="315" src="https://www.youtube.com/embed/xds_9bmyPE0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
## 📽️ Video Demonstration

[![Watch the video](https://img.youtube.com/vi/xds_9bmyPE0/0.jpg)](https://youtu.be/xds_9bmyPE0)

---

## 🙏 Conclusion

**YummyGo** makes food ordering easier for customers,
empowers businesses to go digital,
creates income opportunities for riders,
and provides full centralized control for admins.

<div align="center">
  <b>Built with ❤️ by Dusan Navidu (GDSE 72 – Galle Branch)</b>
</div>
