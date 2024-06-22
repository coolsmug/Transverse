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
const CareerCreation = require('../models/newJob');
const Agent = require ('../models/agent')
const Info = require('../models/companyInfo');
const About = require('../models/about')
const passport = require('passport');
var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const { Readable } = require('stream');
const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;
const sanitizeHtml = require('sanitize-html');
const { session } = require("passport");
;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  
const getLogInPage = async ( req , res ) => {
    try {
        res.render('login')
    } catch (err) {
        console.log(err)
    }
};


const logAdminIn = async ( req , res, next ) => {
    
        passport.authenticate("admin_login", (err, user, info)=> {
            if (err) {
             return next(err) 
            } 
              if(user) {
                req.logIn(user, function(err) {
                  if (err) {
                    return next(err);
                  }
                  res.redirect("/admin/dashboard");
                  req.flash('success_msg', `You are welcome ${req.user.first_name}`);
                  
                  
                })
               
              }
              else {
                req.logOut(function (err) {
                  if (err) {
                      return next(err);
                  }
                  req.flash('error_msg', 'Login details not correct');
                  res.redirect('/admin/admin-login')
                  
              })
              }
           
          
          })(req, res, next);
   
}

const logAdminOut = async ( req , res, next) => {
    try {
        req.logOut(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('error_msg', 'Session Terminated');
            res.redirect('/admin/admin-login')
        })
    } catch (err) {
        
    }
}

const getDashboard = async ( req , res ) => {
 
        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.setHeader('Expires', '-1');
        res.setHeader('Pragma', 'no-cache');
         try {
          const land = await Land.countDocuments({ status: {$in : ["Sale", "Rent"]}}).exec();
          const house = await House.countDocuments({ status: {$in : ["Sale", "Rent"]}}).exec();
          const staff = await Staff.countDocuments({status : true}).exec();
          const contact = await Message.countDocuments().exec();
          const lands = await Land.countDocuments({ status: "Sold"}).exec();
          const houses = await House.countDocuments({ status: "Sold"}).exec();
          const about = await Info.find().select("_id company_name name address state mobile mobile2 mobile3 whatsapp email img").sort({ createdAt: -1 }).limit(1).exec();
          const service = await Service.find().select("message heading").sort({createdAt : -1}).exec();
          const subscriber = await Subscriber.find().select("email").exec();
      
        await res.render("dashboard", {
            user: req.user,land,house,staff,contact,houses,lands,about: about[0],service, subscriber,
          })
         } catch (error) {
          console.log(error)
          res.json("error:" + error)
         }
   
        
    };


    const getCreatHouse = async (req, res) => {
        try {
            await res.render("create_housing", {
                user: req.user,
              })
        } catch (err) {
            console.log(err)
        }
    };


    const getCreateLand = async ( req , res ) => {
        try {
            await res.render("create_land" , {
                user: req.user,
              })
        } catch (err) {
            console.log(err)
        }
    };
    
   
    const getCreateBlog = async ( req , res ) => {
        try {
            await res.render("create_blog" , {
                user: req.user,
              })
        } catch (err) {
            console.log(err)
        }
    };
  
    const getCreateAdmin = async ( req , res ) => {
        try {
            await res.render("create_admin", {
                user: req.user,
              })
        } catch (err) {
            console.log(err)
        }
    };
    
    const getCreateStaff = async ( req , res ) => {
        try {
            await res.render("create_staff" , {
                user: req.user,
              })
        } catch (err) {
            console.log(err)
        }
    };


    const getAllHousePagination  = async ( req , res, next ) => {
        try {
            var perPage = 10;
            var page = req.params.page || 1;
          
       await House
              .find()
              .skip((perPage * page) - perPage)
              .limit(perPage)
              .then((prop) => {
                House
                    .countDocuments()
                    .then((count) => {
                  res.render('housing', {
                    prop: prop,
                    user: req.user,
                    current: page,
                    pages: Math.ceil(count / perPage)
                  });
                }).catch((err) => {
                    console.log(err)
                    next(err)
                });
              }).catch((err) => {
                console.log(err)
                next(err)
                }) ;
          } catch (error) {
            console.log(error)
          }
    };
    

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
}).fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
  { name: 'floor_plan', maxCount: 1 },
]);

const storages = multer.memoryStorage();
const uploadVideo = multer({ storage: storages });

// Middleware to handle file uploads to Cloudinary
const uploadMultiple = async (req, res, next) => {
  try {
    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['img2'][0].path);
    const floorPlanResult = await cloudinary.uploader.upload(req.files['floor_plan'][0].path);

    req.uploadResults = { imgResult, img2Result, floorPlanResult };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};

// Controller function for creating a house
const createHouse = async (req, res) => {
  try {
    const { imgResult, img2Result, floorPlanResult } = req.uploadResults;
    const { house_id, name, categories, location, status, area, bed, baths, garage, amenities, description, period, price } = req.body;

    // Generate property code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let voucherCode = '';
    for (let i = 0; i < 4; i++) {
      voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const codes = voucherCode;

    const errors = [];

    if (!name || !location || !status || !categories || !area || !bed || !baths || !garage || !amenities || !description || !period || !price) {
      errors.push({ msg: "Please fill in all fields." });
    }

    if (errors.length > 0) {
      res.render('create_housing', {
        errors, name, user: req.user, location, categories, status, area, bed, baths, garage, amenities, description, period, price,
      });
    } else {
      // Check if property with the given property_id already exists
      const existingProperty = await House.findOne({ house_id });
      if (existingProperty) {
        errors.push({ msg: 'Oops! ID found with an existing Property. Try Again' });
        res.render('create_housing', {
          errors, name, user: req.user, location, categories, status, area, bed, baths, garage, amenities, description, period, price,
        });
      } else {
        // Create a new property object
        const property = {
          house_id: codes,
          name,
          location,
          categories,
          status,
          area,
          bed,
          baths,
          garage,
          amenities: amenities.split('  ').map(amenity => amenity.trim()),
          description,
          period,
          price,
          img: {},
          img2: {},
          floor_plan: {},
        };

        if (req.files['img']) {
          property.img = {
            url: imgResult.secure_url,
            publicId: imgResult.public_id,
          };
        }
        if (req.files['img2']) {
          property.img2 = {
            url: img2Result.secure_url,
            publicId: img2Result.public_id,
          };
        }
        if (req.files['floor_plan']) {
          property.floor_plan = {
            url: floorPlanResult.secure_url,
            publicId: floorPlanResult.public_id,
          };
        }

        // Save the property to MongoDB
        await House.create(property);

        req.flash("success_msg", "Data Registered!");
        res.redirect('/admin/create-housing');
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error.');
  }
};

const getEditHousePage = async ( req , res ) => {

    if (req.query.id) {
        try {
            const id = req.query.id;
            await House.findById(id)
                    .then((prop) => {
                        if (!prop) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit-property", 
                                {
                                    prop: prop,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};


const editHouse = async ( req, res ) => {
    try {
        const propertyId = req.params.id;
        if (!propertyId) {
          throw new TypeError("Invalid property ID");
        }
    
        const property = {
          name: req.body.name,
          location: req.body.location,
          status: req.body.status,
          area: req.body.area,
          bed: req.body.bed,
          baths: req.body.baths,
          garage: req.body.garage,
          price: req.body.price,
          categories: req.body.categories,
          amenities: req.body.amenities.split("  ").map(function (amenity) {
            return amenity.trim();
          }),
          description: req.body.description,
          period: req.body.period,
        };
    
        const filter = { _id: propertyId };
        const update = { $set: property };
        const options = { returnOriginal: false };
    
        const result = await House.findOneAndUpdate(filter, update, options);
    
        if (!result) {
          return res.status(404).json({ error: "Property not found" });
        }
    
        return res.json("Successfully updated property");
      } catch (error) {
        if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
        console.log(error);
        return res.status(500).send();
      }
};

const deleteHouse = async ( req , res ) => {
    const id = req.params.id;
    await House.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
};

const viewHouseDetail = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
          await House.findById(id)
                    .then((land) => {
                        if (!land) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "view_house", 
                                {
                                    land: land,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
}

// Controller function for uploading house images
const uploadHouseImages = async (req, res) => {
  try {
    const propertyId = req.params.id;

    if (!propertyId) {
      throw new TypeError("Invalid property ID");
    }

    const property = {};
    const { imgResult, img2Result, floorPlanResult } = req.uploadResults;

    if (req.files['img']) {
      property.img = {
        url: imgResult.secure_url,
        publicId: imgResult.public_id,
      };
    }
    if (req.files['img2']) {
      property.img2 = {
        url: img2Result.secure_url,
        publicId: img2Result.public_id,
      };
    }
    if (req.files['floor_plan']) {
      property.floor_plan = {
        url: floorPlanResult.secure_url,
        publicId: floorPlanResult.public_id,
      };
    }

    const filter = { _id: propertyId };
    const update = { $set: property };
    const options = { returnOriginal: false };

    const result = await House.findOneAndUpdate(filter, update, options);

    if (!result) {
      return res.status(404).json({ error: "Property not found" });
    }

    req.flash("success_msg", "Images Uploaded");
    return res.redirect('/admin/edit-property?id=' + propertyId);
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).send();
  }
};

// Controller function for uploading house videos
const uploadHouseVideo = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }


    const bufferStream = Readable.from(req.file.buffer);

    const id = req.params.id;


    const uploaderStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'videos',
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }

        House.findById(id)
          .then((prop) => {
            prop.video = {
              cloudinaryId: result.public_id,
              videoUrl: result.secure_url,
            };
            return prop.save();
          })
          .then(() => {
            req.flash('success_msg', 'Video Uploaded');
            return res.redirect(`/admin/edit-property?id=${id}`);
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: 'Database update failed' });
          });
      }
    );

    //to Pipe the buffer stream to the Cloudinary uploader stream
    bufferStream.pipe(uploaderStream);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//done with HOUSE properties

//Creating property LAND ............................

const uploadLandandEtc = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
      }
      cb(null, true);
    }
  }).fields([
    { name: 'img', maxCount: 1 },
    { name: 'image', maxCount: 1 }
   
  ]);

