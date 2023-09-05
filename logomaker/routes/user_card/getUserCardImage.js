/**
 * Created by DesignerBe on 15-12-2020.
 */

var fs = require("fs");

exports.index = function (req, res, next) {
	if (!req.query.id){
        res.send(400);
	} else {
		var fileName = config.USER_CARD_PATH + "/" + req.query.id;
		var type;
		if (req.query.type) {
			type = decodeURIComponent(req.query.type);
			res.setHeader("Content-Type", type); 
		} else {
			type = req.query.id.split(".");
			type = type.pop();
			if (type == "svg") {
				type = "image/svg+xml";
				res.setHeader("Content-Type", type); 
			} 
		}
		res.setHeader("Cache-Control", "public, max-age=2592000");
		res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
		if (!req.query.nodownload){
			res.setHeader("Content-Disposition", 'attachment; filename="' + req.query.id + '"' ); 
		}
		var stream = fs.createReadStream(fileName);
		stream.on('error', function (err) {
			res.send(err);
		});
		stream.pipe(res); 
	}
};
