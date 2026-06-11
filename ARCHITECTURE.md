# ARCHITECTURE.md — Support Ticket Platform

## System Design

### Overall Architecture

The application follows a classic three-tier architecture:

- **Frontend** communicates with the backend exclusively through REST APIs
- **Backend** is stateless — it validates JWT tokens on every protected request and never stores session data server-side
- **AI triage** runs as a side-effect on ticket creation: the ticket is saved to MongoDB first, then Gemini is called asynchronously and the result is patched back onto the ticket document

```
┌─────────────────────────────────────┐
│ Client (Browser)                    │
│ React + Vite + Tailwind CSS         │
└──────────────────┬──────────────────┘
                   │ REST API (JSON over HTTPS)
┌──────────────────▼──────────────────┐
│ Backend (Node.js)                   │
│ Express.js + JWT Middleware         │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐        ┌─────▼──────┐
   │ MongoDB   │        │ Gemini API │
   │ Atlas     │        │ (AI Triage)│
   └───────────┘        └────────────┘
```

---

## Frontend Architecture

```
client/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          # JWT token storage, login/logout, role
│   ├── Pages/
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CustomerDashboard.jsx    # View own tickets, create ticket
│   │   ├── AgentDashboard.jsx       # All tickets, filters, search
│   │   └── TicketDetailsPage.jsx    # Ticket info, comments, audit trail
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── TicketCard.jsx
│   │   ├── CommentBox.jsx
│   │   ├── FilterBar.jsx            # Status / Priority / Category / Assignee
│   │   └── Pagination.jsx
│   ├── services/
│   │   └── api.js                   # Axios instance with base URL + auth header
│   └── App.jsx                      # React Router v6, role-based protected routes
```

### Key Decisions

- **AuthContext** stores the JWT in localStorage and exposes `user` (decoded payload with `id`, `role`, `name`) globally
- **Role-based route guards**: customers are redirected away from agent pages and vice versa
- **Axios interceptor** automatically attaches `Authorization: Bearer <token>` to every request
- **Error handling**: All async operations use try/catch with user-visible error toasts and loading spinners
- **Tailwind CSS** for responsive, utility-first styling

---

## Backend Architecture

```
server/
├── index.js                         # Express app setup, MongoDB connect, listen
├── middleware/
│   └── auth.js                      # JWT verify, attach req.user, role guard
├── models/
│   ├── User.js
│   ├── Ticket.js
│   └── Comment.js
├── routes/
│   ├── auth.js                      # POST /auth/register, POST /auth/login
│   ├── tickets.js                   # POST, GET, GET/:id, PATCH/:id
│   └── comments.js                  # POST /:id/comments, GET /:id/comments
├── controllers/
│   ├── authController.js
│   ├── ticketController.js
│   └── commentController.js
└── services/
    └── aiTriage.js                  # Gemini API call + keyword fallback
```

### Key Decisions

- **Controllers** handle request/response; service logic (AI, email) lives in `/services` to keep controllers thin
- **All routes** validate input with inline checks and return structured `{ success, message, data }` envelopes
- **Pagination** is handled server-side using `skip` and `limit` on MongoDB queries
- **Search** uses MongoDB `$regex` on title and description with case-insensitive flags

---

## Database Design

### Entity Relationships

```
User ─────< Ticket (createdBy)
User ─────< Ticket (assignedTo)
Ticket ───< Comment
User ─────< Comment (author)
```

### Schemas

#### User

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (bcrypt hashed),
  role: Enum ["customer", "agent"],
  createdAt: Date
}
```

#### Ticket

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  status: Enum ["open", "in_progress", "resolved", "closed"],
  priority: Enum ["low", "medium", "high", "critical"],
  category: String (AI-generated or fallback),
  suggestedResponse: String (AI-generated draft reply),
  createdBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User, nullable),
  history: Array [{ action, performedBy, at }],  // audit trail
  createdAt: Date,
  updatedAt: Date
}
```

#### Comment

```javascript
{
  _id: ObjectId,
  ticket: ObjectId (ref: Ticket),
  author: ObjectId (ref: User),
  text: String,
  createdAt: Date
}
```

### Design Decisions

- **MongoDB over PostgreSQL**: The ticket schema has a variable-length `history` array and an AI-generated `suggestedResponse` field. Embedding these in a document is natural; in a relational DB they would require separate tables with joins.
- **history embedded in Ticket**: Ticket history is always read alongside the ticket, never queried independently, so embedding avoids extra round-trips.
- **Comments as separate collection** (not embedded): The number of comments per ticket is unbounded and agents frequently load comment counts without loading the full ticket.
- **Password hashing**: Passwords are hashed with bcryptjs (salt rounds: 10) before storage. Plain text passwords are never stored or logged.
- **Auto-managed updatedAt**: Using Mongoose `{ timestamps: true }` option.

---

## Authentication Strategy

### Approach: JWT (JSON Web Tokens)

On successful login:
1. Server signs a JWT containing `{ id, role, name }` using a secret stored in `.env`
2. Token is returned to the client
3. Token is stored in `localStorage` 
4. Token is sent as a Bearer token in the `Authorization` header on every subsequent request

### Middleware Flow

```
Request → auth middleware → verify JWT → attach req.user → route handler
                              ↓
                    For agent-only routes:
                    requireAgent middleware checks 
                    req.user.role === "agent"
                    Returns 403 if not satisfied
```

### JWT vs Session-Based Authentication

| Aspect | JWT (Chosen) | Session-Based |
|--------|---|---|
| Scalability | Stateless — scales horizontally | Requires shared session store (Redis) |
| Simplicity | Token is self-contained | Requires server-side management |
| Revocation | Hard — valid until expiry | Easy — delete session from store |
| Mobile-friendly | Yes — works in all clients | Cookies can be tricky in mobile |

