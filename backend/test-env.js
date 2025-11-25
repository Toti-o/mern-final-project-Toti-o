require("dotenv").config();
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Not loaded");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
