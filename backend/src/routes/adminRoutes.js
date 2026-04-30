import{
    adminLogin,
    getAllHospitals,
    getAllUsers,
    deleteHospital,
    deleteUser
    
} from "../controllers/adminController.js";
import express from 'express';
const router=express.Router();
router.post("/login",adminLogin);
router.get("/users",getAllUsers);
router.get("/hospitals",getAllHospitals);
router.delete("/user/:id",deleteUser);
router.delete("/hospital/:id",deleteHospital);
export default router;