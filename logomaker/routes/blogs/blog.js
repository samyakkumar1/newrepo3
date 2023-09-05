var express = require('express')
var router = express.Router();

router.get('/blog',function(req,res){
    res.render('blog',{
        pageTitle: 'Blog: Tagbit',
        pageID:'blog'
    });
    console.log('connection working')
});

module.exports = router;