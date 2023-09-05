var xlsx = require('node-xlsx');
var dateFormat = require('dateformat');

exports.index = function (req, res) {
    easydb(dbPool)
        .query(function () {
            var remaining = "";
            var params = [];
            if (req.body.endDate != ""){
                remaining += " WHERE date(download_logos.downloaded_time) <= ?";
                params.push(req.body.endDate);
            }
            if (req.body.startDate != ""){
                if (remaining == ""){
                    remaining = " WHERE ";
                } else {
                    remaining += " AND ";
                }
                remaining += " date(download_logos.downloaded_time) >= ?";
                params.push(req.body.startDate);
            }
            return {
                query: "Select download_logos.id, users.email, users.last_name, users.first_name, download_logos.downloaded_time, user_logos.s3_logo_url From download_logos Inner Join users On download_logos.user_id = users.id Inner Join user_logos On user_logos.user_id = users.id And download_logos.logo_id = user_logos.id " + remaining+ " ORDER BY download_logos.downloaded_time",
                params: params
            };
        })
        .success(function (rows) {
            var array = [];
            array.push(['Email','Name','File','Downloaded Time']);
            if (rows.length > 0){
                for (var i = 0; i < rows.length; i++){
                    var item = rows[i];
                    var inner_array = [item.email, ((item.first_name == null ? "" : item.first_name) + " " + (item.last_name == null ? "" : item.last_name)), config.APP_DOMAIN + "/generatePDF?type=logo&url="+item.s3_logo_url+'&id='+item.id, dateFormat(new Date(new Date(item.downloaded_time).getTime()), "mmm dd yyyy hh:MM")];
                    array.push(inner_array);
                }
            } else {
                array.push(["No items found"]);
            }
            var buffer = xlsx.build([{name: "Tagbit Report", data: array}]);
            res.status(200).setHeader("Content-Disposition", 'attachment; filename="'+ dateFormat(new Date(), "mmm dd yyyy") + '-Downloads.xlsx"');
            res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.end(buffer);
        })
        .error(function (err) {
            logger.error(err);
            res.send({msg: err.message, status: 500});
        }).execute();
};