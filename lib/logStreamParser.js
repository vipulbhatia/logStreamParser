var fs = require('fs'),
	emitter = require('events').EventEmitter
	util = require('util');

var logStreamParser = function(fileName) {
	var that = this;
	emitter.call(this);//inherit from EventEmitter

	var filePath = __dirname + '\\' + fileName,
		currSize = -1,
		watcher;

	var getFileSize = function() {//cb is callback function that will be invoked once we get file size
		fs.stat(fileName, function(err, info) {
			if(err) console.log('error: getting file size: ' + err);
			else {
				if(currSize !== -1) {
					if((currSize - info.size) != 0) {
						that.emit('sizeChange', currSize, info.size);
						currSize = info.size;
					}
				} else {
					currSize = info.size;
					that.emit('ready', currSize);
				}
			}
		});
	}
	
	this.on('ready', function(size) {
		console.log(size);
	});

	this.on('sizeChange', function(currSize, newSize) {
		console.log('sizeChange called: ' + currSize + ':' + newSize);
	});

	this.watch = function() {
		watcher = setInterval(getFileSize, 100);
	};

	this.stop = function() {
		clearInterval(watcher);
	};
}

util.inherits(logStreamParser, emitter);

var x = new logStreamParser('abc.log');

x.watch();
setTimeout(x.stop, 10000);