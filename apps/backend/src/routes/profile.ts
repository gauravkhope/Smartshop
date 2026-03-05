import express from "express";
import upload from "../middlewares/upload";
import { getUserProfile, updateUserProfile } from "../api/user/profile";

const router = express.Router();

router.get("/profile", getUserProfile);
router.put("/profile", upload.single("avatar"), updateUserProfile);

export default router;


