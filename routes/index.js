var express = require('express');
var db = require('../mm_modules/db')
var meeting = require('../mm_modules/meeting')
// Jade automatically escapes stuff to prevent xss
// var escape = require('html-escape')

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Meeting Merit', prompt: 'Register a Meeting' });
});

router.post('/', function(req, res, next) {
    var m = new meeting.Meeting(req.body.meetingName)

    m.save(function(err, result) {
        if(err) return res.render('index', { title: 'Meeting Merit', prompt: 'Error Registering Meeting', errorMessage: err.message})

        //res.render('index', {
        //    title: 'Meeting Merit',
        //    prompt: 'Register Another Meeting',
        //    meetingToRate: m,
        //    meetingURL: req.protocol + "://" + req.hostname + "/" + m.getMeetingHash()})

        res.redirect('/' + m.getMeetingHash() + '/invite')
    })
})

router.param('meetingHash', function(req, res, next, meetingHash) {
    meeting.getMeetingFromHash(meetingHash, function(err, m) {
        if(err) return next(err)
        if(!m) return res.status(404).send('Meeting not found')
        req.m = m
        req.meetingHash = meetingHash
        next()
    })
})

router.get('/:meetingHash', function(req, res, next) {
    res.render('rate', {m: req.m, meetingHash: req.meetingHash})
})

router.get('/:meetingHash/invite', function(req, res, next) {
    res.render('index', {
        title: 'Meeting Merit',
        prompt: 'Register Another Meeting',
        meetingToRate: req.m,
        meetingURL: req.protocol + "://" + req.hostname + "/" + req.meetingHash})

})


router.post('/:meetingHash/results', function(req, res, next) {
    if((req.body.rating && req.body.rating > 0) || (req.body.comments && req.body.comments.length > 0))
        req.m.saveRating(req.body.rating, req.body.comments, function(err) {
            if(err) {
                console.log("failed to save rating: " + err.message)
                res.render('rate', {errorMessage: 'failed to save rating', m: req.m, meetingHash: req.meetingHash})
            }
            next()
        })
    else next()
}, function(req, res, next) {
    res.redirect('/' + req.meetingHash + '/results')
})

router.get('/:meetingHash/results', function(req, res, next) {
    req.m.getRatings(function(err, rows) {
        if(err) console.log("failed to retrieve ratings: " + err.message)


        var totals = [0, 0, 0, 0, 0, 0]
        rows.forEach(function(r) {
            if(r.rating)
                totals[r.rating]++
        })
        totals.shift()

        var comments = rows.filter(function(r) {
            return r.comments && r.comments.length > 0
        })

        res.render('report', {m: req.m, ratings: comments, totals: totals})
    })

})






module.exports = router;
