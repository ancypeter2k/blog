import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

const adminLayout = '../views/layouts/admin';

// // Middleware -> Check Login // // 
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}

// // GET/ADMIN --> Login page // //
router.get('/admin',async (req,res)=>{
    try{
        const locals ={
            title:'Admin - Simple Blog',
            description:'Admin - Simple Blog by Ancy Peter using Nodejs, express & MongoDB'
        }
        
        res.render('admin/index',{
            locals,
            layout: adminLayout
            })
    }catch(error){
        console.log(error);
    }
})

// // POST/login -->Check login// //
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});
  
// // GET/dashboard -->Dashboard// //  ---> Not everyone to enter in admin so ->authMiddleware
router.get('/dashboard',authMiddleware,async (req,res)=>{
  try{
    const locals = {
      title: "Dashboard",
      description:"Admin-Dashboard - Simple Blog by Ancy Peter using Nodejs, express & MongoDB"
    }
    const data = await Post.find();
    res.render('admin/dashboard',{
      locals,
      data,
      layout: adminLayout
    })
  }catch(error){
    console.log(error);
  }
})

// // GET/add-post -->Dashboard// //  ---> Not everyone to enter in admin so ->authMiddleware
router.get('/add-post',authMiddleware,async (req,res)=>{
  try{
    const locals = {
      title: "Add-Post",
      description:"Admin-add Post - Simple Blog by Ancy Peter using Nodejs, express & MongoDB"
    }
    res.render('admin/add-post',{
      locals,
      layout: adminLayout 
    })
  }catch(error){
    console.log(error);
  }
})

// // POST/add-post -->Dashboard// //  ---> Not everyone to enter in admin so ->authMiddleware
router.post('/add-post',authMiddleware,async (req,res)=>{
  try{
    try{
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });
      await Post.create(newPost);
      res.redirect('/dashboard');
    }catch(error){
      console.log(error);
    }
  }catch(error){
    console.log(error);
  }
})

// // GET/edit-post -->Dashboard// //  ---> Not everyone to enter in admin so ->authMiddleware
router.get('/edit-post/:id',authMiddleware,async (req,res)=>{
  try{
    const locals = {
      title: 'Edit Post',
      body: 'Admin-Edit - Simple Blog by Ancy Peter using Nodejs, express & MongoDB'
    }
    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })
  } catch (error) {
    console.log(error);
  }
});

// // PUT /edit-post/:id --> Dashboard // Only authenticated users can access this route -> authMiddleware
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    // Update the post using the ID from the URL parameters
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    // Redirect to the edit-post page for the updated post
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
    // Respond with an error message if needed
    res.status(500).send('Internal Server Error');
  }
});

// // GET /delete-post/:id --> Dashboard // Only authenticated users can access this route -> authMiddleware
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({_id: req.params.id});
    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
  }
});

// // GET /logout // // 
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the cookie
  res.redirect('/'); // Redirect to the home page or any desired route
});


// // // POST/register -->Register in login// //
// router.post('/register',async (req,res)=>{
//     try{
//         const { username, password } = req.body;
//         //hash password
//         const hashPassword = await bcrypt.hash(password,10);// bcrypt-hash to encrypt password
//         try{
//             const user = await User.create({username, password})
//             res.send(201)
//                 .json({message: 'User created', user})
//         }catch(error){
//             if(error.code === 11000){
//                 res.status(400)
//                     .json({message: 'User already available'})
//             }
//             res.status(500)
//                 .json({message: "Internal server error"})
//         }

//         res.redirect('/admin');
//     }catch(error){
//         console.log(error)
//     }
// })


export default router;