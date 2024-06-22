if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }


const House = require("../models/house");
const Land = require("../models/land");
const Blog = require("../models/blog");
const Admin = require("../models/admin");
const Staff = require('../models/staffs');
const Message = require('../models/messages');
const Service = require('../models/services');
const Subscriber = require('../models/subscriber');
const Recovery = require('../models/recovery.js');
const CareerCreation = require('../models/newjob');
const Agent = require ('../models/agent')
const Info = require('../models/companyInfo');
const About = require('../models/about');
const Testimony = require('../models/testimony');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { formatDistanceToNow } = require('date-fns');
const nodemailer = require('nodemailer');
const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;
const PAYSTACK = process.env.PAYSTACK_SECRET_KEY;
const paystack = require('paystack')(PAYSTACK);
const Payment = require('../models/userpayment');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });



  function getTimeDifference(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }


  const getCareer = async ( req , res ) => {
    try {

      const info = await Info.find().exec();
      const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
      const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
      const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
       const blogWithTimeDifference = blog.map(post => ({
      ...post._doc,
      timeDifference: getTimeDifference(post.createdAt),
    }));
      
      const career =  await CareerCreation.find({ status : true }).exec();
  
     await res.render('carearFrontPage', {
        career,
        info:info[0],
        blog: blogWithTimeDifference,
        housgallery,
        about: about[0],
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  const getHome = async (req, res) => {
    try {
      const house = await House.find({ period: "New" }).sort({ createdAt: -1 }).limit(4).exec();
      const land = await Land.find().sort({ createdAt: -1 }).limit(4).exec();
      const info = await Info.find().exec();
      const houses = await House.find().sort({ createdAt: -1 }).limit(4).exec();
      const housgallery = await House.find().sort({ createdAt: -1 }).exec();
      const blog = await Blog.find().sort({ createdAt: -1 }).limit(2).exec();
      const staff = await Staff.find().sort({ createdAt: 1 }).limit(4).exec();
      const test = await Testimony.find().sort({ createdAt: -1 }).exec();
      const about = await About.find({ options: "About" }).exec();
      const service = await Service.find({ category: "Service" }).sort({ createdAt: -1 }).limit(4).exec();
      const services = await Service.find({ category: "Special Offer" });
  
      // Calculate time differences for each blog post
      const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));
  
      await res.render("index", {
        house,
        land,
        info: info[0],
        houses,
        blog: blogWithTimeDifference,
        staff,
        test,
        housgallery,
        service,
        services: services[0],
        about: about[0],
      });
    } catch (err) {
      console.log(err.message);
      return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    }
  };

  
  const getContact = async ( req , res) => {
    try {
       
        const info = await Info.find().exec();
        const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
        const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
         const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));
       await res.render("contacts", {
            info:info[0],
            blog: blogWithTimeDifference,
            housgallery,
            about: about[0],
            
        })
       
    } catch (err) {
      console.log(err.message);
      return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    }
}

const getAboutUs = async ( req , res) => {
    try {
    
        const info = await Info.find().exec();
        const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
        const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const staff = await Staff.find().sort( { createdAt : 1 } ).limit(4).exec(); 
        const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
        const vision = await About.find({options : "Vision"}).sort( { createdAt : -1 } ).exec();
        const mission = await About.find({options : "Mission"}).sort( { createdAt : -1 } ).exec();
        const agent = await Agent.find().sort( { createdAt : -1 } ).limit(4).exec(); 
         const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));

       await res.render("about-us", {
          
            info:info[0],
            blog: blogWithTimeDifference,
            staff,
            housgallery,
            about: about[0],
            vision: vision[0],
            mission: mission[0],
            agent,
           
        })
    } catch (err) {
      console.log(err.message);
      return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    }
};


