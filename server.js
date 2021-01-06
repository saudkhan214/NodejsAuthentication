const express=require('express')
const app= express()
const path=require('path')
const dotenv=require('dotenv')
const expressLayout=require('express-ejs-layouts')
const parser=require('body-parser')
const passport=require('passport')

const mongose=require('mongoose')
const flash=require('express-flash')
const session=require('express-session')
dotenv.config({path:'./config.env'})
require('./passport_config')(passport)
const {refreshToken} =require('./routes/token')


const indexRouter=require('./routes/index')

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))
app.set('layout','layouts/layout')

app.use(expressLayout)
//app.use(express.static('public'))
app.use(express.static(__dirname + '/public'));

app.use(express.json())
app.use(parser.json())
app.use(parser.urlencoded({ extended: true }))
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
  })
  
//this function will run every day once to refresh the 
//token if it is older than 1 month
var dayInMilliseconds = 1000 * 60 * 60 * 24;
setInterval(function() {
    refreshToken();
     },dayInMilliseconds);



app.use('/',indexRouter)
const connectionString=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
app.listen(process.env.PORT|| 5000)

mongose.connect(connectionString,{

    useNewUrlParser:true,
    useUnifiedTopology: true
    
}).then(con=>{
    //console.log(con.connections);
    console.log("Db connected successfully!!")

})

