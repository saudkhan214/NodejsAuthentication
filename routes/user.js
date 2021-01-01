const express=require('express')
const router= express.Router()
const User=require('../models/User')
const bcrypt=require('bcryptjs')
const passport=require('passport')
const { ensureAuthenticated } = require('../auth');
const moment=require('moment')


// all admins
router.get('/',ensureAuthenticated,(req,res)=>{
    var users=[];
    var perPage = 10
    var page = req.query.page || 1
    User.find({}).skip((perPage * page) - perPage).limit(perPage).sort('-whenCreated').then(doc=>{
        User.where('email').ne(req.user.email).countDocuments().exec(function(err, count){
            if(err){return err}
            doc.forEach(user=>{
                if(user.email!=req.user.email){
                    var usr={};
                    usr._id=user._id;
                    usr.email=user.email;
                    usr.whenCreated=moment(user.whenCreated).fromNow();
                    users.push(usr)
                }
            })
            res.render('users',{users,
            current: page,
            pages: Math.ceil(count / perPage)
            })
        })
       
    }).catch(err=>{
        return err
    })
    
})

//register admin
router.get('/newUser',ensureAuthenticated,(req,res)=>{
    res.render('register',{message:''})
});
router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
})

router.post('/register',(req,res)=>{

    if(req.body.password!==req.body.confirmPassword){
      return  res.render('register',{message:'Password and Confirm Password must match'})
        // return req.flash('error', 'Password and Confirm Password must match')
    }
    bcrypt.genSalt(8,(err,salt)=>{
    bcrypt.hash(req.body.password,salt,(err,hashPass)=>{
        if (err) throw err;
        const user=new User({
            email:req.body.email,
            password:hashPass,
            whenCreated:Date.now()
        })
        user.save().then(doc=>{
            console.log(doc)
        }).catch(err=>{
            return req.flash('error', 'failed to register')
        })
    })
})
    res.redirect('/user')
})

//delete admin
router.get('/deluser',ensureAuthenticated,(req,res)=>{
    User.deleteOne({_id:req.query.id}).then(success=>{
        res.redirect('/user')
    }).catch(err=>{
        return err
    })
})

// Login
router.post('/login', (req, res,next) => {


    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
      })(req, res, next);

  });

module.exports=router