# משחק טריוויה - פלטפורמה חינוכית

פלטפורמה חוצת פלטפורמות למשחקי טריוויה ללימוד אוצר מילים בשפות שונות, המיועדת לילדים.

## תכונות עיקריות

- 🎮 משחק טריוויה אינטראקטיבי עם טיימר
- 🔊 תמיכה בהקראת מילים (אשכנזי/ספרדי)
- 📊 מערכת ניקוד ושיאים
- 💰 מודל עסקי freemium (30 משחקים חינמיים)
- 🔐 מערכת אימות מאובטחת
- 📱 תמיכה במובייל ודפדפן
- 🎛️ פאנל ניהול מתקדם

## טכנולוgiות

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Swagger API Documentation
- Stripe Payment Integration

**Frontend (מתוכנן):**
- React Native + Expo
- React.js (Admin Panel)

## התקנה והפעלה

### דרישות מוקדמות
- Node.js (v18+)
- MongoDB
- npm או yarn

### התקנה

```bash
# שכפול הפרויקט
git clone https://github.com/your-username/trivia-game.git
cd trivia-game

# התקנת תלויות השרת
cd server
npm install

# הגדרת משתני סביבה
cp .env.example .env
# ערוך את קובץ .env עם הנתונים שלך

# הפעלת השרת
npm start
```

### הפעלה למפתחים

```bash
# הפעלה עם nodemon
npm run dev

# טעינת נתוני דוגמה
node seedData.js
```

## API Documentation

לאחר הפעלת השרת, תיעוד ה-API זמין בכתובת:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## מבנה הפרויקט

```
trivia-game/
├── server/                 # Backend (Node.js)
│   ├── config/            # הגדרות מסד נתונים ו-Swagger
│   ├── controllers/       # לוגיקה עסקית
│   ├── middleware/        # אימות ואבטחה
│   ├── models/           # מודלי MongoDB
│   ├── routes/           # נתיבי API
│   └── uploads/          # קבצי אודיו
├── client/               # אפליקציית React Native (מתוכנן)
├── admin-dashboard/      # פאנל ניהול (מתוכנן)
└── assets/               # קבצי מדיה
```

## Features

### משתמשים
- [x] הרשמה והתחברות
- [x] פרופיל משתמש
- [x] הגדרות אישיות
- [x] מעקב אחר כמות משחקים

### משחק
- [x] שאלות רב-ברירה
- [x] טיימר (מהיר/רגיל)
- [x] מערכת ניקוד
- [x] שיאים אישיים וגלובליים
- [x] השמעת הקראות

### מערכת תשלום
- [x] מודל freemium
- [x] אינטגרציה עם Stripe
- [ ] תמיכה בספקי סליקה ישראלים

### ניהול
- [x] CRUD שאלות
- [ ] העלאת קבצי אודיו
- [ ] ניהול משתמשים
- [ ] דוחות וסטטיסטיקות

## משתני סביבה

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trivia_game
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=24h
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FREE_GAMES_LIMIT=30
```

## תרומה לפרויקט

1. Fork הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add some amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## רישיון

MIT License - ראה קובץ [LICENSE](LICENSE) לפרטים נוספים.

## יצירת קשר

שם המפתח - email@example.com
