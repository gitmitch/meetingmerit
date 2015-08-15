var db = require('./db')
var hashids = require('hashids')


function Meeting(meetingName, tsCreated, meetingID) {
    this.meetingName = meetingName
    if(this.meetingName && this.meetingName.length > 64)
        this.meetingName = this.meetingName.substr(0, 64)

    this.tsCreated = tsCreated
    this.meetingID = meetingID

    if(!this.tsCreated)
        this.tsCreated = new Date()

    this.getMeetingHash = function() {
        var h = new hashids(db.getSalt())
        return h.encode(this.meetingID)
    }



    this.save = function(callback) {
        if(!this.meetingID)
            return db.runQuery("INSERT INTO meetings SET ?", this, function(err, result) {
                if(err) return callback(err)
                this.values.meetingID = result.insertId;
                callback(null, result)
            })
        return db.runQuery("UPDATE meetings SET ?", this, callback)
    }

    this.saveRating = function(rating, comments, callback) {
        if((!rating && !comments) || (rating == 0 && comments == ""))
            return callback()

        if(rating == 0) rating = null

        if(comments && comments.length > 150)
            comments = comments.substr(0, 150)

        return db.runQuery("INSERT INTO ratings SET ?", {
            meetingID: this.meetingID,
            userID: 0,
            rating: rating,
            comments: comments
        }, callback)
    }

    this.getRatings = function(callback) {
        return db.runQuery("SELECT * FROM ratings WHERE meetingID = ? ORDER BY timestamp", this.meetingID, callback)
    }
}

function getMeetingFromHash(meetingHash, callback) {
    var h = new hashids(db.getSalt())
    db.runQuery("SELECT * FROM meetings WHERE meetingID = ?", h.decode(meetingHash), function(err, rows) {
        if(err) return callback(err)
        callback(null, new Meeting(rows[0].meetingName, rows[0].tsCreated, rows[0].meetingID))
    })
}


module.exports = {
    Meeting: Meeting,
    getMeetingFromHash: getMeetingFromHash
}
