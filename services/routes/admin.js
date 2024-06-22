const express = require('express');
const adminRoute = express.Router();
const {  forwardAuthenticated,
    ensureAuthenticated } = require('../middleware/auth'); 


const {
    logAdminIn,
    getLogInPage, 
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
    getEditLand,
    editBlog,
    deleteBlog,
    uploadsAdmin,
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
    getEditBlogPage,
    editStaffImage,
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
} = require ('../controller/admin');


adminRoute.route('/admin-login').get(getLogInPage);
adminRoute.route('/login').post(forwardAuthenticated, logAdminIn);
adminRoute.route('/logout').post(logAdminOut);
adminRoute.route('/dashboard').get(ensureAuthenticated, getDashboard);
adminRoute.route('/create-housing').get(ensureAuthenticated, getCreatHouse);
adminRoute.route('/create-land').get(ensureAuthenticated, getCreateLand);
adminRoute.route('/create-blog').get(ensureAuthenticated, getCreateBlog);
adminRoute.route('/create-staff').get(ensureAuthenticated, getCreateStaff);
adminRoute.route('/create-admin').get(ensureAuthenticated, getCreateAdmin);
adminRoute.route('/housing/:page').get( ensureAuthenticated, getAllHousePagination);
adminRoute.route('/edit-property').get(ensureAuthenticated, getEditHousePage);
adminRoute.route('/edit-property/:id').post(ensureAuthenticated, editHouse);
adminRoute.route('/delete-property/:id').delete(ensureAuthenticated, deleteHouse);
adminRoute.route('/view-detail-house').get(ensureAuthenticated, viewHouseDetail);
adminRoute.route('/create-property').post(ensureAuthenticated, upload, uploadMultiple, createHouse);
adminRoute.route('/edit-property-image/:id').post(ensureAuthenticated, upload, uploadMultiple, uploadHouseImages);
adminRoute.route('/upload/:id').post(ensureAuthenticated, uploadVideo.single('video'), uploadHouseVideo);
adminRoute.route('/create-land').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleLandImage, createLand);
adminRoute.route('/edit-land-image/:id').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleLandImage, editLandImage);
adminRoute.route('/edit-land/:id').post(ensureAuthenticated, editLand);
adminRoute.route('/edit-land').get(ensureAuthenticated, getEditLandPAge);
adminRoute.route('/view-detail-land').get(ensureAuthenticated, viewSingleLand);
adminRoute.route('/delete-land/:id').delete(ensureAuthenticated, deleteLand);
adminRoute.route('/create-blog').post( ensureAuthenticated, uploadLandandEtc, uploadMultipleLandImage, createBlog );
adminRoute.route('/edit-blog-image/:id').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleBlogImage, editBlogImage);
adminRoute.route('/edit-blog/:id').post(ensureAuthenticated, editBlog);
adminRoute.route('/blog/:page').get(ensureAuthenticated, getBlogPage);
adminRoute.route('/edit-blog').get(ensureAuthenticated, getEditBlogPage);
adminRoute.route('/delete-blog/:id').delete(ensureAuthenticated, deleteBlog);
adminRoute.route('/create-admins').post(ensureAuthenticated, uploadAdminImage, createAdmin);
adminRoute.route('/admin/:page').get(ensureAuthenticated, getAdminPage);
adminRoute.route('/edit-admin/:id').post(ensureAuthenticated, editAmin);
adminRoute.route('/edit-admin').get(ensureAuthenticated, getEditAdminPage);
adminRoute.route('/admin-status/:id').patch(ensureAuthenticated, patchAdminStatus);
adminRoute.route('/edit-admin-image/:id').post(ensureAuthenticated, uploadAdminImage, editAdminImage);
adminRoute.route('/delete-admin/:id').delete(ensureAuthenticated, deleteAdmin);
adminRoute.route('/land/:page').get(ensureAuthenticated, getLandPage);
adminRoute.route('/create-info').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleInfoImage, createCompanyInfo);
adminRoute.route('/creating-info').get(ensureAuthenticated, getCompanyInfo);
adminRoute.route('/edit-info').get(ensureAuthenticated, getEditInfoPage);
adminRoute.route('/edit-infor/:id').post(ensureAuthenticated, editCompanyInfo);
adminRoute.route('/edit-info-image/:id').post(ensureAuthenticated,  uploadLandandEtc, uploadMultipleInfoImage, editCompanyInfoImage);
adminRoute.route('/create-staff').post(ensureAuthenticated, uploadAdminImage, createStaff);
adminRoute.route('/staff/:page').get(ensureAuthenticated, getStaffPage);
adminRoute.route('/staff-detail').get(ensureAuthenticated, getStaffDetail);
adminRoute.route('/edit-staff').get(ensureAuthenticated, getEditStaffPage);
adminRoute.route('/edit-staff/:id').post(ensureAuthenticated, editStaff);
adminRoute.route('/staff-status/:id').patch(ensureAuthenticated, patchStaff);
adminRoute.route('/managing-status/:id').patch(ensureAuthenticated, patchManagmentStatus);
adminRoute.route('/delete-staff/:id').delete(ensureAuthenticated, deleteStaff);
adminRoute.route('/assign-house/:id').post(ensureAuthenticated, AssignHouseToStaff);
adminRoute.route('/delete-propid/:id').get(ensureAuthenticated, deleteAssignedHouse);
adminRoute.route('/assign-land/:id').post(ensureAuthenticated, AssignLandToStaff);
adminRoute.route('/delete-landid/:id').get(ensureAuthenticated, deleteAssignedland);
adminRoute.route('/edit-staff-image/:id').post(ensureAuthenticated, uploadAdminImage, editStaffImage);
adminRoute.route('/create-service').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleServiceImage, createService);
adminRoute.route('/edit-service').get(ensureAuthenticated, getEditServicePage);
adminRoute.route('/edit-service/:id').post(ensureAuthenticated, editService);
adminRoute.route('/edit-service-image/:id').post(ensureAuthenticated, uploadLandandEtc, uploadMultipleServiceImage, editServiceImages);
adminRoute.route('/creating-service').get(ensureAuthenticated, getCreateServicePage);
adminRoute.route('/create-mission').get(ensureAuthenticated, getCreateVMA);
adminRoute.route('/create-vision').post(ensureAuthenticated,  uploadAdminImage, createVMA);
adminRoute.route('/contact/:page').get(ensureAuthenticated, getMessageInboxPage);
adminRoute.route('/contact-read').get(ensureAuthenticated, getIntoMessageOne);
adminRoute.route('/delete-contact/:id').delete(ensureAuthenticated, deleteMessage);
adminRoute.route('/email_subscriber').get(ensureAuthenticated, getallSubcribers);
adminRoute.route('/replying').get(ensureAuthenticated, getSingleReply);
adminRoute.route('/change-password').get(ensureAuthenticated, getChangePasswordPage);
adminRoute.route('/password').post(ensureAuthenticated, changePassword);
adminRoute.route('/forget-password').get( getForgetPasswordPage);
adminRoute.route('/password-new').post( processToRecoverPassword);
adminRoute.route('/recover-password').get( getPageToUseRecoveredCode);
adminRoute.route('/password-reset').post( resetPassword);
adminRoute.route('/career-builder').get(ensureAuthenticated, getJobPage);
adminRoute.route('/create-job').post(ensureAuthenticated, createJob);
adminRoute.route('/alljobs/:page').get(ensureAuthenticated, getAllJob);
adminRoute.route('/delete-career/:id').delete(ensureAuthenticated, deleteJob);
adminRoute.route('/edit-career').get(ensureAuthenticated, getEditJobPage);
adminRoute.route('/edit-career/:id').post(ensureAuthenticated, editJob);
adminRoute.route('/career-status/:id').patch(ensureAuthenticated, patchJob);
adminRoute.route('/send-email').post(ensureAuthenticated, uploadedEmailAll.single('attachment'), replyAllSubscribers);
adminRoute.route('/send-single-email').post(ensureAuthenticated, uploadEmailReplySingle.single('attachment'), replySingle);
//agent
adminRoute.route('/create-agent').post(ensureAuthenticated, uploadAdminImage, createAgent);
adminRoute.route('/agent/:page').get(ensureAuthenticated, getAgentPage);
adminRoute.route('/agent-detail').get(ensureAuthenticated, getAgentDetail);
adminRoute.route('/edit-agent').get(ensureAuthenticated, getEditAgentPage);
adminRoute.route('/edit-agent/:id').post(ensureAuthenticated, editAgent);
adminRoute.route('/agent-status/:id').patch(ensureAuthenticated, patchAgent);
adminRoute.route('/delete-agent/:id').delete(ensureAuthenticated, deleteAgent);
adminRoute.route('/assign-houses/:id').post(ensureAuthenticated, AssignHouseToAgent);
adminRoute.route('/delete-propids/:id').get(ensureAuthenticated, deleteAssignedHouseToAgent);
adminRoute.route('/assign-lands/:id').post(ensureAuthenticated, AssignLandToAgent);
adminRoute.route('/delete-landids/:id').get(ensureAuthenticated, deleteAssignedlandToAgent);
adminRoute.route('/edit-agent-image/:id').post(ensureAuthenticated, uploadAdminImage, editAgentImage);
adminRoute.route('/createagent').get(ensureAuthenticated, getCreateAgent);


module.exports = adminRoute;