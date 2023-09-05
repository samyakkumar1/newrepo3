
/**
 * Created by Saloni on 09-05-2018.
 */
 exports.index = function (req, res) {
	easydb(dbPool)
		.query(function () {
			return {
				query: "SELECT title FROM logos WHERE title LIKE ?",
				params: [req.body.name]
			};
		})
		.success(function (rows) {
			if (rows.length > 0) {
				res.send({categories: rows, status: 200});
			} else {
				res.send({msg: "No sub category found", status: 500, dbPool: dbPool, rows: rows});
			}
		})
		.error(function (err) {
			logger.error(err);
			res.send({msg: err.message, status: 500});
		}).execute();
};