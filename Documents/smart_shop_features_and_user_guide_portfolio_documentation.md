# SmartShop — Features & User Guide

> Enterprise‑style full‑stack e‑commerce platform with real authentication workflows, Redis security systems, payment gateway simulation, order lifecycle automation, and scalable architecture.

---

# SmartShop Overview

SmartShop is a production‑inspired enterprise e‑commerce platform engineered using modern frontend, backend, database, authentication, payment, and security technologies.

The platform is designed to simulate real commercial e‑commerce behavior including:

- real Gmail OTP verification
- JWT authentication
- rate limiting security
- order lifecycle automation
- payment gateway simulation
- return & replacement workflows
- refund workflows
- scalable product catalog management
- transactional order systems
- modern responsive UI

The project demonstrates enterprise engineering concepts including:

- scalable full‑stack architecture
- secure authentication systems
- Redis‑based OTP & abuse prevention
- defensive checkout workflows
- payment abstraction systems
- real‑world order lifecycle handling
- production deployment architecture

---

# Live Deployment

## Frontend Deployment

- Hosted on Vercel
- Production‑optimized Next.js deployment

## Backend Deployment

- Hosted on Render
- Express API + PostgreSQL + Redis integration

---

# Core Features

# Authentication & Security Features

## Real Gmail OTP Based Registration

- Users register using a real Gmail account
- OTP is sent to the user email
- OTP verification required before account activation
- Email verification prevents fake account creation
- Redis used for OTP storage and expiration

## JWT Token Based Login System

- Secure login authentication
- JWT token generation after successful login
- Protected routes for authenticated users
- Persistent login sessions
- Automatic session validation

## Forgot Password Workflow

- Users can reset forgotten passwords
- Verification code sent to registered email
- Secure password reset validation flow
- Temporary reset session handling using Redis

## Change Password System

- Authenticated users can update passwords
- Existing password verification supported
- Secure password hashing using bcrypt

## Rate Limiting & Login Protection

- Redis‑based rate limiting
- Login abuse prevention
- OTP request throttling
- Temporary blocking after multiple failed attempts
- Brute force attack protection

---

# User Features

## Guest User Access

Guest users can:

- visit the website
- browse products
- search products
- explore categories
- view product details
- use product filtering

Authentication is only required for:

- cart persistence
- wishlist
- checkout
- placing orders
- profile management

---

# Navigation & UI Features

## Advanced Navbar

The navbar includes:

- smart product search
- live auto suggestion products
- category navigation
- responsive navigation system
- authentication shortcuts
- cart access
- wishlist access

## Hamburger Menu System

Responsive hamburger menu includes:

- profile access
- orders page
- wishlist
- cart
- authentication actions
- mobile navigation support

## Fully Responsive Design

The platform supports:

- desktop devices
- tablet devices
- mobile devices
- responsive layouts
- adaptive UI components

---

# Product Catalog Features

## Large Product Ecosystem

SmartShop includes:

- 2000+ products
- 18+ product categories
- 122+ subcategories
- large catalog architecture
- scalable product organization

## Product Search System

Features include:

- instant search
- auto suggestions
- category search
- brand filtering
- keyword search
- search optimization

## Product Detail Page

Detailed product pages include:

- high quality product images
- pricing information
- product descriptions
- category details
- related product exploration
- add to cart
- add to wishlist

---

# Wishlist & Cart Features

## Add To Wishlist

Users can:

- save favorite products
- manage wishlist items
- access wishlist from navbar/menu
- move wishlist items to cart

## Shopping Cart System

Features include:

- add to cart
- remove from cart
- quantity updates
- subtotal calculations
- persistent cart workflows
- checkout integration

---

# Checkout System

The checkout architecture follows a defensive payment‑first workflow.

## Checkout Features

- secure checkout page
- shipping details collection
- payment method selection
- payment confirmation handling
- order creation after payment success
- frontend validation
- backend validation

## Shipping Information

Users can provide:

- full name
- address
- city
- state
- zip code
- mobile number

---

# Payment Gateway Simulation System

SmartShop contains an advanced real‑world inspired payment simulation architecture.

