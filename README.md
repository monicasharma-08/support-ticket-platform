# Support Ticket Platform 🎫

An AI-powered support ticket management system with customer and agent dashboards. Features intelligent ticket triage using Google Gemini API, role-based authentication with JWT, and real-time collaboration tools.

**Live Demo:** [Will be added after deployment]  
**GitHub Repository:** [Your GitHub link]

---

## 🌟 Features

✅ **AI-Powered Ticket Triage** - Automatically categorize and prioritize tickets using Google Gemini  
✅ **Role-Based Access Control** - Separate dashboards for customers and agents  
✅ **JWT Authentication** - Secure stateless authentication with token-based access  
✅ **Full-Text Search & Filtering** - Find tickets by status, priority, category, and assignee  
✅ **Real-Time Comments** - Agents and customers can collaborate on tickets  
✅ **Audit Trail** - Complete history of all ticket changes and comments  
✅ **Beautiful UI** - Modern, responsive design with Tailwind CSS  
✅ **MongoDB Atlas Integration** - Cloud-based database for scalability  

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast bundler
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **@google/generative-ai** - Gemini AI integration

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key** - [Get API key](https://aistudio.google.com/app/apikey)

---

## ⚙️ Environment Variables

### Backend Setup

Create a `.env` file in the `server/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/support-tickets?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### Frontend Setup

Create a `.env.local` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/support-ticket-platform.git
cd support-ticket-platform
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file (see Environment Variables section)
# Then start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access the Application

- **Homepage:** `http://localhost:5173/`
- **Login:** `http://localhost:5173/login`
- **Register:** `http://localhost:5173/register`

### 5. Test with Demo Credentials

```
Customer:
  Email: customer@test.com
  Password: password

Agent:
  Email: agent@test.com
  Password: password
```

---

## 📁 Project Structure

```
support-ticket-platform/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── AgentDashboard.jsx
│   │   │   └── TicketDetailsPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT & user state
│   │   ├── services/
│   │   │   └── api.js              # Axios instance
│   │   ├── App.jsx                 # Routes & Auth Guards
│   │   ├── main.jsx
│   │   ├── index.css               # Tailwind imports
│   │   └── App.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── middleware/
│   │   └── auth.js                 # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   └── comments.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── commentController.js
│   ├── services/
│   │   └── aiTriage.js             # Gemini API
│   ├── index.js                    # Server entry point
│   ├── .env                        # Environment variables (NOT in Git)
│   └── package.json
│
├── ARCHITECTURE.md                  # System design documentation
├── README.md                        # This file
└── .gitignore
```

---

## 🔐 Authentication Flow

1. **Register** → Password hashed with bcryptjs → User stored in MongoDB
2. **Login** → Credentials verified → JWT token created with `{ id, role, name }`
3. **API Requests** → Token sent in `Authorization: Bearer <token>` header
4. **Middleware** → Token verified on every protected route
5. **Role Guards** → Customers redirected away from agent routes and vice versa

---

## 🤖 AI Triage System

When a ticket is created:

1. Ticket saved to MongoDB immediately (doesn't block the user)
2. Gemini API called asynchronously to analyze:
   - **Category**: Billing, Technical Issue, Account Access, Feature Request
   - **Priority**: Low, Medium, High, Critical
   - **Suggested Response**: Draft reply for the agent
3. If Gemini fails → Keyword-based fallback ensures ticket always gets a category
4. Results patched back to the ticket document

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Tickets
- `GET /api/tickets` - Get all tickets (paginated)
- `POST /api/tickets` - Create new ticket (customer)
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket status/assignee (agent)

### Comments
- `GET /api/tickets/:id/comments` - Get ticket comments
- `POST /api/tickets/:id/comments` - Add comment

---

## 🧪 Testing the Application

### Test Customer Workflow
1. Login as customer@test.com
2. Create a new support ticket
3. Watch AI triage assign category and priority
4. Check customer dashboard for your ticket

### Test Agent Workflow
1. Login as agent@test.com
2. View all tickets in agent dashboard
3. Assign a ticket to yourself
4. Add comments and update status to "In Progress"
5. Change status to "Resolved" to notify customer

### Test Search & Filtering
- Search tickets by title/description
- Filter by status (Open, In Progress, Resolved, Closed)
- Filter by priority (Low, Medium, High, Critical)
- Filter by category

---

## 🌐 Deployment

### Deploy Backend (Heroku / Railway / Render)

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables in deployment dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
4. Deploy
5. Update `VITE_API_URL` in frontend to deployed backend URL

### Deploy Frontend (Vercel / Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

---

## 📝 Assumptions Made

1. **Single-Server Architecture** - Not horizontally scaled; JWT expiry is 7 days
2. **No Token Revocation** - Tokens valid until expiry; logout is client-side only
3. **Synchronous Email** - Planned feature; currently not implemented
4. **No Real-Time Updates** - Page requires refresh to see new tickets; WebSockets not implemented
5. **MongoDB Atlas Free Tier** - Assumes 512MB storage limit; suitable for demo
6. **Gemini Free Tier Quota** - May hit rate limits under high load
7. **No Rate Limiting** - Auth routes not protected against brute force
8. **Case-Sensitive Usernames** - Email treated as case-sensitive by MongoDB
9. **AI Fallback Only** - Keyword fallback used only if Gemini API fails
10. **No Admin Panel** - No user management; demo accounts pre-created

---

## 🐛 Known Limitations

- No email notifications (planned feature)
- No WebSocket real-time updates
- No token refresh mechanism
- No rate limiting on API endpoints
- Limited to Gemini free tier quota
- No user management/admin panel
- Comments don't support @mentions
- No file attachments

---

## 🚀 Future Enhancements

- [ ] Real-time updates with Socket.io
- [ ] Email notifications via Nodemailer
- [ ] Refresh token rotation
- [ ] SLA tracking and escalation
- [ ] Analytics dashboard
- [ ] Rate limiting
- [ ] NoSQL injection prevention
- [ ] File attachments
- [ ] Export tickets to CSV/PDF

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerSelectionError: SSL routines
```
**Solution:** 
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to IP Access List
3. Verify connection string in `.env`

### Tailwind CSS Not Working
```
CSS not being applied to components
```
**Solution:**
1. Make sure `@import "tailwindcss"` is in `index.css`
2. Run `npm run dev` to restart dev server
3. Clear browser cache

### Gemini API Quota Exceeded
```
Error: Resource has been exhausted
```
**Solution:**
- Wait a few hours before using the API again
- Tickets will use keyword fallback in the meantime

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Change PORT in .env to 5001
# Or kill the process using the port
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Your Name**  
GitHub: [MONIKA SHARMA](https://github.com/monicasharma-08)

---

## 💡 Support

If you encounter any issues, please:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Review the ARCHITECTURE.md for system design details

---

## 🎯 Project Status

✅ MVP Complete  
- Core ticket management ✅
- AI triage system ✅
- Role-based dashboards ✅
- Authentication ✅
- Search & filtering ✅

🔄 In Progress / Planned
- Email notifications
- Real-time updates
- Analytics dashboard
- SLA tracking

---

**Thank you for using Support Ticket Platform!** 🙏