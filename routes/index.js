const express=require('express')
const router= express.Router()
const token=require('./token')
const user=require('./user')
const urlExtracter=require('./urlExtracter')
const { forwardAuthenticated } = require('../auth');


router.get('/',forwardAuthenticated,(req,res)=>{
    res.render('login')
})


router.use('/token',token)
router.use('/user',user)
router.use('/extractUrl',urlExtracter)

module.exports=router