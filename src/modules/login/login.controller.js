const service = require("./login.service");

exports.login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.status = async (req, res) => {
  const logged = await service.isLoggedIn();
  res.json({ logged_in: logged });
};