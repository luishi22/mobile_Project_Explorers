const express = require("express");
const router = express.Router();
const {
  createStudent,
  getMyChildren,
  markActivityComplete,
} = require("../controllers/studentController");
const protect = require("../middlewares/authMiddleware");

router.post("/", protect, createStudent);
router.get("/my-children", protect, getMyChildren);
router.post("/:studentId/complete", protect, markActivityComplete);

module.exports = router;
