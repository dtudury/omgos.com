var path = require('path');
var fs = require('fs');
var https = require('https');

var mime_types = {
    HTML: 'text/html',
    HTM: 'text/html',
    ICO: 'image/x-icon',
    JSON: 'application/json'
};

module.exports = function (req, res) {
    if (req.url === '/') req.url = '/index.html';
    var mime_type = mime_types[req.url.split('.').pop().toUpperCase()] || 'text/plain';

    var parts = req.url.split('/');
    var file = parts.pop();
    switch (file) {
        case "route.json":
            return serve_route(req, res)
    }


    //fall through to just serve up static files
    var filename = __dirname+req.url;
    var readStream = fs.createReadStream(filename);
    readStream.on('open', function () {
        readStream.pipe(res); 
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        console.log("omgos.com readstream error", filename, 'err', err);
        res.end(err.toString());
    });

};

function serve_route(req, res) {
    var parts = req.url.split('/');
    parts.shift();//remove empty string before leading slash
    if (parts[0] == "strava") {
        var id = parts[1];
        get_strava_latlng(id, function (latlng) {
            var latlng_with_min_max = calculate_max_min(latlng);
            res.end(JSON.stringify(latlng_with_min_max));
        });
    } else {
        res.end();
    }
}

function get_strava_latlng(id, callback) {
    var url = "https://www.strava.com/stream/" + id + "?streams%5B%5D=latlng&streams%5B%5D=distance&streams%5B%5D=altitude&streams%5B%5D=time&streams%5B%5D=moving&_=" + Date.now();
    var data = "";
    https.get(url, function(response) {
        response.on('data', function(d) {
            data += d.toString();
        });
        response.on('end', function () {
            callback(JSON.parse(data).latlng);
        });
    }).on('error', function(err) {
        console.log("omgos.com to strava", url, 'err', err);
        res.end(err);
    });
}

function calculate_max_min(latlng) {
    var min_lat = 90;
    var min_long = 180;
    var max_lat = -90;
    var max_long = -180;
    latlng.forEach(function (coord) {
        min_lat = Math.min(min_lat, coord[0]);
        max_lat = Math.max(max_lat, coord[0]);
        min_long = Math.min(min_long, coord[1]);
        max_long = Math.max(max_long, coord[1]);
    });
    return {
        min_lat: min_lat,
        max_lat: max_lat,
        min_long: min_long,
        max_long: max_long,
        latlng: latlng
    };
}
