
# EventFlow - Event RSVP Platform

https://mernevent.netlify.app/

Render : https://eventflow-u7tx.onrender.com

Demo video https://drive.google.com/file/d/153oNbB-GnQSCHAsaoFPb5O2HUIXjNQ2J/view?usp=sharing

A comprehensive full-stack event management application built with the MERN stack (MongoDB, Express.js, React, Node.js). Create events, manage RSVPs, and connect with your community in real-time.

## ✨ Features

### 🎯 Core Functionality
- **Event Creation & Management** - Create detailed events with categories, dates, and locations
- **Smart RSVP System** - Yes/No/Maybe responses with guest counting
- **Real-time Updates** - Live RSVP tracking using Socket.io
- **User Authentication** - Secure JWT-based user registration and login
- **Responsive Design** - Mobile-first design that works on all devices

### 🚀 Advanced Features
- **Event Categories** - Social, Business, Educational, Sports, and more
- **Calendar View** - Visual event timeline (optional enhancement)
- **RSVP Analytics** - Track attendance and engagement metrics
- **Event Search & Filter** - Find events by category, date, or location
- **User Profiles** - Personal dashboard with event history

## 🏗️ Architecture

```
EventFlow/
├── 📱 Frontend (React)
│   ├── Components (Reusable UI elements)
│   ├── Pages (Route components)
│   ├── Services (API calls)
│   └── Context (State management)
├── ⚙️ Backend (Node.js/Express)
│   ├── Models (Mongoose schemas)
│   ├── Routes (API endpoints)
│   ├── Controllers (Business logic)
│   └── Middleware (Authentication, validation)
├── 🗄️ Database (MongoDB)
│   ├── Users collection
│   ├── Events collection
│   └── RSVPs collection
└── 🔧 DevOps
    ├── Environment configuration
    ├── Testing suite
    └── Deployment scripts
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | User interface and interactions |
| **Routing** | React Router v6 | Client-side navigation |
| **HTTP Client** | Axios | API communication |
| **Real-time** | Socket.io | Live updates |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB + Mongoose | Data persistence |
| **Authentication** | JWT + bcrypt | Secure user auth |
| **Testing** | Jest + Supertest | Unit and integration tests |
| **Deployment** | Multiple platforms | Production hosting |

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/eventflow-rsvp-app.git
cd eventflow-rsvp-app
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit the `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/eventflow
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=development
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 4: Database Setup

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running locally
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get connection string
- Update `MONGODB_URI` in backend `.env` file

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
*Server runs on http://localhost:5000*

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
*Client runs on http://localhost:3000*

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  location: String,
  creator: ObjectId (ref: User),
  category: String,
  maxAttendees: Number,
  createdAt: Date
}
```

### RSVP Model
```javascript
{
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  response: ['Yes', 'No', 'Maybe'],
  guests: Number,
  createdAt: Date
}
```

## 🔌 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | User registration | `{name, email, password}` |
| `POST` | `/api/auth/login` | User login | `{email, password}` |

### Event Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/events` | Get all upcoming events | `?category=Social` |
| `POST` | `/api/events` | Create new event | `{title, description, date, location, category}` |
| `GET` | `/api/events/:id` | Get single event details | - |
| `PUT` | `/api/events/:id` | Update event | `{title, description, ...}` |
| `DELETE` | `/api/events/:id` | Delete event | - |

### RSVP Endpoints
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/rsvps` | Create/update RSVP | `{user, event, response, guests}` |
| `GET` | `/api/rsvps/user/:userId` | Get user's RSVPs | - |
| `GET` | `/api/rsvps/event/:eventId` | Get event RSVPs | - |

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Frontend Testing
```bash
cd frontend
npm test              # Run React component tests
npm run test:coverage # Test coverage report
```

### Example Test Structure
```javascript
// Backend integration test example
describe('Event API', () => {
  it('should create a new event', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Test Event',
        description: 'Test Description',
        date: '2023-12-01',
        location: 'Test Location'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });
});
```

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name-backend

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=your_frontend_url

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify)
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Environment Configuration for Production
```env
# Backend (.env)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow
CLIENT_URL=https://your-frontend-app.netlify.app
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production

# Frontend (.env.production)
REACT_APP_API_URL=https://your-backend-app.herokuapp.com/api
REACT_APP_SOCKET_URL=https://your-backend-app.herokuapp.com
```

## 📱 Usage Guide

### For Event Organizers
1. **Register/Login** to your account
2. **Create Events** with detailed information
3. **Manage RSVPs** and track attendance
4. **Send Updates** to attendees

### For Attendees
1. **Browse Events** by category and date
2. **RSVP** with Yes/No/Maybe responses
3. **Track Your Events** in personal dashboard
4. **Receive Notifications** for event updates

## 🤝 Contributing

I welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request








