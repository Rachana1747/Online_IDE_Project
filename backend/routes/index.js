var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var userModel = require("../models/userModel");
var projectModel = require("../models/projectModel");



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

const secret = "secret"; 

router.post("/signUp", async (req, res) => {
  let { username, name, email, password } = req.body;
  let emailCon = await userModel.findOne({ email: email });
  if (emailCon) {
    return res.json({ success: false, message: "Email already exists" });
  }
  else {

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        let user = userModel.create({
          username: username,
          name: name,
          email: email,
          password: hash
        });

        return res.json({ success: true, message: "User created successfully" });
      });
    });

  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await userModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.json({ success: false, message: "An error occurred", error: err });
      }

      if (!isMatch) {
        return res.json({ success: false, message: "Invalid email/username or password" });
      }
      const token = jwt.sign(
        { email: user.email, userId: user._id },
        secret,
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        message: "User logged in successfully",
        token: token,
        userId: user._id
      });
    });

  } catch (err) {
    return res.json({ success: false, message: "Server error", error: err });
  }
});


router.post("/getUserDetails", async (req, res) => {
  // console.log("Called")
  let { userId } = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    return res.json({ success: true, message: "User details fetched successfully", user: user });
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/createProject", async (req, res) => {
  let { userId, title } = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let project = await projectModel.create({
      title: title,
      createdBy: userId
    });
    return res.json({ success: true, message: "Project created successfully", projectId: project._id });
  }
  else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/getProjects", async (req, res) => {
  let { userId } = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let projects = await projectModel.find({ createdBy: userId });
    return res.json({ success: true, message: "Projects fetched successfully", projects: projects });
  }
  else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/deleteProject", async (req, res) => {
  let {userId, progId} = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let project = await projectModel.findOneAndDelete({ _id: progId });
    return res.json({ success: true, message: "Project deleted successfully" });
  }
  else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/getProject", async (req, res) => {
  let {userId,projId} = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let project = await projectModel.findOne({ _id: projId });
    return res.json({ success: true, message: "Project fetched successfully", project: project });
  }
  else{
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/updateProject", async (req, res) => {
  let { userId, htmlCode, cssCode, jsCode, projId } = req.body;
  let user = await userModel.findOne({ _id: userId });

  if (user) {
    let project = await projectModel.findOneAndUpdate(
      { _id: projId },
      { htmlCode: htmlCode, cssCode: cssCode, jsCode: jsCode },
      { new: true }
    );

    if (project) {
      return res.json({ success: true, message: "Project updated successfully" });
    } else {
      return res.json({ success: false, message: "Project not found!" });
    }
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});


router.post("/shareProject", async (req, res) => {
  const { projectId } = req.body;

  try {
    const project = await projectModel.findById(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });

    const sharedProject = new projectModel({ 
      htmlCode: project.htmlCode,
      cssCode: project.cssCode,
      jsCode: project.jsCode,
      title: project.title,
      createdBy: project.createdBy,
      isPublic: true,
    });

    await sharedProject.save();

    res.status(200).json({ shareId: sharedProject._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/sharedProject/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/cloneProject", async (req, res) => {
  const { userId, htmlCode, cssCode, jsCode, sharedProjectId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    const newProject = new projectModel({
      createdBy: userId,
      htmlCode,
      cssCode,
      jsCode,
      title: "Cloned Project",
    });

    await newProject.save();

    return res.status(200).json({ success: true, sharedProjectId }); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/updateProjectTitle", async (req, res) => {
  const { projectId, newTitle } = req.body;

  if (!projectId || !newTitle) {
    return res.json({ success: false, message: "Missing projectId or newTitle." });
  }

  try {
    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      { title: newTitle },
      { new: true }
    );

    if (!updatedProject) {
      return res.json({ success: false, message: "Project not found!" });
    }

    return res.json({ success: true, message: "Project title updated successfully", updatedProject });
  } catch (error) {
    console.error("Error updating project title:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});


module.exports = router;