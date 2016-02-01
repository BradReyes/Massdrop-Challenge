var mongoose = require('mongoose');

/* holds db for jobs, which has two fields:
 * job_id (created by a unique hash based on the url string),
 * and html (which could really be the contents of the page)
 */
var dbSchema = mongoose.Schema({
	job_id: String,
	html: String,
});

var DB = mongoose.model('DB', dbSchema);
module.exports = DB;