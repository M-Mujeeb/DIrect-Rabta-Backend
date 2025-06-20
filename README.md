
---

### 🗃️ MongoDB Schema Design

#### 1. **roles**

```json
{
  _id: ObjectId,
  name: "fan" | "celebrity" | "admin",
  description: String
}
```

#### 2. **users**

```json
{
  _id: ObjectId,
  role_id: ObjectId, 
  full_name: String,
  email: String,
  password: String,
  profile_image: String,
  is_verified: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### 3. **plans**

```json
{
  _id: ObjectId,
  name: String,
  description: String,
  message_limit: Number,
  priority_delivery: Boolean,
  price: Number,
  is_most_popular: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### 4. **plan\_usages**

```json
{
  _id: ObjectId,
  user_id: ObjectId, // Fan user
  plan_id: ObjectId,
  remaining_messages: Number,
  purchased_at: Date,
  expires_at: Date
}
```

#### 5. **messages**

```json
{
  _id: ObjectId,
  sender_id: ObjectId,
  receiver_id: ObjectId,
  type: "voice" | "preset_text",
  content: String,
  duration: Number,
  sent_at: Date,
  reviewed: Boolean,
  accepted_policy: Boolean
}
```

#### 6. **presets**

```json
{
  _id: ObjectId,
  text: String,
  is_active: Boolean
}
```

#### 7. **ratings**

```json
{
  _id: ObjectId,
  user_id: ObjectId,
  stars: Number,
  comment: String,
  created_at: Date
}
```

#### 8. **payments**

```json
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,
  amount: Number,
  currency: String,
  payment_method: String,
  transaction_id: String,
  paid_at: Date
}
```

#### 9. **notifications**

```json
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  message: String,
  is_read: Boolean,
  created_at: Date
}
```

---

# 📄 README.md

```markdown
# DirectRaabta – Voice-Only Celebrity Fan Interaction App 🎙️✨

**DirectRaabta** is a mobile-first application that allows fans to connect with their favorite celebrities through **paid voice messages** and **preset text replies**. The app prioritizes safe, controlled communication and ensures all interactions are moderated.

---

## 🚀 Features

### 👤 Fan App
- Sign up / Sign in with email & password
- Choose and purchase plans to send voice messages
- Browse celebrity profiles
- Send **voice messages** and **preset replies** only
- View payment history
- Rate the app
- View message history with delivery status

### 👑 Celebrity (Created by Admin)
- Login with credentials provided by Admin
- View and respond to fan messages (voice only)
- See fan interactions in a clean chat format

### 🛠 Admin Portal (Coming Soon)
- Create celebrity accounts
- Manage preset replies
- Add / edit / remove pricing plans
- View message and payment analytics

---

## 📱 App Flow

1. **Fan Sign Up** → Email verification
2. **Choose Plan** → Purchase via available gateway
3. **Message Screen** → Send voice or preset text to any celebrity
4. **Message History** → View all sent messages & replies
5. **Rating Modal** → User can rate experience
6. **Repeat**: Fan can purchase more messages as needed

---

## 💾 Database Collections (MongoDB)

| Collection      | Purpose |
|-----------------|---------|
| `users`         | Stores both fans and celebrities with `role_id` |
| `roles`         | Defines role types: `fan`, `celebrity`, `admin` |
| `plans`         | Voice message pricing plans |
| `plan_usages`   | Tracks how many messages a user has left |
| `messages`      | Voice or preset messages between users |
| `presets`       | Admin-defined fixed replies (e.g., “Thank you”) |
| `ratings`       | App feedback with stars & comment |
| `payments`      | Payment logs for plan purchases |
| `notifications` | In-app alerts (future-ready) |

---

## 🧱 Tech Stack

- **Frontend (Mobile)**: React Native (or Flutter)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe / Razorpay (optional)
- **Storage**: AWS S3 / Firebase Storage (for voice files)

---

## 📂 Folder Structure

```

/backend
/models
/routes
/controllers
/middleware
server.js

/mobile-app
/components
/screens
App.js

```

---

## 🛡️ Policies

- All voice messages are reviewed.
- Fans can only use predefined text replies (no free text).
- Admin manually adds all celebrities.

---

## ✨ Future Enhancements

- Celebrity video message support
- Admin dashboard analytics
- Push notifications
- Package expiry & renewal alerts
- Multi-language support

---

## 🔑 Admin Credentials (for staging)

> Will be set up manually via DB or seed script initially.

---

## 📧 Contact

For suggestions, issues or contributions, please open a pull request or contact the repository maintainer.

---
```
