const express = require("express");
const router = express.Router();
const os = require("os");

router.get("/", (req, res) => {
    res.send({
        response: "Server is up and running. from :- " +
            os.hostname()
    }).status(200);
});

module.exports = router;