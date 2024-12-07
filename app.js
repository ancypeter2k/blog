//^ ///////////////////// Import required modules ////////////////////
import express from 'express';
import dotenv from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';// Used to pass cookies, store cookies...
import MongoStore from 'connect-mongo';
import session from "express-session";
import methodOverride from 'method-override';

// Database
import connectDB from './server/config/db.js';
import isActiveRoute from './server/helpers/routeHelpers.js'
const PORT = process.env.PORT || 1234;

const app = express();
dotenv.config();

// Middleware
app.use(express.urlencoded({extended:true}));//search body data
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
      //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

// Connect Database
connectDB();

app.use(express.static('public'));

// Templating engine
app.use(expressEjsLayouts);
app.set('layout','./layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

// Routes
import mainRoute from'./server/routes/main.js';//Main route path
app.use('/',mainRoute);
import adminRoute from'./server/routes/admin.js';//Admin route path
app.use('/',adminRoute);


//PORT
app.listen(PORT,(req,res)=>{
    console.log(`Server running in: http://localhost:${PORT}`)
});
