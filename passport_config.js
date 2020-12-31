const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcryptjs')
const User=require('./models/User')


module.exports = function(passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
        User.findOne({
          email: email
        }).then(user => {
          if (!user) {
              console.log(user)
            return done(null, false, { message: 'That email is not registered' });
          }
  
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        });
      })
    );
  
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
  
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
  };


// function Initialize(passport){
//     const autheticateUser=async (email,password,done)=>{

//         const user=getUserbyEmail(email)
//         console.log(user)
//         if(user==null){
//             return done(null,false,{message:'no such user with that email'})
//         }
//         try{
//             if(await bcrypt.compare(password,user.password)){
//                 return done(null,user)

//             }else{
//                 return done(null,false,{message:'incorrect password'})
//             }

//         }catch(e){
//             return done(e)
//         }
       
//     }
//     passport.use(new LOcalStrategy({usernameField:'email'},autheticateUser))
//     passport.serializeUser((user,done)=>done(null,user.id))
//     passport.deserializeUser((id,done)=>{
//         User.findById(id,(err,usr)=>{
//         done(err,usr)
//     })
// })
// }
// module.exports=Initialize;