## Supported Payment Methods

- Card Payments
- UPI Payments
- Cash On Delivery (COD)

---

# Card Payment System

## Card Validation Logic

The system contains:

- 36 valid card token combinations
- matching CVV validation
- expiry date validation
- payment confirmation workflow

## Card Payment Rules

- Only valid card number + matching CVV combinations succeed
- Invalid card details fail payment
- Expired cards fail payment
- Incorrect CVV fails payment

## Payment Simulation Behavior

Successful payments:

- payment status becomes Paid
- order creation proceeds
- transaction marked successful

Failed payments:

- payment rejected
- order not created
- user receives failure response

---

# UPI Payment System

## UPI Validation Logic

The system includes:

- 36 valid UPI IDs
- UPI payment verification simulation
- payment confirmation validation

## UPI Rules

- only valid UPI IDs succeed
- invalid UPI IDs fail payment
- successful UPI updates payment status to Paid

---

# Cash On Delivery (COD)

## COD Workflow

COD bypasses payment gateway confirmation.

Features:

- order created immediately
- payment status remains Pending initially
- payment marked Paid after delivery

---

# Order Management System

## Orders Page

Users can:

- view all placed orders
- track order progress
- verify delivery dates
- view payment status
- cancel orders
- request returns
- request replacements

---

# Automated Order Lifecycle System

SmartShop contains time‑based automated order progression APIs.

## Order Status Timeline

### Order Placed

Initial order status after successful checkout.

### Order Packed

Automatically updated after 12 hours.

### Order Shipped

Automatically updated 12 hours after packed status.

### Order Delivered

Automatically updated 24 hours after shipped status.

## Time‑Based Status APIs

Separate APIs handle:

- order status progression
- automated status updates
- payment state synchronization
- delivery lifecycle automation

---

# Payment Status Lifecycle

## Prepaid Orders (Card / UPI)

If user pays using:

- Card
- UPI

Then:

- payment status immediately becomes Paid
- payment linked to order lifecycle

## COD Orders

For Cash On Delivery:

- payment status initially Pending
- after successful delivery payment status changes to Paid

---

# Order Cancellation System

Users can cancel placed orders.

## Cancellation Features

- authenticated cancellation
- order ownership validation
- payment state synchronization
- refund simulation

## Refund Logic

If prepaid order is cancelled:

- payment status changes to Refund
- refund workflow triggered

---

# Return & Replace System

After delivery users can:

- return products
- replace products
- track request status

## Return Workflow

If prepaid order is returned:

- payment status changes to Refund
- refund workflow executed

## Replace Workflow

Users can:

- request replacement
- manage replacement requests
- track request lifecycle

---

# Additional Advanced Features

## Realistic E‑Commerce Simulation

The project intentionally simulates:

- real transactional workflows
- real order lifecycle handling
- payment state transitions
- production‑style checkout behavior
- authentication security
- API driven systems

## Enterprise Security Features

- JWT authentication
- Redis rate limiting
- OTP expiration
- brute force protection
- protected APIs
- validation middleware

## Modern Frontend Experience

- responsive UI
- animated interactions
- smooth navigation
- reusable components
- scalable frontend architecture

## Backend Engineering Features

- modular API architecture
- Prisma ORM integration
- PostgreSQL relational design
- middleware architecture
- scalable route organization
- payment abstraction systems

---

# User Guide — How To Run SmartShop

# Step 1 — Open Website

Visit the deployed SmartShop web application.

Frontend is hosted on Vercel.

---

# Step 2 — Register With Real Gmail

Create a new account using a real Gmail address.

Features:

- real email validation
- OTP generation
- secure registration workflow

---

# Step 3 — Verify Gmail With OTP

- Check your Gmail inbox
- Copy the OTP
- Verify your account

OTP validation includes:

- expiration handling
- verification checks
- Redis‑based security validation

---

# Step 4 — Save Password

Create a secure password for your account.

Password features:

- secure hashing
- authentication validation
- protected login workflows

---

# Step 5 — Create Account

After OTP verification and password setup:

