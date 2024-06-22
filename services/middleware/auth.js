// middleware/auth.js

  const  ensureAuthenticated = async (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
     res.redirect('/admin/admin-login');
    }

   const forwardAuthenticated = async (req, res, next) => {
        if (!req.isAuthenticated()) {
          return next();
        }
       res.redirect('/admin/dashboard');     
      }


  module.exports = {
    forwardAuthenticated,
    ensureAuthenticated
  }
  