var path = require('path');
var fs = require('fs');

var mime_types = {
    HTML: 'text/html',
    HTM: 'text/html',
    ICO: 'image/x-icon'
};

module.exports = function (req, res) {
    if (req.url === '/') req.url = '/index.html';
    var mime_type = mime_types[req.url.split('.').pop().toUpperCase()] || 'text/plain';

    var filename = __dirname+req.url;
    var readStream = fs.createReadStream(filename);
    readStream.on('open', function () {
        readStream.pipe(res); 
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        console.log(filename, 'err', err);
        res.end(err);
    });

};
