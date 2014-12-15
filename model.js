var DB = require('./db').DB;

var User = DB.Model.extend({
   tableName: 'tblUsewebRunes_Login-Twitters',
   idAttribute: 'titterID',
});