const service = require("./login.service");
const { ensureBrowser } = require("../../browser/browserManager");


/* ---------- LOGIN ---------- */

exports.login = async (req, res) => {

  try {

    const sessionId = req.session.id;

    const result = await service.login(sessionId, req.body);

    res.json(result);

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      error: "Login failed"
    });

  }

};


/* ---------- STATUS ---------- */

exports.status = async (req, res) => {

  try {

    await ensureBrowser();

    const sessionId = req.session.id;

    const logged = await service.isLoggedIn(sessionId);

    res.json({
      logged_in: logged
    });

  } catch (err) {

    console.log("STATUS CHECK ERROR:", err);

    res.json({
      logged_in: false
    });

  }

};
