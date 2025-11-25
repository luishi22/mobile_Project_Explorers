const express = require("express");
const router = express.Router();
const {
  createStudent,
  getMyChildren,
} = require("../controllers/studentController");
const protect = require("../middlewares/authMiddleware");

router.post("/", protect, createStudent);
router.get("/my-children", protect, getMyChildren);

module.exports = router;