### Why JWT Was Chosen

For a 48-hour assignment with a single-server deployment, JWT is simpler and sufficient. Token expiry is set to `7d`. In a production system with logout invalidation requirements, a token blocklist (Redis) or refresh-token rotation would be added.

### Why Not an Auth Provider (Auth0, Clerk)

Avoiding external auth dependencies keeps the project self-contained and easier to review. The assignment specifically asks about authentication decisions, which is better demonstrated by a direct implementation.

---

## AI Integration

### Provider and Model

- **Provider**: Google Gemini via `@google/generative-ai` SDK
- **Model**: `gemini-2.5-flash` (free-tier quota, fast response, sufficient accuracy for triage)

### Prompting Strategy

The triage service sends a single prompt with the ticket title and description, instructing Gemini to respond only in JSON with no preamble or markdown fences:

```javascript
const prompt = `
You are a support ticket triage assistant for a software company.
Analyze the following support ticket and respond ONLY with a valid JSON object.
Do not include markdown, backticks, or any explanation outside the JSON.

Ticket Title: ${title}
Ticket Description: ${description}

Respond with exactly this structure:
{
  "category": "one of: Billing | Technical Issue | Account Access | Feature Request",
  "priority": "one of: low | medium | high | critical",
  "suggestedResponse": "a professional 2-3 sentence draft reply the agent can send"
}
`;
```

### Priority Signal Words

- **critical** — system down, cannot login, data loss, urgent
- **high** — feature broken, payment failed, account locked
- **medium** — slowness, intermittent issues, how-to questions
- **low** — feature requests, general inquiries, typos

### Fallback Handling

If the Gemini API is unavailable (network error, quota exceeded, invalid JSON response), a keyword-based fallback runs synchronously:

```javascript
function keywordFallback(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  const category =
    /billing|invoice|payment|charge|refund/.test(text) ? "Billing" :
    /login|password|access|account|locked/.test(text) ? "Account Access" :
    /bug|error|crash|broken|not working|fail/.test(text) ? "Technical Issue" :
    /feature|request|suggest|improve|add/.test(text) ? "Feature Request" :
    "General Inquiry";
  
  const priority =
    /urgent|critical|down|outage|cannot|unable|data loss/.test(text) ? "critical" :
    /broken|failed|error|payment/.test(text) ? "high" :
    /slow|intermittent|sometimes/.test(text) ? "medium" :
    "low";
  
  const suggestedResponse = 
    `Thank you for reaching out. We have received your ticket regarding "${title}" ` +
    `and a support agent will follow up shortly.`;
  
  return { category, priority, suggestedResponse };
}
```

This ensures every ticket always receives a category and priority even without AI, so agent workflows are never blocked.

---

## Future Improvements

Given more time, the following improvements would be prioritized:

### 1. Real-Time Updates with WebSockets

Currently, agents must refresh to see new tickets or status changes. Adding Socket.io would push live updates to connected clients:
- New ticket notifications
- Status change badges
- Comment counters updating in real time without polling

### 2. Email Notifications via Nodemailer

Customers should receive an email when their ticket status changes (e.g., "Your ticket has been resolved"). Agents should be notified when a ticket is assigned to them. A queue (BullMQ + Redis) would prevent blocking the request cycle on email sends.

### 3. Refresh Token Rotation

The current JWT expires after 7 days with no revocation mechanism. Implementing:
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days) stored in httpOnly cookies

This would greatly improve security — especially for the logout flow.

### 4. SLA Tracking and Escalation

Tickets older than a configurable threshold (e.g., 24 hours open without assignment) should be:
- Automatically escalated in priority
- Flagged visually
- A background cron job (node-cron) runs every hour to patch breaching tickets

### 5. Analytics Dashboard

An agent supervisor view showing:
- Open ticket count by category
- Average resolution time
- Tickets assigned per agent
- Weekly trends

Built on MongoDB aggregation pipelines — the data is already captured, just not visualized.

### 6. AI Response Improvement Over Time

Log which AI-suggested responses agents actually use vs. edit, and use that signal to fine-tune the prompting strategy. Over time, suggested responses become more accurate for common ticket types.

### 7. Rate Limiting and Input Sanitization

- Add `express-rate-limit` on auth routes to prevent brute-force attacks
- Add `express-mongo-sanitize` to prevent NoSQL injection on search/filter inputs

---

## Security Considerations

### Current Implementation

✅ Password hashing with bcryptjs  
✅ JWT for stateless authentication  
✅ Role-based access control  
✅ Protected API routes  
✅ CORS configured  

### Recommendations for Production

- [ ] HTTPS only (enforced via reverse proxy)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation and sanitization
- [ ] CSRF protection
- [ ] Security headers (Helmet.js)
- [ ] Logging and monitoring
- [ ] Regular dependency updates
- [ ] API versioning

---

## Performance Considerations

### Optimizations

- **Pagination** on ticket listing (50 items per page default)
- **Indexing** on commonly searched fields (title, description, status)
- **Caching** of user role in JWT token to avoid extra DB lookups
- **Lazy loading** of comments (load on demand)

### Potential Bottlenecks

- Gemini API calls are synchronous per ticket (could be queued)
- MongoDB free tier has query rate limits
- No caching layer (Redis could help)

---

## Deployment Architecture

### Development

- Local Node.js server on port 5000
- Local MongoDB or Atlas connection
- Vite dev server on port 5173

### Production

- Backend: Deployed to Heroku/Railway/Render
- Frontend: Deployed to Vercel/Netlify
- Database: MongoDB Atlas (production tier)
- Environment variables configured in deployment platform

---

**Last Updated:** June 2025  
**Version:** 1.0