
const express = require('express');
const homeRoute = express.Router();

const {
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
    // land
    landPayStackCallBack,
    LandPayStackPayment,
    landGetPaymentPage,
    LandgetPaymentErrorPage,
    getCareer,
} = require('../controller/index');


homeRoute.route('/').get(getHome);
homeRoute.route('/contacts').get(getContact);
homeRoute.route('/about-us').get(getAboutUs);
homeRoute.route('/typography').get(getTypography);
homeRoute.route('/add-feddback').post(uploadAdminImage, createTestimony);
homeRoute.route('/contacted').post(sendContactMessage);
homeRoute.route('/contact').post(sendMessage);
homeRoute.route('/blog').get(getBlogPage);
homeRoute.route('/blog-in-full').get(getSingleBlog);
homeRoute.route('/property').get(getAllHouse);
homeRoute.route('/view-property').get(getSingleHouse);
homeRoute.route('/all-lands').get(getAllLand);
homeRoute.route('/view-land').get(getSingleLand);
homeRoute.route('/feedback-page').get(getTestimonyPage);
homeRoute.route('/like').post(likeBlog);
homeRoute.route('/vision').get(getVision);
homeRoute.route('/mission').get(getMission);
homeRoute.route('/pay').post(payStackPayment);
homeRoute.route('/callback').get( payStackCallBack);
homeRoute.route('/error').get(getPaymentErrorPage);
homeRoute.route('/payments').get(getPaymentPage);
// land
homeRoute.route('/pays').post(LandPayStackPayment);
homeRoute.route('/callback').get(landPayStackCallBack);
homeRoute.route('/error').get(LandgetPaymentErrorPage);
homeRoute.route('/paymentss').get(landGetPaymentPage);
homeRoute.route('/career').get(getCareer);
 

module.exports = homeRoute;

