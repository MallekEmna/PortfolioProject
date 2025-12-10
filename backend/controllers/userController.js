import multer from "multer";
import User from "../models/User.js";
import SocialLinks from "../models/socialLinks.js";
import path from "path";

// -------------------------------------------------------
// GET USER (Public Mode)
// -------------------------------------------------------
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user)
      return res.status(404).json({ msg: "User not found" });

    // Récupérer les social links de l'utilisateur
    const socialLinks = await SocialLinks.findOne({ userId: req.params.id });
    console.log('Social links found:', socialLinks); // Debug log

    // Ajouter les social links à la réponse utilisateur
    const userWithSocialLinks = {
      ...user.toObject(),
      socialLinks: socialLinks || {
        linkedin: "",
        github: "",
        facebook: "",
        instagram: "",
        twitter: ""
      }
    };

    console.log('Response with social links:', userWithSocialLinks.socialLinks); // Debug log
    res.status(200).json(userWithSocialLinks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------------------------------------------
// UPDATE USER
// -------------------------------------------------------
export const updateUser = async (req, res) => {
  try {
    const { username, bio, skills, phone, location, lastName, socialLinks } = req.body;

    // Update user info
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, skills, phone, location, lastName },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ msg: "User not found" });

    // Update social links if provided
    if (socialLinks) {
      await SocialLinks.findOneAndUpdate(
        { userId: req.params.id },
        { ...socialLinks, userId: req.params.id },
        { new: true, upsert: true }
      );
    }

    // Récupérer les social links pour la réponse
    const userSocialLinks = await SocialLinks.findOne({ userId: req.params.id });
    console.log('Update - Social links found:', userSocialLinks); // Debug log

    // Retourner l'utilisateur avec ses social links
    const userWithSocialLinks = {
      ...user.toObject(),
      socialLinks: userSocialLinks || {
        linkedin: "",
        github: "",
        facebook: "",
        instagram: "",
        twitter: ""
      }
    };

    console.log('Update - Response with social links:', userWithSocialLinks.socialLinks); // Debug log
    res.status(200).json(userWithSocialLinks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------------------------------------------
// MULTER STORAGE : upload image user
// -------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}${ext}`);
  },
});

// Export du middleware upload
export const upload = multer({ storage });
