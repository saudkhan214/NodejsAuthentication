const Token =require('./models/TokenAuthentication')


module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/token');      
    },

    authenticateToken:function(req,res,next){
      var token =req.headers['authorization'];
    if(token=='undefined' || token==""){
       return res.status(401).send("no token provide")
    }
    Token.findOne({token:token}).then(doc=>{
        if(!doc){
           return res.status(404).send("not autenticated token")
        }else{
          if(doc.appName!=="urlParser"){
            return res.status(404).send("token not related to this application")
          }
            if(doc.remainingRequests==0){
               return res.status(503).send("token limit exceed please try another one")
            }
            req.token=token;
            return next()
        }
    })

    }
  };