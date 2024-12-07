import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// // GET HOME // //=>(Home page-index.ejs)
router.get('/',async (req,res)=>{
    try{
        const locals ={
            title:'Simple Blog by Ancy Peter ',
            description:'Simple Blog by Ancy Peter using Nodejs, express & MongoDB'
        }
        let perPage = 6;// Per-page maximum number of post is '6'
        let page = req.query.page || 1;//if no page query then default the page will be 1
        const data = await Post.aggregate([ {$sort: { createdAt:-1 } } ]) //Promise to resolve(pagination) -> wait to fetch all the data
                                .skip(perPage * page - perPage)//perpage=6; =>page=1 =>6 * 1 - 6 
                                .limit(perPage)//Max no of post in a page
                                .exec();//TO execute aggregate
        
        const count = await Post.countDocuments();//Promise to resolve
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);
        res.render('index',{
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,//if hasnextpage
            currentRoute: '/'
        })
    }catch(error){
        console.log(error)
    }
})

// // POST/:id // //=>(Home page-index.ejs)
router.get('/post/:id',async (req,res)=>{
    try{
        const slug = req.params.id;//To grab the ID
        const data = await Post.findById({_id: slug });//Promise to resolve

        const locals ={
            title: data.title,
            description:'Simple Blog by Ancy Peter using Nodejs, express & MongoDB'
        }

        res.render('post',{
            locals,
            data,
            currentRoute: '/post/${slug}'
        })
    }catch(error){
        console.log(error)
    }
})

// // POST/search -> search term// //(Home-search page-search.ejs)
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: 'Simple Blog by Ancy Peter using Nodejs, Express & MongoDB'
        };

        const searchTerm = req.body.searchTerm.trim();
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '');

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search", {
            data,
            locals,
            currentRoute: '/search'
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred during the search process.');
    }
});

// // // Get/about// //
router.get('/about',async (req,res)=>{
    try{
        const locals ={
            title: "About",
            description:'About - Simple Blog by Ancy Peter using Nodejs, express & MongoDB'
        }

        res.render('about',{
            locals,
            currentRoute: '/about'
        })
    }catch(error){
        console.log(error)
    }
})


export default router;
