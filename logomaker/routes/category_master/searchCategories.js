/**
 * Created by Shyam on 04-08-2020.
 */
exports.index = function (req, res) {
	easydb(dbPool)
		.query(function () {
			return {
				query: "SELECT categories.category_name FROM categories where categories.category_name like ? or categories.category_name in (SELECT categories.category_name FROM categories INNER JOIN category_keyword ON categories.id = category_keyword.category_id INNER JOIN keywords ON category_keyword.keyword_id = keywords.id AND keywords.keyword LIKE ?) AND categories.status <> 'Deleted'",
				params:[req.body.name, req.body.name]
			};
		})
		.success(function (rows) {
			if (rows.length > 0) {
				res.send({categories: rows, status: 200});
			} else {
				res.send({msg: "No category found", status: 500});
			}
		})
		.error(function (err) {
			logger.error(err);
			res.send({msg: err.message, status: 500});
		}).execute();
};