const getMission = async ( req , res) => {
  try {
  
      const info = await Info.find().exec();
      const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
      const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
      const staff = await Staff.find().sort( { createdAt : 1 } ).limit(4).exec(); 
      const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
    
      const mission = await About.find({options : "Mission"}).sort( { createdAt : -1 } ).exec();
      const agent = await Agent.find().sort( { createdAt : -1 } ).limit(4).exec(); 
       const blogWithTimeDifference = blog.map(post => ({
      ...post._doc,
      timeDifference: getTimeDifference(post.createdAt),
    }));

     await res.render("mission", {
        
          info:info[0],
          blog: blogWithTimeDifference,
          staff,
          housgallery,
          about: about[0],
          mission: mission[0],
          agent,
         
      })
  } catch (err) {
    console.log(err.message);
    return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
};


const getVision = async ( req , res) => {
  try {
  
      const info = await Info.find().exec();
      const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
      const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
      const staff = await Staff.find().sort( { createdAt : 1 } ).limit(4).exec(); 
      const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
      const vision = await About.find({options : "Vision"}).sort( { createdAt : -1 } ).exec();
      const mission = await About.find({options : "Mission"}).sort( { createdAt : -1 } ).exec();
      
      const agent = await Agent.find().sort( { createdAt : -1 } ).limit(4).exec(); 
       const blogWithTimeDifference = blog.map(post => ({
      ...post._doc,
      timeDifference: getTimeDifference(post.createdAt),
    }));

     await res.render("vision", {
        
          info:info[0],
          blog: blogWithTimeDifference,
          staff,
          housgallery,
          about: about[0],
          vision: vision[0],
          agent,
          mission: mission[0]
         
      })
  } catch (err) {
    console.log(err.message);
    return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
};


const getTypography = async ( req , res) => {
    try {
        const house = await House.find({ period : "New"}).sort( { createdAt : -1 } ).limit(4).exec(); 
        const land = await Land.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const info = await Info.find().exec();
        const houses = await House.find().sort( { createdAt : -1 } ).limit(4).exec();
        const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
        const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const service = await Service.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const staff = await Staff.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const test = await Testimony.find().sort( { createdAt : -1 } ).limit(4).exec();
        const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
        
         const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));
       await res.render("typography", {
            house,
            land,
            info:info[0],
            houses,
            blog: blogWithTimeDifference,
            service,
            staff,
            housgallery,
            test,
            about,
           
        })
      
    } catch (err) {
      console.log(err.message);
      return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    }
};


const getBlogPage = async ( req , res ) => {
  try {
    
    
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
    const services = await Service.find({ category: "Special Offer" }).sort( { createdAt : -1 } ).exec();;
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));

  const perPage = 9;
    const page = req.params.page || 1;
      

    await Blog.find()
                .sort({createdAt : -1})
                .skip((perPage * page) - perPage)
                .limit(perPage)
                .then((blog) => {
                    Blog
                    .countDocuments()
                    .then((count) => {
                     res.render("blog-grid", {
                           
                            current: page,
                            pages: Math.ceil(count / perPage), 
                            info:info[0],
                            blog: blogWithTimeDifference,
                            housgallery,
                            services:services[0],
                            about: about[0],

                        })
                    }).catch((err) => {
                        console.log(err);
                        next(err);
                    })
                }).catch((err) => {
                    console.log(err);
                    next(err);
                })

} catch (err) {
  console.log(err.message);
  return res.render('error404', { title: `Internal Server Error: ${err.message}` });
next(err);
}
};


const getSingleBlog = async ( req , res, next ) => {
  try {
    if (req.query && req.query.id) {
        const id = req.query.id;

        // Retrieve the blog post by ID
        const blogs = await Blog.findById(id);
        const info = await Info.find().exec();
        const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
        const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
         const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));

       
      const timeDifference = getTimeDifference(blogs.createdAt);

        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Increment views when the page is visited
        blogs.views += 1;

        await blogs.save();

        res.render("blog-single", {
            blogs: blogs,
            timeDifference ,
            info:info[0],
            blog: blogWithTimeDifference,
            housgallery,
            about: about[0],

        });
    } else {
        return res.status(400).json({ error: 'Invalid request' });
    }
} catch (err) {
  console.log(err.message);
  return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    next(err);
}
};


