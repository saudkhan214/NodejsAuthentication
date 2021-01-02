const express=require('express')
const router= express.Router()
const Token =require('../models/TokenAuthentication')
const {authenticateToken}=require('../auth')
const {parse}=require('tldts')


router.get('/',authenticateToken,(req,res)=>{
    if(typeof req.body.url=='undefined'|| req.body.url==""){
        return res.status(401).send("no url provided")
    }
        var urlParse=parse(req.body.url)
       var result=  UpdateRemainingLimit(req.token,function(response){
       if(response){
        return res.status(200).json({result:urlParse})
       }
       else{
           res.status(500).send("internal server error")
       }
       });
        
})

router.post('/',authenticateToken,(req,res)=>{
    console.log(req.body)
    if(typeof req.body.url=='undefined'|| req.body.url==""){
        return res.status(401).send("no url provided")
    }
        var urlParse=parse(req.body.url)
       var result=  UpdateRemainingLimit(req.token,function(response){
       if(response){
        return res.status(200).json({result:urlParse})
       }
       else{
           res.status(500).send("internal server error")
       }
       });
        
})
 function UpdateRemainingLimit(token,next){
    Token.findOne({token:token},(err,doc)=>{
        doc.remainingRequests=Number(doc.remainingRequests-1)
       return doc.save().then(doc=>{
            if(doc){
                return next(true)
            }
            return next(false);
        })
    })
}

module.exports=router