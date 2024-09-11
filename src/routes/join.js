const express = require("express");
const router = express.Router();
const Pod = require("../models/pods");
const User = require("../models/users");

// Join a pod by unique code
router.post("/", async (req, res) => {
  try {
    const { unique_code, user_id } = req.body;

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user details
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate role
    if (!["student", "teacher"].includes(user.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Find the pod by unique code
    const pod = await Pod.findOne({ unique_code });

    if (!pod) {
      return res.status(404).json({ message: "Pod not found" });
    }

    // Check if user is already a member
    const isMember = pod.members.some(
      (member) => member.user_id.toString() === user_id.toString()
    );
    if (isMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this pod" });
    }

    // Add the user to the members array
    pod.members.push({
      user_id,
      role: user.role, // Use the role from the User model
      joined_at: new Date(),
    });

    // Save the updated pod
    const updatedPod = await pod.save();

    res.status(200).json(updatedPod);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining pod", error: error.message });
  }
});

module.exports = router;