const likeBlog = async ( req , res , next) => {
  try {
    const blogId = req.body.blogId;

    // Check if the user has already liked this post
    if (req.session.likedBlogPosts.includes(blogId)) {
      return res.status(400).json({ error: 'You have already liked this post during this session' });
    }

    // Find the blog post by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment the like count in the database
    blog.likes += 1;
    await blog.save();

    // Store the liked blog post ID in the session
    req.session.likedBlogPosts.push(blogId);

    // Send a response, indicating success and the updated like count
    res.json({ success: true, likes: blog.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const getAllHouse = async ( req , res ) => {
 
  
  try {
    const filterOption = req.query.filterOption;
    let filter = {};
    
    // Set filter based on selected option
    if (filterOption === 'All') {
      filter = {};
    } else if (filterOption === '1') {
      filter = {}; // No filter applied, sort by createdAt field
    } else if (filterOption === '2') {
      filter = { status: "Rent" }; // For Rent
    } else if (filterOption === '3') {
      filter = { status: "Sale" }; // For Sale
    } else if (filterOption === "4") {
      filter = { status: "Sold" }; // For Sold
    }

    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));
    // Set pagination variables
  
    let query = House.find(filter);
  
    if (filterOption === '1') {
      query = query.sort({ createdAt: -1 }); // Sort by createdAt field, newest to oldest
    }
  
    // Retrieve paginated properties and count total number of properties matching filter
    const result = await query
    const count = await House.countDocuments(filter).exec();

   await res.render("property-grid", {
      result: result,
      filterOption: filterOption,
      info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
    });
  } catch (err) {
    console.log(err.message);
      return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
};


const getSingleHouse = async ( req , res, next ) => {
  try {

    if(req.query) {
        const id = req.query.id

        const prop =  await House.findById(id).exec()
        const staff = await Staff.find({ propid: prop.name.trim() })
        const agent = await Agent.find({ propid: prop.name.trim() })
        const info = await Info.find().exec();
        const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
        const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
        const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
         const blogWithTimeDifference = blog.map(post => ({
        ...post._doc,
        timeDifference: getTimeDifference(post.createdAt),
      }));
                          
      await  res.render("property-single", {
          homes: prop,
          staff: staff[0],
          info:info[0],
          blog: blogWithTimeDifference,
          housgallery,
          about: about[0],
          agent: agent[0]

      })
                            
                       
    }
} catch (err) {
  console.log(err.message);
  return res.render('error404', { title: `Internal Server Error: ${err.message}` });
    next(err)
}
};

const getAllLand = async ( req , res ) => {
  const filterOption = req.query.filterOption;
  let filter = {};
  
  // Set filter based on selected option
  if (filterOption === 'All') {
    filter = {};
  } else if (filterOption === '1') {
    filter = {}; // No filter applied, sort by createdAt field
  } else if (filterOption === '2') {
    filter = { status: "Rent" }; // For Rent
  } else if (filterOption === '3') {
    filter = { status: "Sale" }; // For Sale
  } else if (filterOption === "4") {
    filter = { status: "Sold" }; // For Sold
  }
  
  try {
    // Set pagination variables
  
    let query = Land.find(filter);
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));
  
    if (filterOption === '1') {
      query = query.sort({ createdAt: -1 }); // Sort by createdAt field, newest to oldest
    }
  
    // Retrieve paginated properties and count total number of properties matching filter
    const result = await query
    const count = await Land.countDocuments(filter).exec();

   await res.render("land_property", {
      result: result,
      filterOption: filterOption ,
      info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
    });
  } catch (err) {
    console.log(err.message);
    return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
};


const getSingleLand = async ( req , res ) => {
  try {
    if(req.query) {
      const id = req.query.id

      const prop =  await Land.findById(id).exec()
      const staff = await Staff.find({ propid: prop.name.trim() })
      const agent = await Agent.find({ propid: prop.name.trim() })
      const info = await Info.find().exec();
      const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
      const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
      const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
       const blogWithTimeDifference = blog.map(post => ({
      ...post._doc,
      timeDifference: getTimeDifference(post.createdAt),
    }));
                        
    await  res.render("land_single", {
        homes: prop,
        staff: staff[0],
        info:info[0],
        blog: blogWithTimeDifference,
        housgallery,
        about: about[0],
        agent: agent[0]

    })
                          
                     
  }
} catch (err) {
  console.log(err.message);
  return res.render('error404', { title: `Internal Server Error: ${err.message}` });
}
};


const getTestimonyPage = async ( req , res ) => {
  try {

    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));
  
    res.render('create_feedback', { 
      info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
    })
  } catch (error) {
    console.log(error);
  }
}

