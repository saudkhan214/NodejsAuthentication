const express=require('express')
const route= express.Router()
const Token=require('../models/TokenAuthentication')
const { ensureAuthenticated } = require('../auth');
const moment=require('moment')

//all token
route.get('/',ensureAuthenticated,(req,res)=>{
     var tokens=[];
     var perPage = 10
    var page = req.query.page || 1
     Token.find({}).skip((perPage * page) - perPage).limit(perPage).sort('-whenCreated').then(docs=>{
        Token.countDocuments().exec(function(err, count){
            if(err){return err}
            docs.forEach(doc=>{
                var date = moment(doc.whenCreated).fromNow();
                
                var token={};
                token._id=doc._id;
                token.token=doc.token;
                token.requestLimit=doc.requestLimit;
                token.remainingRequests=doc.remainingRequests;
                token.whenCreated=date;
                token.refreshAt= moment(doc.whenCreated, "DD-MM-YYYY").add(30, 'days').format("DD-MM-YYYY");
                token.appName=doc.appName
                 tokens.push(token)
             })
        res.render('tokens',{tokens,
            current: page,
            pages: Math.ceil(count / perPage)})
        })
     }).catch(err=>{

     })
    
})

//add token
route.get('/newtoken',ensureAuthenticated,(req,res)=>{
    res.render('addtoken',{message:""})
})

//update token: GET
route.get('/update/:id',ensureAuthenticated,(req,res)=>{

    Token.findOne({_id:req.params.id}).then(doc=>{
        res.render('tokenUpdate',{token:doc,totalLimitMessage:''})

    }).catch(err=>{
        return err
    })
})

//update token: POST
route.post('/update',ensureAuthenticated,(req,res)=>{

    Token.findOne({_id:req.body.id}).then(doc=>{
        doc.appName=req.body.type;
        doc.token=req.body.token;
        doc.requestLimit=req.body.limit;
        doc.remainingRequests=req.body.remainingRequests;
        if(doc.requestLimit < doc.remainingRequests){
            return res.render('tokenUpdate',{token:doc,totalLimitMessage:'Total limit cannnot less then remaining limit'})
        }
        doc.save().then(result=>{
            console.log('save')
            res.redirect('/token')
        })
    }).catch(err=>{
        return err;
    })
})

route.get('/deltoken',ensureAuthenticated,(req,res)=>{
    Token.findByIdAndDelete({_id:req.query.id}).then(success=>{
        res.redirect('/token')
    }).catch(err=>{
        return err
    })
})

route.post('/generatetoken',ensureAuthenticated,async (req,res)=>{
    console.log("body token "+req.body.token)
    if(typeof req.body.token!=='undefined'){
        //generate manually
        //check if this token already exists or not
        Token.findOne({token:req.body.token}).then(doc=>{
            if(doc){
                 res.send(doc)
            }
            else
            {
                const token=new Token({
                    token:req.body.token,
                    requestLimit:req.body.limit,
                    remainingRequests:req.body.limit,
                    appName:req.body.type,
                    whenCreated:Date.now()
                })
                token.save().then(doc=>{
                    res.redirect('/token')
                }).catch(err=>{
                    console.log(err)
                    return err;
                })
            }
        })
    }else{
        //generate automatically
      var key= await GenerateToken()
      const token=new Token({
        token:key,
        requestLimit:req.body.limit,
        remainingRequests:req.body.limit,
        appName:req.body.type,
        whenCreated:Date.now()
      })
      token.save().then(doc=>{
              res.redirect('/token')
      }).catch(err=>{
          return err;
      })
      console.log("Automatic token generated "+key)
    }
})

//generate token
async function GenerateToken()
    {
        var key="";
        try
        {
            
            key = GenerateTokenString();

            //recursion
            if (await IsTokenExists(key))
            {
                GenerateToken();
            }
        }
        catch (ex)
        {
            return ex;
        }
      
        return key;
    }

    //check if token exists in database
    async function IsTokenExists(key){
    return Token.findOne({token:key}).then(doc=>{
        if(doc){
            return true
        }
        else{
            return false
        }
    })
    }


    function GenerateTokenString()
    {
        var token = "";
        try
        {
            //var rnd = new Random();
            var coupon = [];
            for (var i = 0; i < 5; i++)
            {
                coupon[i] = GenerateTokenPatch(8);
            }
            token = coupon.join('');
        }
        catch (ex)
        {
            return ex;
        }
        
        return token;
    }

    //generate token in patch of 8 
    function GenerateTokenPatch(length)
    {
        var result = "";
        try
        {
            var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            for (var i = 0; i < length; i++)
            {
                result+=characters.charAt(Math.floor(Math.random() * characters.length));
            }
        }
        catch (ex)
        {
            return ex;
        }
        
        return result;
    }

    const refreshToken = () => {
        Token.find({}).then(docs=>{
            docs.forEach(doc=>{
                var now=new Date();
                var diff=now.getTime()-doc.whenCreated.getTime();
                var days = Math.floor(diff / (1000 * 60 * 60 * 24));
                if(days==30 || days>30){
                    if(doc.remainingRequests!==doc.requestLimit){
                        doc.remainingRequests=doc.requestLimit;
                        doc.save();
                    }
                }
            })
        })
     }
     

module.exports={route,refreshToken}