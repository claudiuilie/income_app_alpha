const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const request = require('request');
const WebTorrent = require('../assets/tracker/WebTorrent')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const config = new options();
const router = express.Router();
const mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    // if (!req.session.loggedin) res.redirect('/auth');

    // else {}
    // res.render('vacations',{});

    let torrent = 'magnet:?xt=urn:btih:8df201bd3630cf4c8d89764fba95760db50cfae6&dn=Manifest.S02E06.1080p.WEB.H264-AMCON%5BTGx%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.ccc.de%3A80'
    // console.log(torrent)
    let tracker = new WebTorrent(torrent)
    // tracker.downloadTorrent()

    res.render('home_cinema', {});

});

router.post('/', (req, res, next) => {
    console.log(req.body)
    let params = req.body.search
    request(`https://tpb.party/search/${params}`, (error, response, body) => {
        if (error) {
            return next(error);
        }

        let dom = new JSDOM(body);
        let resultsTable = dom.window.document.getElementsByTagName('tbody');
        let resultsObject = []

        if (resultsTable.length > 0) {
            let resultsRows = resultsTable[0].children
            for (let x = 0; x < resultsRows.length - 1; x++) {
                resultsObject.push({
                    title: resultsRows[x].children[1].children[0].children[0].text,
                    magnet: resultsRows[x].children[1].children[1].href,
                    size: resultsRows[x].children[1].lastElementChild.textContent.split(',')[1].replace(' Size ', ''),
                    uploaded: resultsRows[x].children[1].lastElementChild.textContent.split(',')[0].replace('Uploaded ', ''),
                    seeders: resultsRows[x].children[2].textContent,
                    leechers: resultsRows[x].children[3].textContent
                })
            }
            res.send(resultsObject)
        } else {
            res.send({ results: 0 })
        }        
    });
})

module.exports = router;