- account becomes active
- user profile created
- authentication enabled

---

# Step 6 — Login To SmartShop

Login using:

- registered Gmail
- account password

JWT authentication session starts after successful login.

---

# Step 7 — Search Or Select Products

Users can:

- search products
- use auto suggestions
- browse categories
- explore subcategories
- filter products

---

# Step 8 — Open Product Detail Page

Product page includes:

- product images
- descriptions
- pricing
- wishlist support
- add to cart functionality

---

# Step 9 — Go To Checkout Page

Users can:

- review cart items
- verify totals
- continue secure checkout

---

# Step 10 — Add Shipping Details

Enter:

- full address
- city
- state
- zip code
- phone number

---

# Step 11 — Select Payment Method

Available payment options:

- Card
- UPI
- Cash On Delivery (COD)

---

# Step 12 — Card Payment Workflow

For card payments:

- click Card Tokens helper
- choose valid card details
- enter matching CVV
- provide future expiry month/year

## Important Rule

Only valid card + CVV combinations succeed.

All invalid combinations fail.

---

# Step 13 — Confirm Card Payment

Click:

- Confirm Payment

After successful validation:

- payment becomes Paid
- order creation proceeds

---

# Step 14 — UPI Payment Workflow

For UPI payments:

- click UPI Help
- choose valid UPI ID
- confirm payment

## Important Rule

Only valid UPI IDs succeed.

Invalid IDs fail payment.

---

# Step 15 — COD Workflow

For COD:

- payment gateway bypassed
- order created immediately
- payment remains Pending until delivery

---

# Step 16 — Order Successfully Placed

After successful checkout:

- order generated
- delivery timeline created
- payment linked to order
- order visible in Orders page

---

# Step 17 — View Orders Page

From hamburger menu:

- open Orders page
- verify ordered products
- view delivery date
- track status progression
- manage returns/replacements

---

# Order Status Automation Example

```text
Order Placed
   ↓ (12 Hours)
Order Packed
   ↓ (12 Hours)
Order Shipped
   ↓ (24 Hours)
Order Delivered
```

---

# Refund & Return Examples

## Example 1 — Prepaid Order Cancellation

If user:

- pays via Card/UPI
- then cancels order

Then:

- payment status changes to Refund

---

## Example 2 — COD Order

If user selects COD:

- payment status remains Pending
- after delivery status changes to Paid

---

## Example 3 — Return Request

If prepaid delivered order is returned:

- return request created
- refund workflow triggered
- payment status becomes Refund

---

# Engineering Highlights

This project demonstrates:

- enterprise full‑stack engineering
- scalable architecture design
- Redis security workflows
- payment abstraction systems
- JWT authentication
- Prisma relational database modeling
- order lifecycle automation
- frontend/backend integration
- production‑style transactional workflows
- deployment architecture

---

# Recruiter‑Focused Highlights

SmartShop demonstrates:

- full‑stack development skills
- backend architecture skills
- frontend engineering skills
- API design understanding
- secure authentication workflows
- real‑world order systems
- advanced payment handling logic
- scalable engineering practices
- enterprise project organization
- production deployment knowledge

---

# Future Enhancements

Potential future improvements:

- real payment gateway integration
- Docker & Kubernetes support
- AI recommendation systems
- analytics dashboards
- microservice extraction
- cloud scaling architecture
- centralized monitoring
- advanced CI/CD pipelines

---

# Conclusion

SmartShop is an enterprise‑style e‑commerce platform engineered to simulate real commercial application behavior using modern frontend technologies, scalable backend architecture, Redis security systems, payment simulation workflows, and production‑inspired engineering practices.

The project goes far beyond a simple CRUD application and demonstrates:

- real authentication systems
- transactional checkout architecture
- order lifecycle automation
- refund & return handling
- scalable product management
- payment abstraction workflows
- enterprise modular architecture
- deployment‑ready engineering design

SmartShop serves as:

- a full‑stack engineering showcase
- a recruiter‑friendly portfolio project
- a scalable system design demonstration
- an enterprise architecture case study
- a production‑inspired e‑commerce platform

