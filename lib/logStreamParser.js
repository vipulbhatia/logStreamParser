var fs = require('fs'),
	emitter = require('events').EventEmitter
	util = require('util');

var logStreamParser = function(fileName) {
	var that = this;
	emitter.call(this);//inherit from EventEmitter

	var filePath = __dirname + '\\' + fileName,
		currSize = -1;

	var getFileSize = function() {//cb is callback function that will be invoked once we get file size
		fs.stat(fileName, function(err, info) {
			if(err) console.log('error: getting file size: ' + err);
			else {
				if(currSize !== -1) {
					that.emit('sizeChange', currSize, info.size);
				} else {
					that.emit('ready', info.size);
				}
			}
		});
	}
	
	this.on('ready', function(size) {
		console.log(size);
	});

	this.on('sizeChange', function(currSize, newSize) {
		console.log(newSize);
	});

	this.watch = function() {
		getFileSize();
	};

}

util.inherits(logStreamParser, emitter);

var x = new logStreamParser('abc.log');

x.watch();