const uploadMultipleLandImage = async (req, res, next) => {
    try {
      const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
      const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
    
    
      req.uploadResults = {
        imgResult,
        img2Result,
      };
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file to Cloudinary.');
    }
  };


  const createLand = async ( req , res ) => {
    try {
        const { imgResult, img2Result} = req.uploadResults;
    const {land_id, name, location, status, area, amenities, description, period, price} = req.body;

      //generate property code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let voucherCode = '';
      for (let i = 0; i < 4; i++) {
        voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const codes = voucherCode;
  
      const errors = [];
      if (!name ||!location ||!status ||!area ||!amenities ||!description ||!period ||!price) {
          errors.push({ msg: "Please fill in all fields." });
        }

         
      if (errors.length > 0) {
        res.render('create_land', {
          errors: errors,name: name,location: location,status: status,area: area, amenities: amenities,
          description: description, period: period,price: price, user: req.user,
   
        });
      } else {
        const existingLand = await Land.findOne({ land_id });
        if (existingLand) {
          errors.push({ msg: 'Oops! ID found with an existing Land Property. Try Again' });
          res.render('create_land', {
            errors: errors,name: name,location: location,status: status,area: area, amenities: amenities,
            description: description, period: period,price: price, user: req.user,
     
          });
        }else 
  
         {
                    const lands ={
                        land_id: voucherCode,
                        name: name,
                        location: location,
                        status: status,
                        area: area,
                        amenities: amenities.split('  ').map(armenity => armenity.trim()),
                        description: description,
                        price: price,
                        period: period,
                          img: {},
                          image: {},
                      };
              
                      if (req.files['img']) {
                          lands.img = {
                            url: imgResult.secure_url,
                            publicId: imgResult.public_id,
                          };
                        }
                        if (req.files['image']) {
                          lands.image = {
                            url:  img2Result.secure_url,
                            publicId:  img2Result.public_id,
                          };
                        }
                      Land.create(lands)
                                      .then((data) => {
                                          req.flash("success_msg", "Data Registered !");
                                          res.redirect('/admin/create-land');
                                      }).catch((err) => {
                                          console.log(err)
                                      })
                         }
      }

    } catch (err) {
        console.log(err);
    }
  };



  const getLandPage = async ( req , res, next) => {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
      
  await Land
          .find()
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .then((land) => {
            Land
                .countDocuments()
                .then((count) => {
              res.render('land', {
                land: land,
                current: page,
                user: req.user,
                pages: Math.ceil(count / perPage)
              });
            }).catch((err) => {
                console.log(err)
                next(err)
            });
          }).catch((err) => {
            console.log(err)
            next(err)
            }) ;
      } catch (error) {
        console.log(error)
      }
  };

  const getEditLandPAge = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
           await Land.findById(id).select("land_id name status area period location")
                    .then((land) => {
                        if (!land) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_land", 
                                {
                                    land: land,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
  }

  const editLand = async ( req , res ) => {
    try {

        const propertyId = req.params.id;
  
        if (!propertyId) {
          throw new TypeError("Invalid property ID");
        }
    
        const property = {
          name: req.body.name,
          location: req.body.location,
          status: req.body.status,
          area: req.body.area,
          price: req.body.price,
          amenities: req.body.amenities.split("  ").map(function (amenity) {
            return amenity.trim();
          }),
          description: req.body.description,
          period: req.body.period,
        };
    
        const filter = { _id: propertyId };
        const update = { $set: property };
        const options = { returnOriginal: false };
    
    const result = await Land.findOneAndUpdate(filter, update, options);
    
        if (!result) {
          return res.status(404).json({ error: "Property not found" });
        }
    
        return res.json("Successfully updated property");
      } catch (error) {
        if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
        console.log(error);
        return res.status(500).send();
      }
    
  };

  const viewSingleLand = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
           await Land.findById(id)
                    .then((land) => {
                        if (!land) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "view_land", 
                                {
                                    land: land,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
  };

  const deleteLand = async ( req , res ) => {
    const id = req.params.id;
    await Land.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
  }


  const editLandImage = async ( req , res ) => {
    try {
        const propertyId = req.params.id;
  
        if (!propertyId) {
          throw new TypeError("Invalid property ID");
        }

        const property_land = {};
        const { imgResult, img2Result } = req.uploadResults;

        
    if (req.files['img']) {
        property_land.img = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        };
      }
      if (req.files['image']) {
        property_land.image = {
          url: img2Result.secure_url,
          publicId: img2Result.public_id,
        };
      }
  
    const filter = { _id: propertyId };
    const update = { $set: property_land };
    const options = { returnOriginal: false };
  
    const result = await Land.findOneAndUpdate(filter, update, options);
        
    if (!result) {
        return res.status(404).json({ error: "property_land not found" });
      }
      req.flash("success_msg", "Images Uploaded");
     
      return res.redirect('/admin/edit-land?id=' + propertyId);

    } catch (err) {
        if (err.name === "CastError" || err.name === "TypeError") {
            return res.status(400).json({ err: err.message });
          }
          console.log(err);
          return res.status(500).send();
    }
  };

  //done with Land Property

  // create BLOG
  const uploadMultipleBlogImage = async (req, res, next) => {
    try {
   
      const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
      const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
    
    
      req.uploadResults = {
        imgResult,
        img2Result,
      };
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file to Cloudinary.');
    }
  };
  // 

const createBlog = async ( req , res ) => {
    try {
        const {fullname, category, article, topic} = req.body;
        const errors = [];
       
        const {
         imgResult,
         img2Result,
       } = req.uploadResults;
     
        if (!fullname || !category || !article || !topic) {
            errors.push( { msg : "Please fill in all the fields."} )
        }
        if (errors.length > 0) {
            res.render('create_blog', {
               errors: errors,
               fullname: fullname,
               category: category, 
               article: article, 
               topic: topic, 
               user: req.user,
            })
        } else{
           
           const blog = {
               fullname: fullname,
               category: category, 
               article: article, 
               topic: topic, 
               img: {},
               image: {},
           } 


            const sanitizedContent = sanitizeHtml(blog.article, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        });
        
     
           
           if (req.files['img']) {
             blog.img = {
               url: imgResult.secure_url,
               publicId: imgResult.public_id,
             }
           }
           if (req.files['image']) {
             blog.image = {
               url: img2Result.secure_url,
               publicId: img2Result.public_id,
             }
           }
     
           Blog.create(blog)
           .then((data) => {
              
               req.flash("success_msg", "Data Registered !");
               res.redirect('/admin/create-blog');
           }).catch((err) => {
               console.log(err)
           }).catch((err) => console.log (err))
       }
    } catch (err) {
        console.log(err)
    }
};


//Edit Blog

const editBlogImage = async ( req , res ) => {
    try {
        const blogId = req.params.id;
  
        if (!blogId) {
          throw new TypeError("Invalid blog ID");
        }
  
        const {
          imgResult,
          img2Result,
        } = req.uploadResults;
    
        const blog = {};
    
        if (req.files['img']) {
          blog.img = {
            url: imgResult.secure_url,
            publicId: imgResult.public_id,
          }
        }
        if (req.files['image']) {
          blog.image = {
            url: img2Result.secure_url,
            publicId: img2Result.public_id,
          }
        }
    
        const filter = { _id: blogId };
        const update = { $set: blog };
        const options = { returnOriginal: false };
    
        const results = await Blog.findOneAndUpdate(filter, update, options);
    
        if (!results) {
          return res.status(404).json({ error: "blog not found" });
        }
        req.flash("success_msg", "Images Uploaded");
        return res.redirect('/admin/edit-blog?id=' + blogId);
  
    } catch (error) {
        if (error.name === "CastError" || error.name === "TypeError") {
            return res.status(400).json({ error: error.message });
          }
          console.log(error);
          return res.status(500).send();
    }
};


const getBlogPage = async ( req , res, next ) => {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
      
      await Blog
          .find({})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .then((blog) => {
            Blog
                .countDocuments()
                .then((count) => {
              res.render('blog', {
                blog: blog,
                current: page,
                user: req.user,
                pages: Math.ceil(count / perPage)
              });
            }).catch((err) => {
                console.log(err)
                next(err)
            });
          }).catch((err) => {
            console.log(err)
            next(err)
            }) ;
      } catch (error) {
        console.log(error)
      }
};

const getEditBlogPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
           await Blog.findById(id)
                    .then((blog) => {
                        if (!blog) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_blog", 
                                {
                                    blog: blog,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};


const editBlog = async ( req , res ) => {
    try {
        const {fullname, category, article, topic} = req.body;
         const blogId = req.params.id;
         if (!blogId) {
          throw new TypeError("Invalid blog ID");
        }
   
        const blog = {
          fullname: fullname,
          category: category, 
          article: article, 
          topic: topic, 
      };
   
        const filter = { _id: blogId };
        const update = { $set: blog };
        const options = { returnOriginal: false };
   
     const result = await Blog.findOneAndUpdate(filter, update, options);
      
        if (!result) {
          return res.status(404).json({ error: "Blog not found" });
        }
    
        return res.json("Successfully updated Blog");
      
     } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
         console.log (error);
         return res.status(500).send();
     }
};

const deleteBlog = async ( req , res ) => {
    const id = req.params.id;
    await Blog.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
}

//Blog end here

// ADMIN start here
const uploadsAdmin = multer({ dest: 'uploads/' });
const uploadAdminImage = uploadsAdmin.single('img');
  
const createAdmin = async ( req , res, next ) => {
    try {
        const { first_name, second_name, position, password, password2, email, role} = req.body;
        const errors = [];
  
       const result = await cloudinary.uploader.upload(req.file.path);
      
       if (!result || !result.secure_url) {
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }
      
        if (!first_name || !second_name || !position || !password || !password2 || !email || !role) {
            errors.push( { msg : "Please fill in all fields." } );
        }
        if (password !== password2) {
            errors.push( { msg : "Password not match." } );
        }
        if (password.length < 8) {
            errors.push({ msg: "password atleast 8 character" });
          }
        if(errors.length > 0){
            res.render('create_admin', {
                errors: errors,
                first_name: first_name,
                second_name: second_name,
                position: position,
                role: role,
                password: password,
                password2: password2,
                email: email,
                user: req.user,
      
            } )
            
        }else{
            Admin.findOne( { email: email } )
                      .then((user) => {
               
                if(user) {
                    errors.push( { msg: "The email provided already associated with an existing User" } );
                    res.render('create_admin', {
                        errors: errors,
                        first_name: first_name,
                        second_name: second_name,
                        position: position,
                        role: role,
                        password: password,
                        password2: password2,
                        email: email,
                        user: req.user,
                    } )
                   
                }
                else if (!user) {
                      const newAdmin = new Admin ({
                          first_name: first_name,
                          second_name: second_name,
                          position: position,
                          role: role,
                          password: password,
                          password2: password2,
                          email: email,
                          img: {
                            url: result.secure_url,
                            publicId: result.public_id 
                              },
                      });
                      
                      bcrypt.genSalt(10, (err, salt) =>
                      bcrypt.hash(newAdmin.password, salt,
                          (err, hash) => {
                              if (err) throw err;
        
                              newAdmin.password = hash;
        
                              newAdmin.save()
                                  .then((value) => {
                                     
                                      req.flash(
                                        "success_msg",
                                        "An Admin Registered Successfully!"
                                      );
                                      res.redirect("/admin/create-admin");
                                      
                                  })
                                  .catch(err => {
                                      console.log(err)
                                      next(err)
                                  })
                          })) 
  
      
                }
            }).catch((err) => {
                  console.log(err);
                  next(err)
            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
};


const getAdminPage = async ( req , res, next ) => {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
      
       await Admin
          .find({})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .then((admin) => {
            Admin
                .countDocuments()
                .then((count) => {
              res.render('admin', {
                admin: admin,
                current: page,
                user: req.user,
                pages: Math.ceil(count / perPage)
              });
            }).catch((err) => {
                console.log(err)
                next(err)
            });
          }).catch((err) => {
            console.log(err)
            next(err)
            }) ;
      } catch (error) {
        console.log(error)
      }
};


const getEditAdminPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
         await Admin.findById(id)
                    .then((admin) => {
                        if (!admin) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_admin", 
                                {
                                    admin: admin,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};


const editAmin = async ( req , res ) => {
    try {
        const id = req.params.id;
        const { first_name, second_name, position, password, email, role} = req.body;
  
        await Admin.findById(id)
                  .then((user) => {
            user.first_name = first_name;
            user.second_name = second_name;
            user.position = position;
            user.email = email;
            user.role = role;
            user
                .save()
                .then((user) => {
                    res.json("User updated!")
                }).catch((err) =>{ 
                console.log (err)
                  next(err)
              })
        }).catch((err) => {
          console.log(err);
          next(err)
        })
        
    } catch (error) {
        console.log (error)
    }

};

const patchAdminStatus = async ( req , res ) => {
      const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await Admin.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  }
}


const deleteAdmin = async ( req , re ) => {
    const id = req.params.id;
    await Admin.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
}

const editAdminImage = async ( req , res ) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        if (!result || !result.secure_url) {
         return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
       }
          const id = req.params.id;
          Admin.findById(id).
                       then((admins) => {
                          admins.img = {
                            url: result.secure_url,
                            publicId: result.public_id 
                            };
                  admins.save()
                  .then((value) => {
                      console.log (value);
                      req.flash("success_msg", "Images Uploaded");
                      return res.redirect('/admin/edit-admin?id=' + id)
                      
                  }).catch((err) => {
                      console.log (err);
                      res.json(err);
                      next(err);
                  })
          }).catch((err) => {
           console.log(err);
           next(err);
          })
    } catch (error) {
        console.log (error)
    }
};

//done admin

//creating info 
const uploadMultipleInfoImage = async (req, res, next) => {
    try {
      console.log('Cloudinary Upload Request:', req.files)
  
      const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
      const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
   
  
      console.log('Cloudinary Upload Response:', imgResult);
      req.uploadResults = {
        imgResult,
        img2Result,
       
      };
      next();
   
    
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file to Cloudinary.');
    }
  };


  const createCompanyInfo = async ( req , res ) => {
    try {
        const {company_name, address, state,mobile,mobile2,mobile3,phone, email,linkedin, facebook, instagram, twitter, whatsapp} = req.body;
        const errors = [];
  
        
     const {
      imgResult,
      img2Result,
    } = req.uploadResults;
      
        if (!company_name || !mobile || !email) {
            errors.push( { msg : "Please fill in all fields." } );
        }
    
        if(errors.length > 0){
            res.render('create_info', {
                errors: errors,
                company_name: company_name,
                address: address,
                mobile: mobile,
                mobile2: mobile2,
                mobile3: mobile3,
                phone: phone,
                email: email,
                linkedin: linkedin,
                facebook: facebook,
                instagram: instagram, 
                twitter: twitter, 
                whatsapp: whatsapp,
                state: state,
                user: req.user,
            } )
        }else{
            Info.findOne( { company_name : company_name} )
                .then( async (info) => {
                  if (info) {
                    errors.push( { msg : "A Property already Exist with the Name Chosen." } );
                    res.render('create_info', {
                      errors: errors,
                      company_name: company_name,
                      address: address,
                      mobile: mobile,
                      mobile2: mobile2,
                      mobile3: mobile3,
                      phone: phone,
                      email: email,
                      linkedin: linkedin,
                      facebook: facebook,
                      instagram: instagram, 
                      twitter: twitter, 
                      whatsapp: whatsapp,
                      state: state,
                      user: req.user,
                  } )
                  }
                  else {
                    const abouts = {
                      company_name: company_name,
                      address: address,
                      state: state,
                      mobile: mobile,
                      mobile2: mobile2,
                      mobile3: mobile3,
                      phone: phone,
                      email: email,
                      linkedin: linkedin,
                      facebook: facebook,
                      instagram: instagram, 
                      twitter: twitter, 
                      whatsapp: whatsapp,
                      img: {},
                      image: {},
                    };
  
                   
  
                    if (req.files['img']) {
                     abouts.img = {
                        url: imgResult.secure_url,
                        publicId: imgResult.public_id,
                      }
                    }
                    if (req.files['image']) {
                     abouts.image = {
                        url: img2Result.secure_url,
                        publicId: img2Result.public_id,
                      }
                    }
                    
                   await Info.create(abouts)
                          .then((data) => {
                            req.flash("success_msg", "Data Registered !");
                            res.redirect('/admin/creating-info');
                          }).catch((err) => {
                            console.log(err)
                          })
                  }
                })
  
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
  };

// Edit image for Info.

const getCompanyInfo = async = ( req , res ) => {
    try {
        res.render("create_info",   {
          user: req.user
          
        })
      } catch (error) {
        console.log(error)
      }
};

const getEditInfoPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            Info.findById(id)
                    .then((service) => {
                       
                            res
                            .render(
                                "edit_info", 
                                {
                                    service: service,
                                    user: req.user,
                                }
                                )
                       
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};

const editCompanyInfo = async ( req , res ) => {
    const id = req.params.id;
    const {company_name, address, state, mobile, mobile2, 
      mobile3, email, phone, linkedin, facebook, instagram, twitter, whatsapp, } = req.body;
    
    try {
      await Info.updateOne({ _id: id}, {$set: { 
        mobile: mobile, 
        mobile2: mobile2, 
        mobile3: mobile3, 
        company_name: company_name, 
        address: address, 
        state : state,  
        phone: phone, 
        email: email,
        linkedin: linkedin,
        facebook: facebook,
        instagram: instagram, 
        twitter: twitter, 
        whatsapp: whatsapp,
      }
    })
      res.redirect(`/admin/edit-info?id=${id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
};


const editCompanyInfoImage = async ( req , res ) => {
    try {
        const {
          imgResult,
          img2Result,
          // floorPlanResult,
          // videoResult,
        } = req.uploadResults;
    
        const infoId = req.params.id;
    
        if (!infoId) {
          throw new TypeError("Invalid info ID");
        }
    
        const info = {};
    
        if (req.files['img']) {
          info.img = {
             url: imgResult.secure_url,
             publicId: imgResult.public_id,
           }
         }
         if (req.files['image']) {
          info.image = {
             url: img2Result.secure_url,
             publicId: img2Result.public_id,
           }
         }
        const filter = { _id: infoId };
        const update = { $set: info };
        const options = { returnOriginal: false };
    
        const result = await Info.findOneAndUpdate(filter, update, options);
    
        if (!result) {
          return res.status(404).json({ error: "info not found" });
        }
        req.flash("success_msg", "Images Uploaded");
       return res.redirect('/admin/edit-info?id=' + infoId)
      } catch (error) {
        if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
        console.log(error);
        return res.status(500).send();
      }
};

//create STAFF
const createStaff = async ( req , res ) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
         
         if (!result || !result.secure_url) {
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }
    
       const {first_name, second_name, position, other_position, email, performance, phone, about,
        linkedin, facebook, instagram, twitter, whatsapp} = req.body;
       const errors = [];
    
       if (!first_name || !second_name || !email || !performance || !about || !phone || !whatsapp) {
           errors.push( { msg : "Please fill in all the fields."})
       }
       if (errors.length > 0) {
           res.render('create_staff', {
               errors: errors,
               first_name: first_name,
               second_name: second_name,
               position: position,
               other_position: other_position,
               email : email,
               performance : performance,
               about:  about,
               phone: phone,
               linkedin: linkedin,
               facebook: facebook,
               instagram: instagram, 
               twitter: twitter, 
               whatsapp: whatsapp,
               user: req.user,
           })
       } else {
           Staff.findOne( { email: email } )
                .then((user) => {
               if(user) {
                   errors.push( { msg: "The email provided already associated with an existing User" })
                   res.render('create_staff', {
                    errors: errors,
                    first_name: first_name,
                    second_name: second_name,
                    position: position,
                    other_position: other_position,
                    email : email,
                    performance : performance,
                    about:  about,
                    phone: phone,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                    user: req.user,
                   })
               }else if(!user){
                   const newStaff = new Staff ({
                    first_name: first_name,
                    second_name: second_name,
                    position: position,
                    other_position: other_position,
                    email : email,
                    performance : performance,
                    about:  about,
                    phone: phone,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                       img : {
                        url: result.secure_url,
                        publicId: result.public_id 
                          },
                   }) 
    
                   newStaff
                       .save()
                       .then((value) => {
                            req.flash("success_msg", "Data Registered !");
                            res.redirect('/admin/create-staff');
                       }).catch((err) =>{
                         console.log (err)
                         next(err)
                        })
               }
           }).catch((err) => {
            console.log(err);
            next(err);
           })
       }
    
      } catch (error) {
           console.log (error);
           next(error);
      }
};

const editStaffImage = async ( req , res ) => {
    try {

        const result = await cloudinary.uploader.upload(req.file.path);
        if (!result || !result.secure_url) {
         return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
       }
  
          const id = req.params.id;
          Staff.findById(id).
                       then((staffs) => {
                          staffs.img = img = {
                            url: result.secure_url,
                            publicId: result.public_id 
                            };
                  staffs.save()
                  .then((value) => {
                    req.flash("success_msg", "Images Uploaded");
                      return res.redirect('/admin/edit-staff?id=' + id)
                  }).catch((err) => {
                      console.log (err);
                      res.json(err);
                      next(err);
                  })
          }).catch((err) => {
           console.log(err);
           next(err);
          })
      } catch (error) {
          console.log (error)
      }
};

const getStaffPage = async ( req, res )=> {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
      
        Staff
          .find({ status : true })
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .then((staff) => {
            Staff
                .countDocuments()
                .then((count) => {
              res.render('staff', {
                staff: staff,
                current: page,
                user: req.user,
                pages: Math.ceil(count / perPage)
              });
            }).catch((err) => {
                console.log(err)
                next(err)
            });
          }).catch((err) => {
            console.log(err)
            next(err)
            }) ;
      } catch (error) {
        console.log(error)
      }
};


const getEditStaffPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            Staff.findById(id)
                    .then((staff) => {
                        if (!staff) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_staff", 
                                {
                                    staff: staff,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};

const getStaffDetail = async ( req , res ) => {
    try {
        if(req.query) {
            const id = req.query.id;

            await Staff.findById(id)
                        .then((staff) => {
                            House.find()
                                    .then((prop) => {
                                        Land.find()
                                            .then((land) => {
                                                res.render("staffs_detail", {
                                                    staff: staff,
                                                    land: land,
                                                    prop: prop,
                                                    user: req.user,
                                                })
                                            }).catch((err) => {
                                                console.log(err)
                                                next(err)
                                            })
                                    }).catch((err) => {
                                        console.log(err)
                                        next(err)
                                    })
                            
                        }).catch((err) => {
                            console.log(err)
                            next(err)
                        })
        }
    } catch (error) {
        console.log(error)
        next(err)
    }
};

const editStaff = async ( req , res ) => {
    try {
    
        const id = req.params.id;
        const { 
          first_name, 
          second_name,
          position,
          other_position,
          email,
          performance,
          about,
          phone,
          linkedin,
          facebook,
          instagram, 
          twitter, 
          whatsapp,} = req.body;
  
        Staff.findById(id)
              .then((user) => {
                user.first_name = first_name;
                user.second_name = second_name;
                user.position = position;
                user.other_position = other_position;
                user.email  = email;
                user.performance  = performance;
                user.about =  about;
                user.phone = phone;
                user.linkedin = linkedin;
                user.facebook = facebook;
                user.instagram = instagram; 
                user.twitter = twitter; 
                user.whatsapp = whatsapp;
            user
                .save()
                .then((user) => {
                    res.json("User Update")
                }).catch((err) => {
                    console.log (err)
                    res.json(err)
                    next(err)
                })
        }).catch((err) => {
          console.log(err);
          next(err);
        })
    } catch (error) {
        console.log (err)
    }
};


const patchStaff = async ( req , res ) => {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await Staff.findByIdAndUpdate(id, { status }, { new: true });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.status(500).send(err.message);
    }
};

const patchManagmentStatus = async ( req , res ) => {
    const id = req.params.id;
    const { managingStatus } = req.body;
  
    try {
      const switchManaging = await Staff.findByIdAndUpdate(id, { managingStatus }, { new: true });
      if (!switchManaging) return res.status(404).send('switch not found');
      res.send(switchManaging);
    } catch (err) {
      res.status(500).send(err.message);
    }
};

const deleteStaff = async ( req , res ) => {
    const id = req.params.id;
    await Staff.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
};

const AssignHouseToStaff = async ( req , res ) => {
    const { filterOption } = req.body;
    const id = req.params.id;
  
    try {
      const staff = await Staff.findById(id);
   
      staff.propid.push(filterOption);
      const updateStaff = await staff.save();
      req.flash("success_msg", `Added House to Agent ${staff.first_name}`)
      res.redirect(`/admin/staff-detail?id=${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
};

const deleteAssignedHouse = async ( req , res ) => {
    const staffId = req.params.id;
    const propNameToRemove = req.query.prop;
  
    try {
      await Staff.updateOne({ _id: staffId }, { $pull: { propid: propNameToRemove } });
      req.flash("success_msg", `Removed ${propNameToRemove} from staff member ${staffId}`);
      res.redirect(`/admin/staff-detail?id=${staffId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
};


const AssignLandToStaff = async ( req , res ) => {
    const { filterOptions } = req.body;
    const id = req.params.id;
try {
    

   const staff = await Staff.findById(id);

  staff.landid.push(filterOptions);
  const updateStaff = await staff.save();
  req.flash("success_msg", `Added Land to Agent ${staff.first_name}`);
  res.redirect(`/admin/staff-detail?id=${id}`);
} catch (error) {
    console.error(erorr);
    res.status(500).send("Server error");
}
};


const deleteAssignedland = async ( req , res ) => {
    const staffId = req.params.id;
    const propNameToRemove = req.query.land;
  
    try {
      await Staff.updateOne({ _id: staffId }, { $pull: { landid: propNameToRemove } });
      req.flash("success_msg", `Removed ${propNameToRemove} from staff member ${staffId}`);
      res.redirect(`/admin/staff-detail?id=${staffId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
}

//create Agent
const getCreateAgent = async ( req , res ) => {
    try {
        await res.render("create_agent", {
            user: req.user,
          })
    } catch (err) {
        console.log(err)
    }
};

const createAgent = async ( req , res, next ) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
         
         if (!result || !result.secure_url) {
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }
    
       const {first_name, second_name, email, performance, phone, about,
        linkedin, facebook, instagram, twitter, whatsapp} = req.body;
       const errors = [];
    
       if (!first_name || !second_name || !email || !performance || !about || !phone || !whatsapp) {
           errors.push( { msg : "Please fill in all the fields."})
       }
       if (errors.length > 0) {
           res.render('create_agent', {
               errors: errors,
               first_name: first_name,
               second_name: second_name,
               email : email,
               performance : performance,
               about:  about,
               phone: phone,
               linkedin: linkedin,
               facebook: facebook,
               instagram: instagram, 
               twitter: twitter, 
               whatsapp: whatsapp,
               user: req.user,
           })
       } else {
           Agent.findOne( { email: email } )
                .then((user) => {
               if(user) {
                   errors.push( { msg: "The email provided already associated with an existing User" })
                   res.render('create_agent', {
                    errors: errors,
                    first_name: first_name,
                    second_name: second_name,
                    email : email,
                    performance : performance,
                    about:  about,
                    phone: phone,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                    user: req.user,
                   })
               }else if(!user){
                   const newStaff = new Agent ({
                    first_name: first_name,
                    second_name: second_name,
                    email : email,
                    performance : performance,
                    about:  about,
                    phone: phone,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                       img : {
                        url: result.secure_url,
                        publicId: result.public_id 
                          },
                   }) 
    
                   newStaff
                       .save()
                       .then((value) => {
                            req.flash("success_msg", "Data Registered !");
                            res.redirect('/admin/createagent');
                       }).catch((err) =>{
                         console.log (err)
                         next(err)
                        })
               }
           }).catch((err) => {
            console.log(err);
            next(err);
           })
       }
    
      } catch (error) {
           console.log (error);
           next(error);
      }
};


const editAgentImage = async ( req , res ) => {
    try {

        const result = await cloudinary.uploader.upload(req.file.path);
        if (!result || !result.secure_url) {
         return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
       }
  
          const id = req.params.id;
          Agent.findById(id).
                       then((staffs) => {
                          staffs.img = img = {
                            url: result.secure_url,
                            publicId: result.public_id 
                            };
                  staffs.save()
                  .then((value) => {
                    req.flash("success_msg", "Images Uploaded");
                      return res.redirect('/admin/edit-agent?id=' + id)
                  }).catch((err) => {
                      console.log (err);
                      res.json(err);
                      next(err);
                  })
          }).catch((err) => {
           console.log(err);
           next(err);
          })
      } catch (error) {
          console.log (error)
      }
};

const getAgentPage = async ( req, res )=> {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
      
        Agent
          .find({ status : true })
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .then((staff) => {
            Agent
                .countDocuments()
                .then((count) => {
              res.render('agent', {
                staff: staff,
                current: page,
                user: req.user,
                pages: Math.ceil(count / perPage)
              });
            }).catch((err) => {
                console.log(err)
                next(err)
            });
          }).catch((err) => {
            console.log(err)
            next(err)
            }) ;
      } catch (error) {
        console.log(error)
      }
};


const getEditAgentPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            Agent.findById(id)
                    .then((staff) => {
                        if (!staff) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_agent", 
                                {
                                    staff: staff,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};

const getAgentDetail = async ( req , res ) => {
    try {
        if(req.query) {
            const id = req.query.id;

            await Agent.findById(id)
                        .then((staff) => {
                            House.find()
                                    .then((prop) => {
                                        Land.find()
                                            .then((land) => {
                                                res.render("agent_detail", {
                                                    staff: staff,
                                                    land: land,
                                                    prop: prop,
                                                    user: req.user,
                                                })
                                            }).catch((err) => {
                                                console.log(err)
                                                next(err)
                                            })
                                    }).catch((err) => {
                                        console.log(err)
                                        next(err)
                                    })
                            
                        }).catch((err) => {
                            console.log(err)
                            next(err)
                        })
        }
    } catch (error) {
        console.log(error)
        next(err)
    }
};



const editAgent = async ( req , res ) => {
    try {
    
        const id = req.params.id;
        const { 
          first_name, 
          second_name,
          email,
          performance,
          about,
          phone,
          linkedin,
          facebook,
          instagram, 
          twitter, 
          whatsapp,} = req.body;
  
        Agent.findById(id)
              .then((user) => {
                user.first_name = first_name;
                user.second_name = second_name;
                user.email  = email;
                user.performance  = performance;
                user.about =  about;
                user.phone = phone;
                user.linkedin = linkedin;
                user.facebook = facebook;
                user.instagram = instagram; 
                user.twitter = twitter; 
                user.whatsapp = whatsapp;
            user
                .save()
                .then((user) => {
                    res.json("User Update")
                }).catch((err) => {
                    console.log (err)
                    res.json(err)
                    next(err)
                })
        }).catch((err) => {
          console.log(err);
          next(err);
        })
    } catch (error) {
        console.log (err)
    }
};


const patchAgent = async ( req , res ) => {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await Agent.findByIdAndUpdate(id, { status }, { new: true });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.status(500).send(err.message);
    }
};


const deleteAgent = async ( req , res ) => {
    const id = req.params.id;
    await Agent.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
};

const AssignHouseToAgent = async ( req , res ) => {
    const { filterOption } = req.body;
    const id = req.params.id;
  
    try {
      const staff = await Agent.findById(id);
   
      staff.propid.push(filterOption);
      const updateStaff = await staff.save();
      req.flash("success_msg", `Added House to Agent ${staff.first_name}`)
      res.redirect(`/admin/agent-detail?id=${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
};

const deleteAssignedHouseToAgent = async ( req , res ) => {
    const staffId = req.params.id;
    const propNameToRemove = req.query.prop;
  
    try {
      await Agent.updateOne({ _id: staffId }, { $pull: { propid: propNameToRemove } });
      req.flash("success_msg", `Removed ${propNameToRemove} from staff member ${staffId}`)
      res.redirect(`/admin/agent-detail?id=${staffId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
};


const AssignLandToAgent = async ( req , res ) => {
    const { filterOptions } = req.body;
    const id = req.params.id;
try {
    

   const staff = await Agent.findById(id);

  staff.landid.push(filterOptions);
  const updateStaff = await staff.save();
  req.flash("success_msg", `Added Land to Agent ${staff.first_name}`);
  res.redirect(`/admin/agent-detail?id=${id}`);
} catch (error) {
    console.error(erorr);
    res.status(500).send("Server error");
}
};


const deleteAssignedlandToAgent = async ( req , res ) => {
    const staffId = req.params.id;
    const propNameToRemove = req.query.land;
  
    try {
      await Agent.updateOne({ _id: staffId }, { $pull: { landid: propNameToRemove } });
      req.flash("success_msg", `Removed ${propNameToRemove} from staff member ${staffId}`);
     
      res.redirect(`/admin/agent-detail?id=${staffId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
}


//creating Service----------------------------------

const uploadMultipleServiceImage = async (req, res, next) => {
    try {
      console.log('Cloudinary Upload Request:', req.files)
  
      const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
      const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
  
      req.uploadResults = {
        imgResult,
        img2Result,
      };
      next();
    
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file to Cloudinary.');
    }
  };

  const getCreateServicePage = async ( req , res ) => {
    try {
        await res.render("create_service", {
          user: req.user,
        })
      } catch (error) {
        console.log(error)
      }
  };

 const createService = async (req, res, next) => {
  try {
    let imgResult, img2Result;

    // Attempt to upload files to Cloudinary if they exist
    if (req.files && req.files['img'] && req.files['img'].length > 0) {
      imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    }
    if (req.files && req.files['image'] && req.files['image'].length > 0) {
      img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
    }

    const { heading, about,  category } = req.body;
    const errors = [];

    // Validation
    if (!heading || !about || !category) {
      errors.push({ msg: "Please fill in all fields." });
    }

    if (errors.length > 0) {
      res.render('create_service', {
        errors: errors,
        heading: heading,
        about: about,
        category:  category,
        user: req.user,
      });
    } else {
      const serviceExists = await Service.findOne({ heading: heading });

      if (!serviceExists) {
        const ourServ = {
          heading: heading,
          category:  category,
          about: about,
          img: {},
          image: {},
        };

        // Setting image details if they exist
        if (imgResult) {
          ourServ.img = {
            url: imgResult.secure_url,
            publicId: imgResult.public_id,
          };
        }
        if (img2Result) {
          ourServ.image = {
            url: img2Result.secure_url,
            publicId: img2Result.public_id,
          };
        }

        await Service.create(ourServ);
        req.flash("success_msg", "Data Registered!");
        res.redirect("/admin/creating-service");
      } else {
        res.status(409).send({ message: "Service created with the same heading already exists" });
      }
    }
  } catch (error) {
    console.log(error);
    if (error.message.includes('Error uploading file to Cloudinary')) {
      res.status(500).send('Error uploading file to Cloudinary.');
    } else {
      next(error);
    }
  }
};

  const getEditServicePage = async ( req, res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            Service.findById(id)
                    .then((service) => {
                       
                            res
                            .render(
                                "edit_service", 
                                {
                                    service: service,
                                    user: req.user,
                                    
                                }
                                )
                       
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
  };

  const editService = async ( req , res ) => {
        const id = req.params.id;
        const {heading, about, category } = req.body;

    try {
        await Service.updateOne({ _id: id}, {$set: {heading: heading, about: about, category: category }})
        res.redirect(`/admin/edit-service?id=${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
        }
  };

  const editServiceImages = async ( req , res ) => {
    try {
        const {
          imgResult,
          img2Result,
          // floorPlanResult,
          // videoResult,
        } = req.uploadResults;
        
         const servId = req.params.id;
         if(!servId) {
          throw new TypeError('Invalid Service ID');
         }
      
         const serv = {};
         
         if (req.files['img']) {
          serv.img = {
             url: imgResult.secure_url,
             publicId: imgResult.public_id,
           }
         }
         if (req.files['img2']) {
          serv.img2 = {
             url: img2Result.secure_url,
             publicId: img2Result.public_id,
           }
         }
        const filter = { _id: servId };
        const update = { $set: serv };
        const options = { returnOriginal: false };
      
        const result = await Service.findOneAndUpdate(filter, update, options)
        if (!result) {
          return res.status(404).json({ error: "info not found" });
        }
      
        req.flash("success_msg", "Images Uploaded");
        return res.redirect('/admin/edit-service?id=' + servId)
       } catch (error) {
         if (error.name === "CastError" || error.name === "TypeError") {
            return res.status(400).json({ error: error.message });
          }
          console.log(error);
          return res.status(500).send();
       }
  }


  //create Vision Mission About

  const getCreateVMA = async ( req , res ) => {
    try {
        await res.render('create_mission', { user : req.user} )
    } catch (err) {
        console.log(err)
    }
  };

  const createVMA = async ( req , res, next ) => {
    try {

        const result = await cloudinary.uploader.upload(req.file.path);
         
          if (!result || !result.secure_url) {
           return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
         }
    
      const { heading, options, description } = req.body;
      const errors = [];  
      if(!options || !heading || !description) {
        errors.push( { msg : "Please fill in all the fields."})
      }
      if(errors.length > 0) {
        res.render('create_mission', {
          errors: errors,
          options: options,
          heading: heading,
          description: description,
          user: req.user,
        })
      }else {
        const vis = new About ({
          options: options,
          heading: heading,
          description: description,
            img: {
                              url: result.secure_url,
                              publicId: result.public_id 
                                },
        });
    
             vis
                .save()
                .then((value) => {
                  req.flash("success_msg", "Data updated !");
                  res.redirect('/admin/create-mission');
                }).catch((err) =>{
                  console.log (err)
                  next(err)
                 })
      }
      } catch (err) {
        console.log(err);
        next(err);
      }
  };


// getting contact from front page to the admin

const getMessageInboxPage = async ( req , res ) => {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
    
        await Message
                      .find()
                      .sort({ createdAt : -1})
                      .skip((perPage * page) - perPage)
                      .limit(perPage)
                      .then((contact) => {
                        Message
                          .countDocuments()
                          .then((count) => {
                            res.render("contact_list", {
                              contact: contact,
                              current: page,
                              user: req.user,
                              pages: Math.ceil(count / perPage)
                            });
                          }).catch((err) => {
                            console.log(err)
                            next(err)
                          })
                      })
      } catch (error) {
        console.log(error)
      }
};

const getIntoMessageOne = async ( req , res ) => {
    const id = req.query.id;

    try {
      await Message.updateOne({ _id: id }, { $set: { isRead: true } });
      const contact = await Message.findById(id);
      res.render("inbox", {
        contact,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
};


const deleteMessage = async ( req , res ) => {
    const id = req.params.id;
    await Message.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
};

//nodemailer

const getallSubcribers = async ( req, res ) => {
    try {
        await res.render('subcriber_message', {
            user: req.user,
          })
    } catch (err) {
        console.log(err)
    }
};

const getSingleReply = async ( req , res ) => {
    const id = req.query.id;
    try {
      const contact = await Message.findById(id);
  
      res.render("reply_single", {
        contact,
        user: req.user,
      });
    
    } catch (error) {
      console.log(error);
    }
};


// Manage password changing

const getChangePasswordPage = async ( req , res ) => {
    try {
        await 
        res.render('change_password', {
          user: req.user,
        })
      } catch (error) {
        console.log(error)
      }
};

const changePassword = async ( req , res ) => {
    const {passwords, email, passwording} = req.body;
  let errors = [];

  if (!passwords || !email || !passwording) {
    errors.push( { msg: "Please fill in the field"} );
  }

  if ( passwording.length < 6) {
    errors.push({ msg: "password atleast 6 character" });
  }

  if ( passwords.length < 6) {
    errors.push({ msg: "Your previous password is incorrect!" });
  }

  if ( passwording == passwords) {
    errors.push({ msg: "Password provided are the same use different password" });
  }
  if (errors.length > 0) {

      res.render('change_password', {
        errors: errors,
        email: email,
        passwords : passwords,
        passwording: passwording,
      
      })
   
  } else{
    Admin.findOne({ email : email}).then((user) => {

      if (!user) {
            errors.push( { msg : "Oops! no User associated with that email"});
              res.render('change_password', {
                errors: errors,
                email: email,
                passwords : passwords,
                passwording: passwording,
               
              })
            
      } if(user) {
       Admin.find({password : passwords})
    
        .then((user)=> {
          if(!user){
            errors.push( { msg : "Oops! Password Incorrect"});
              res.render('change_password', {
                errors: errors,
                email: email,
                passwords : passwords,
                passwording: passwording,
               
              })
           
        }else {
         Admin.findOne({ email : email})
            .then((user) => {
              user.password = passwording;
              bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(user.password, salt,
                  (err, hash) => {
                      if (err) throw err;

                      user.password = hash;

                      user
                      .save()
                          .then((value) => {
                              console.log(value)
                              req.flash(
                                "success_msg",
                                "Password Changed Successfully!"
                              );
                              res.redirect(`/admin/change-password`);
                          })
                          .catch(value => console.log(value))
                  }))
             
            })
        }})
                  

      }
    }).catch((err) => {
      console.log(err)
    })
              
  }
};


// Reovering password Settings .............................
const getForgetPasswordPage = async ( req , res ) => {
    try {
        await 
        res.render('forget_password')
      } catch (error) {
        console.log(error)
      }
};


const processToRecoverPassword = async ( req , res ) => {
    const { email } = req.body;
    let errors = [];
  
    if (!email) {
      errors.push({ msg: "Please fill in the field" });
    }
  
    if (errors.length > 0) {
      res.render('forget_password', {
        errors: errors,
        email: email,
      })
    } else {
      try {
        const user = await Admin.findOne({ email: email });
        if (!user) {
          errors.push({ msg: "Oops! no User associated with that email" });
          res.render('forget_password', {
            errors: errors,
            email: email,
          });
        } else {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let voucherCode = '';
          for (let i = 0; i < 6; i++) {
            voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          const code = await new Recovery({ recovery: "onetimepass-"+voucherCode }).save();
          const html = `
            <html>
              <head>
                <style>
                  /* Define your CSS styles here */
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    color: #333;
                  }
                  h2 {
                    color: #ff0000;
                  }
                  p {
                    line-height: 1.5;
                  }
                </style>
              </head>
              <body>
                <img src="/assets/img/Valiant-01.png" alt="Company Logo">
                <h2>Valiantfoot Recovery Code</h2>
                <p>${code.recovery}</p>
              </body>
            </html>
          `;
          const mailOptions = {
            from: 'Transverserealestates@gmail.com',
            to: user.email,
            subject: 'Use the below Code to recover your Password',
            html: html
          };
          const smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
              user: 'Transverserealestates@gmail.com',
              pass: PASSWORD_EMAIL,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 1000,
          };
          const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
          await transporter.sendMail(mailOptions);
          req.flash('success_msg', 'Recovery Code sent to the Email you provided');
          res.redirect('/admin/recover-password');
        }
      } catch (err) {
        console.log(err);
        res.render('forget_password', {
          errors: [{ msg: "An error occurred while processing your request. Please try again later." }],
          email: email,
        });
      }
    }
};

//code from Email

const getPageToUseRecoveredCode = async ( req, res ) => {
    try {
        await 
        res.render('recover_password')
      } catch (error) {
        console.log(error)
      }
};

const resetPassword = async ( req , res ) => {
    const { email, recoveryCode, newPassword } = req.body;
    let errors = [];
  
    if (!email || !recoveryCode || !newPassword) {
      errors.push( { msg: "Please fill in all fields"} );
    }
  
    if (errors.length > 0) {
      res.render('recover_password', {
        errors: errors,
        email: email,
        recoveryCode: recoveryCode,
        newPassword: newPassword,
      });
    } else {
      // Find the recovery code in the database
      await Recovery.findOne({ recovery: recoveryCode }).then((recovery) => {
        if (!recovery) {
          // If the recovery code doesn't exist, show an error message
          errors.push( { msg : "Invalid recovery code"});
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
          });
        } else if (recovery.isUsed == true) {
          // If the recovery code has already been used, show an error message
          errors.push( { msg : "This recovery code has already been used."});
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
          });
        } else {
          // If the recovery code exists and hasn't been used, update the admin's password in the database
          Admin.findOne({ email: email }).then((admin) => {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newPassword, salt, (err, hash) => {
                if (err) throw err;
                admin.password = hash;
                admin.save().then(() => {
                  // Update the recovery code in the database to show that it has been used
                  recovery.isUsed = true;
                  recovery.save().then(() => {
                    req.flash('success_msg', 'Your password has been reset. Please log in.');
                    res.redirect('/admin/login');
                  });
                });
              });
            });
          });
        }
      }).catch((err) => {
        console.log(err)
      });
    }
};

// Career 

const getJobPage = async ( req , res ) => {
    try {
        await res.render("careerAdmin", { user: req.user })
      } catch (error) {
        console.log(error)
      }
};

const createJob = async ( req , res ) => {
    try {
        const {jobName, jobDescription } = req.body
    
        const errors = []
        if(!jobName || !jobDescription) {
          errors.push({ msg: "Please fill in all fields." });
        }
        if(errors.length > 0) {
          res.render('', {
            errors: errors,
            jobName: jobName,
            jobDescription: jobDescription,
            
          });
        } else {
          const JobName =  {
            jobName: jobName,
            jobDescription: jobDescription.split('  ').map(jobDescription => jobDescription.trim()),
          };
    
          CareerCreation.create(JobName)
                          .then((data) => {
                            req.flash("success_msg", "Job Registered !");
                            res.redirect('/admin/career-builder');
                          }).catch((err) => {
                            console.log(err)
                          })
        }
      } catch (error) {
        console.log(error);
      }
};


const getAllJob = async ( req , res ) => {
    try {
        var perPage = 10;
        var page = req.params.page || 1;
        
    await CareerCreation
                        .find()
                        .skip((perPage * page) - perPage)
                        .limit(perPage)
                        .then((career) => {
                          CareerCreation
                                      .countDocuments()
                                      .then((count) => {
                                        res.render('allJob', {
                                          career: career,
                                          current: page,
                                          user: req.user,
                                          pages: Math.ceil(count / perPage)
                                        });
                                      }).catch((err) => {
                                        console.log(err)
                                        next(err)
                                      })
                        });
    
       
      } catch (error) {
        console.log(error);
      }
};


const deleteJob = async ( req , res ) => {
    const id = req.params.id;
    await CareerCreation.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
};

const getEditJobPage = async ( req , res ) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            await CareerCreation.findById(id)
                    .then((career) => {
                       
                            res
                            .render(
                                "edit-jobs", 
                                {
                                    career: career,
                                    user: req.user,
                                    
                                }
                                )
                       
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
};

const editJob = async ( req , res ) => {
    const id = req.params.id;
    const {jobName, jobDescription} = req.body;
    
    try {
      await CareerCreation.updateOne({ _id: id}, {$set: {jobName: jobName, jobDescription: jobDescription.split('  ').map(jobDescription => jobDescription.trim()), }})
      res.redirect(`/admin/edit-career?id=${id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
};

const patchJob = async ( req , res ) => {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await CareerCreation.findByIdAndUpdate(id, { status }, { new: false });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.status(500).send(err.message);
    }
};


//reply through admin to all subcsribers

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storager = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif',  'heic'] // Optional: specify allowed file formats
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the file
    cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
  }
});

const uploadedEmailAll = multer({ storage: storager });

const replyAllSubscribers = async ( req , res ) => {
    const { subject, message } = req.body;
    try {
      const html = `
      <html>
      <head>
        <style>
        * {
        box-sizing: border-box;
    }
        
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 10px;
            flex-direction: column;
            margin: 5px;
            padding:5px;
          }
          header {
            width:100%;
            height: 180px;
            background: #b25400;
            border-radius: 10px;
            padding: 4px;
          }
  
          header div {
            display: flex;
            justify-content: center;
            align-items: center;
            width:100%;
            height: 170px;
            background-color: #f8f9fa !important;
            border-radius: 10px;
            flex-direction: column !important;
            padding: 10px;
            gap: 10px;
            text-align: center;
          }
  
          header div h1 {
            color: #b25400;
          }
  
          div span {
            color: #000000 !important;
          
          }
  
          header .span {
            color: #495057 !important;
          }
  
          h2 {
            color: #b25400;
            text-align: center;
          }
          p {
            line-height: 1.5;
            white-space: pre-line;
            text-align: center;
          }
        </style>
      </head>
      <body>
      <header>
        <div>
        <h1>
       Transverse<span class='love'>Real Estate Solution</span>
        <h5>
            Ilorin Kwara State. Nigeria
        </h5><br>
        <h6>
        <a href='https://transversehomes.org'>Visit Our Website</a>
        </h6>
        </div>
      </header>
        <h2>${req.body.subject}</h2>
        <p>${req.body.message}</p>
      </body>
    </html>
    `;
  
      const subscribers = await Subscriber.find({});
      const recipientEmails = subscribers.map(subscriber => subscriber.email);
  
      const mailOptions = {
        from: 'Transverserealestates@gmail.com',
        to: recipientEmails,
        subject: req.body.subject,
        html: html,
        attachments: [{
          filename: req.file.originalname,
          path: req.file.path,
        }],
      };
  
      const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: 'Transverserealestates@gmail.com',
          pass: PASSWORD_EMAIL
        },
        pool: true, // Enable the use of a pooled connection
        maxConnections: 5, // Limit the number of simultaneous connections
        maxMessages: 100, // Limit the number of messages per connection
        rateDelta: 1000, // Increase the delay between messages if rate limit is exceeded
        rateLimit: 1000, // Maximum number of messages that can be sent per minute
      };
  
      const transporters = nodemailer.createTransport(smtpPool(smtpConfig));
      await transporters.sendMail(mailOptions);
      req.flash('success_msg', 'Email sent');
    } catch (err) {
      console.log(err);
      req.flash('error', 'Could not send email');
    }
    res.redirect('/admin/email_subscriber');
};


const uploadEmailReplySingle = multer({ storage: storager });

const replySingle = async ( req , res ) => {
    const { subject, message, email } = req.body;
    const id = req.query.id;
    try {
     
      const html =`
      <html>
      <head>
        <style>
        * {
        box-sizing: border-box;
    }
        
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 10px;
            flex-direction: column;
            margin: 5px;
            padding:5px;
          }
          header {
            width:100%;
            height: 180px;
            background: #b25400;
            border-radius: 10px;
            padding: 4px;
          }
  
          header div {
            display: flex;
            justify-content: center;
            align-items: center;
            width:100%;
            height: 170px;
            background-color: #f8f9fa !important;
            border-radius: 10px;
            flex-direction: column !important;
            padding: 10px;
            gap: 10px;
            text-align: center;
          }
  
          header div h1 {
            color: #b25400;
          }
  
          div span {
            color: #000000 !important;
          
          }
  
          header .span {
            color: #495057 !important;
          }
  
          h2 {
            color: #b25400;
            text-align: center;
          }
          p {
            line-height: 1.5;
            white-space: pre-line;
            text-align: center;
          }
        </style>
      </head>
      <body>
      <header>
        <div>
        <h1>
       Transverse<span class='love'>Real Estate Solution</span>
        <h5>
            Ilorin Kwara State. Nigeria
        </h5><br>
        <h6>
        <a href='https://transversehomes.org'>Visit Our Website</a>
        </h6>
        </div>
      </header>
        <h2>${req.body.subject}</h2>
        <p>${req.body.message}</p>
      </body>
    </html>
    `;
      
      const mailOptions = {
        from: 'Transverserealestates@gmail.com',
        to: req.body.email,
        subject: req.body.subject,
        html: html,
        attachments: [{
          filename: req.file.originalname,
          path: req.file.path,
        }],
      };
  
      
      const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: 'Transverserealestates@gmail.com',
          pass: PASSWORD_EMAIL
        },
        pool: true, // Enable the use of a pooled connection
        maxConnections: 5, // Limit the number of simultaneous connections
        maxMessages: 100, // Limit the number of messages per connection
        rateDelta: 1000, // Increase the delay between messages if rate limit is exceeded
        rateLimit: 1000, // Maximum number of messages that can be sent per minute
      };
      const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
      await transporter.sendMail(mailOptions);
      req.flash('success_msg', 'Email sent');
    } catch (err) {
      console.log(err);
      req.flash('error', 'Could not send email');
    }
    res.redirect('/admin/replying?id=' + id);
};





module.exports = { 
  
    getLogInPage,
    logAdminIn, 
    logAdminOut,
    getDashboard,
    getCreatHouse,
    getCreateLand,
    getCreateBlog,
    getCreateAdmin,
    getCreateStaff,
    getAllHousePagination,
    getEditHousePage,
    editHouse,
    deleteHouse,
    viewHouseDetail,
    createHouse, 
    uploadHouseImages, 
    uploadHouseVideo, 
    upload, 
    uploadMultiple, 
    uploadVideo,
    uploadLandandEtc,
    uploadMultipleLandImage,
    createLand,
    getLandPage,
    getEditLandPAge,
    editLand,
    viewSingleLand,
    deleteLand,
    editLandImage,
    uploadMultipleBlogImage,
    createBlog,
    editBlogImage,
    getBlogPage,
    getEditBlogPage,
    editBlog,
    deleteBlog,
    uploadAdminImage,
    createAdmin,
    getAdminPage,
    getEditAdminPage,
    editAmin,
    patchAdminStatus,
    deleteAdmin,
    editAdminImage,
    uploadMultipleInfoImage,
    createCompanyInfo,
    getCompanyInfo,
    getEditInfoPage,
    editCompanyInfo,
    editCompanyInfoImage,
    createStaff,
    editStaffImage,
    getStaffPage,
    getEditStaffPage,
    getStaffDetail,
    editStaff,
    patchStaff,
    patchManagmentStatus,
    deleteStaff,
    AssignHouseToStaff,
    deleteAssignedHouse,
    AssignLandToStaff,
    deleteAssignedland,
    uploadMultipleServiceImage,
    getCreateServicePage,
    createService,
    getEditServicePage,
    editService,
    editServiceImages,
    createVMA,
    getCreateVMA,
    getMessageInboxPage,
    getIntoMessageOne,
    deleteMessage,
    getallSubcribers,
    getSingleReply,
    getChangePasswordPage,
    changePassword,
    getForgetPasswordPage,
    processToRecoverPassword,
    getPageToUseRecoveredCode,
    resetPassword,
    getJobPage,
    createJob,
    getAllJob,
    deleteJob,
    getEditJobPage,
    editJob,
    patchJob,
    //email
    uploadedEmailAll,
    replyAllSubscribers,
    uploadEmailReplySingle,
    replySingle,
    //agent
    deleteAssignedlandToAgent,
    AssignLandToAgent,
    deleteAssignedHouseToAgent,
    AssignHouseToAgent,
    deleteAgent,
    patchAgent,
    editAgent,
    getAgentDetail,
    getEditAgentPage,
    getAgentPage,
    editAgentImage,
    createAgent,
    getCreateAgent,
   
};