const uploads = multer({ dest: 'uploads/' });
const uploadAdminImage = uploads.single('img');
const createTestimony = async ( req , res ) => {
    try {
        const { full_name, testimony} = req.body;
        const errors = [];
  
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);
        if (!result || !result.secure_url) {
         return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
       }
  
        if (!full_name || !testimony ) {
            errors.push( { msg : "Please fill in all fields." } );
        };
    
        if(errors.length > 0){
            res.render('create_feedback', {
                errors: errors,
                full_name: full_name,
                testimony: testimony,
            } )
        } else {
            const newTestimony = new Testimony({
              full_name: full_name,
              testimony: testimony,
              img: {
                            url: result.secure_url,
                            publicId: result.public_id 
                              },
            })
  
            newTestimony
                  .save()
                  .then((value) => {
                    console.log(value)
                    req.flash("success_msg", "Testimony sent Successfully!, thank you for doing business with us.");
                    res.redirect("/feedback-page")
                  })
                  .catch((err) => console.log(err))
        }
    } catch (err) {
        console.log(err.message);
        return res.render('error404', { title:` Internal Server Error: ${err.message}` });
    }
};


const sendContactMessage = async ( req , res ) => {
    try {
        const { first_name, last_name, email, subject, message, phone} = req.body;
        if (!first_name || !last_name || !email || !subject || !message || !phone) {
          req.flash('error', 'Please fill all fields');
            res.redirect('/contacts');
          return;
        }
      
        const newContact = { first_name, last_name, email, subject, message, phone };
        Message.create(newContact)
          .then((contact) => {
             
              req.flash("success_msg", "Message sent");
              // add new subscriber
              const newSubscriber = { email };
              Subscriber.findOne({ email })
                          .then((subscriber) => {
               if (!subscriber) {
                  console.log('Subscriber not found, creating new subscriber');
                  Subscriber.create(newSubscriber)
                    .then((subscriber) => {
                       
                        req.flash("success_msg", "Message sent");
                      
                    })
                    .catch((err) => console.log(err));
                } else {
                  console.log('Subscriber found, not creating new subscriber');
                }
              }).catch((err) => {
                console.log(err)
              });
            res.redirect('/contacts');
          })
          .catch(err => {
            console.log(err);
            req.flash('error_msg', 'Could not save contact');
            res.redirect('/contacts');
          });
    } catch (err) {
        console.log(err.message);
        return res.render('error404', { title:` Internal Server Error: ${err.message}` });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, subject, message } = req.body;

        // Setup email options
        const mailOptions = {
            from: email,
            to: 'Transverserealestates@gmail.com',
            subject: subject,
            text: `Name: ${first_name} ${last_name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
        };

        // Setup transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'Transverserealestates@gmail.com',
                pass: process.env.PASSWORD_EMAIL // Ensure this is securely stored in environment variables
            }
        });

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('MF255'); // Use appropriate error code
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send('MF000'); // Success code
            }
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).send('MF255'); // General error code
    }
};


// Paystack code for transverse
const getPaymentErrorPage = async ( req , res ) => {
  try {
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));
  
    await 
      res.
      render("error404", {
        title: 'An error occurred while processing your payment',
        info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
      });
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};



const getPaymentPage = async ( req , res ) => {
  try {

    const id = req.query.id;
    const housetopay = await House.findById(id).exec();
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));

  console.log(housetopay)
    await res.render('payment', {
      info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
      housetopay: housetopay,
    })
    
  } catch (err) {
    console.log(err.message);
    return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
}

const payStackPayment = async (req, res) => {
  try {
    const username = req.body.username;
    const propertyId = req.body.propertyId;
    const house_name = req.body.house_name;
    const email = req.body.email;
    const amount = req.body.amount * 100; // Paystack amount is in kobo (1/100 of a naira)
    let errors = [];
    const id = req.body.id;
    const house = await House.findById(id).exec();
    const price = house.price;

    if (amount < price) {
      errors.push({ msg: "You cannot pay less than the encrypted amount" });
    }

    if (errors.length > 0) {
      req.flash('error_msg', "Payment Error: " + errors[0].msg);
      // Redirect with error message
      return res.redirect(`/payments?id=${id}`);
    } else {
      const payment = await paystack.transaction.initialize({
        username: username,
        propertyId: propertyId,
        errors: errors,
        email: email,
        amount: amount,
        house_name: house_name,
        metadata: {
          custom_fields: [
            {
              display_name: "House Name",
              variable_name: "house_name",
              value: house_name
            },
            {
              display_name: "Username",
              variable_name: "username",
              value: username
            },
            {
              display_name: "Property ID",
              variable_name: "propertyId",
              value: propertyId
            }
          ]
        },
        callback_url: "https://transversehomes.onrender.com/callback",
      });
      if (payment && payment.data && payment.data.authorization_url) {
        res.redirect(payment.data.authorization_url);
      } else {
        console.error("Payment initialization failed", payment);
        req.flash('error_msg', "Payment initialization failed. Please try again.");
        res.redirect(`/payments?id=${id}`);
      }
    }
  } catch (error) {
    console.log(error);
    req.flash('error_msg', "Internal server error. Please try again.");
    res.redirect('/error');
  }
};



const payStackCallBack = async ( req , res ) => {
  try {
         
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let voucherCode = '';
    for (let i = 0; i < 6; i++) {
      voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  const codes = voucherCode
  const reference = req.query.reference;
  const payment = await paystack.transaction.verify(reference);
  if (payment.data.status === 'success') {

    const house_name = payment.data.customer.house_name
    const username = payment.data.customer.username
    const propertyId = payment.data.customer.propertyId
    const email = payment.data.customer.email;
    const amount = payment.data.amount / 100; // convert from kobo to naira
    const paymentId = codes; // custom code generation function

    if (!house_name || !username || !propertyId) {
      throw new Error("Missing required fields in Paystack response");
    }

    const order = new VoucherPayment({
      username: username,
      email: email,
      amount: amount,
      propertyId: propertyId,
      reference: reference,
      paymentId: paymentId,
      paymentStatus: 'paid',
      house_name: house_name,
    });
    await order.save();
    res.render('success', { 
      username: username,
      email: email,
      amount: amount,
      propertyId: propertyId,
      reference: reference,
      paymentId: paymentId,
      paymentStatus: 'paid',
      house_name: house_name,
     });
  } else {
    res.redirect('/error');
  }
} catch (error) {
  console.log(error);
  res.redirect('/error');
}
};


// Paystack code for transverse LAND
const LandgetPaymentErrorPage = async ( req , res ) => {
  try {
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));
  
    await 
      res.
      render("error404", {
        title: 'An error occurred while processing your payment',
        info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
      });
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};



const landGetPaymentPage = async ( req , res ) => {
  try {

    const id = req.query.id;
    const housetopay = await Land.findById(id).exec();
    const info = await Info.find().exec();
    const housgallery = await House.find().sort( { createdAt : -1 } ).exec(); 
    const blog = await Blog.find().sort( { createdAt : -1 } ).limit(4).exec(); 
    const about = await About.find({options : "About"}).sort( { createdAt : -1 } ).exec();
     const blogWithTimeDifference = blog.map(post => ({
    ...post._doc,
    timeDifference: getTimeDifference(post.createdAt),
  }));

  console.log(housetopay)
    await res.render('lanpayment', {
      info:info[0],
      blog: blogWithTimeDifference,
      housgallery,
      about: about[0],
      housetopay: housetopay,
    })
    
  } catch (err) {
    console.log(err.message);
    return res.render('error404', { title: `Internal Server Error: ${err.message}` });
  }
}


const LandPayStackPayment = async (req, res) => {
  try {
    const { username, propertyId, house_name, email, amount: amountInNaira, id } = req.body;
    const amount = amountInNaira * 100; // Paystack amount is in kobo (1/100 of a naira)
    let errors = [];

    const house = await Land.findById(id).exec();
    if (!house) {
      throw new Error("House not found");
    }
    const price = house.price;

    if (amount < price) {
      errors.push({ msg: "You cannot pay less than the required amount" });
    }

    if (errors.length > 0) {
      req.flash('error_msg', "Payment Error: " + errors[0].msg);
      return res.redirect(`/paymentss?id=${id}`);
    }

    const payment = await paystack.transaction.initialize({
      email: email,
      amount: amount,
      metadata: {
        custom_fields: [
          { display_name: "House Name", variable_name: "house_name", value: house_name },
          { display_name: "Username", variable_name: "username", value: username },
          { display_name: "Property ID", variable_name: "propertyId", value: propertyId },
        ]
      },
      callback_url: "https://transversehomes.onrender.com//callback",
    });

    if (payment && payment.data && payment.data.authorization_url) {
      res.redirect(payment.data.authorization_url);
    } else {
      console.error("Payment initialization failed", payment);
      req.flash('error_msg', "Payment initialization failed. Please try again.");
      res.redirect(`/paymentss?id=${id}`);
    }

  } catch (error) {
    console.log(error);
    req.flash('error_msg', "Internal server error. Please try again.");
    res.redirect('/error');
  }
};


const landPayStackCallBack = async (req, res) => {
  try {
    const reference = req.query.reference;
    const payment = await paystack.transaction.verify(reference);

    console.log("Payment Object:", JSON.stringify(payment, null, 2)); // Log the full response for debugging

    if (payment.data.status === 'success') {
      const metadata = payment.data.metadata;
      const house_name = metadata.custom_fields.find(field => field.variable_name === 'house_name')?.value;
      const username = metadata.custom_fields.find(field => field.variable_name === 'username')?.value;
      const propertyId = metadata.custom_fields.find(field => field.variable_name === 'propertyId')?.value;
      const email = payment.data.customer.email;
      const amount = payment.data.amount / 100; // convert from kobo to naira
      const paymentId = reference;

      if (!house_name || !username || !propertyId) {
        throw new Error("Missing required fields in Paystack response");
      }

      const order = new Payment({
        username: username,
        email: email,
        amount: amount,
        propertyId: propertyId,
        reference: reference,
        paymentId: paymentId,
        paymentStatus: 'paid',
        house_name: house_name,
      });
      await order.save();
      res.render('success', {
        username: username,
        email: email,
        amount: amount,
        propertyId: propertyId,
        reference: reference,
        paymentId: paymentId,
        paymentStatus: 'paid',
        house_name: house_name,
      });
    } else {
      res.redirect('/error');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/error');
  }
};




module.exports = {
    getHome,
    getContact,
    getAboutUs,
    getTypography,
    uploadAdminImage,
    getBlogPage,
    getSingleBlog,
    getAllHouse,
    getSingleHouse,
    getAllLand,
    getSingleLand,
    getTestimonyPage,
    createTestimony,
    sendContactMessage,
    sendMessage,
    likeBlog,
    getVision,
    getMission,
    payStackPayment,
    payStackCallBack,
    getPaymentPage ,
    getPaymentErrorPage,
    landPayStackCallBack,
    LandPayStackPayment,
    landGetPaymentPage,
    LandgetPaymentErrorPage,
    getCareer,
}