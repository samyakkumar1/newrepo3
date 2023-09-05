/**
 * Created by DesignerBe on 05-10-2020.
 */
exports.index = function (req, res) {
	easydb(dbPool)
		.query(function () {
			var genCat = "";
			var orderby = "";
			var desc = "ASC";
			if (global.config.GENERAL_CATEGORY_ID != 0 && (global.config.GENERAL_CATEGORY_ID == "" || global.config.GENERAL_CATEGORY_ID == undefined || global.config.GENERAL_CATEGORY_ID == null)){
				global.config.GENERAL_CATEGORY_ID = -1;
			}
			if (global.config.GENERAL_CATEGORY_ID < req.body.category_id){
				desc = "DESC";
			}
			genCat = " OR logo_categories.category_id = " + global.config.GENERAL_CATEGORY_ID;
			orderby =  " ORDER BY logo_categories.category_id " + desc + ", logos.created_at " + (desc == "DESC" ? "ASC" : "DESC") + ", logos.id ";

			/*genCat = " OR logo_categories.category_id = " + global.config.GENERAL_CATEGORY_ID + ")  ORDER BY logo_categories.category_id " + desc + ", logos.created_at " + (desc == "DESC" ? "ASC" : "DESC") + ", logos.id ";*/

			var hidePurchasedLogos = "";
			/*
			if (req.body.hidePurchasedLogos){
				hidePurchasedLogos = "AND logo_categories.status <> 'Purchased'";
			}
			*/
			hidePurchasedLogos = "AND logos.visible = TRUE";

			if(req.body.search != '') {
				return {
					query: "SELECT logos.*, categories.url AS category_url, categories.id AS category_id FROM logos INNER JOIN logo_categories ON logos.status <> 'Deleted' AND logos.id = logo_categories.logo_id INNER JOIN categories ON categories.id = logo_categories.category_id AND categories.status <> 'Deleted' WHERE logo_categories.status <> 'Deleted' " + hidePurchasedLogos + " AND (logo_categories.category_id = ? " + genCat + ") and logos.title like ? " + orderby,
					params: [req.body.category_id, req.body.search]
				};
			} else {
				return {
					query: "SELECT logos.*, categories.url AS category_url, categories.id AS category_id FROM logos INNER JOIN logo_categories ON logos.status <> 'Deleted' AND logos.id = logo_categories.logo_id INNER JOIN categories ON categories.id = logo_categories.category_id AND categories.status <> 'Deleted' WHERE logo_categories.status <> 'Deleted' " + hidePurchasedLogos + " AND (logo_categories.category_id = ? " + genCat + ") " + orderby,
					params: [req.body.category_id]
				};
			}
			/*return {
				//query: "SELECT logos.*, categories.url AS category_url, categories.id AS category_id FROM logos INNER JOIN logo_categories ON logos.status <> 'Deleted' AND logos.id = logo_categories.logo_id INNER JOIN categories ON categories.id = logo_categories.category_id AND categories.status <> 'Deleted' WHERE (purchased_at > NOW() - INTERVAL 7 DAY OR purchased_at = 0) AND logo_categories.status <> 'Deleted' AND (logo_categories.category_id = ? " + genCat,
				query: "SELECT logos.*, categories.url AS category_url, categories.id AS category_id FROM logos INNER JOIN logo_categories ON logos.status <> 'Deleted' AND logos.id = logo_categories.logo_id INNER JOIN categories ON categories.id = logo_categories.category_id AND categories.status <> 'Deleted' WHERE logo_categories.status <> 'Deleted' " + hidePurchasedLogos + " AND (logo_categories.category_id = ? " + genCat,
				params: [req.body.category_id]
			};*/
		})
		.success(function (rows) {
			if (rows.length > 0){
				res.send({logos: rows, status: 200, req: req.body});
			} else {
				res.send({msg: "No logos found", status: 201});
			}
		})
		.error(function (err) {
			logger.error(err);
			res.send({msg: err.message, status: 500});
		}).execute();
};