var fs = require('fs'),
	emitter = require('events').EventEmitter,
	util = require('util');

var logStreamParser = function(filePath) {
	var that = this;
	emitter.call(this);//inherit from EventEmitter
	var currSize = -1,
		watcher,
		buffer = "",
		readStream,
		patt = new RegExp("([a-zA-Z]+\\s\\d{2},\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s[A-Z]+T):[\\s|\\t]({.*})\\r\\n");

	var getFileSize = function() {//cb is callback function that will be invoked once we get file size
		fs.stat(filePath, function(err, info) {
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
	
	var getData = function(opts) {
		console.log('reading log...');
		opts.flags = 'r';
		var readStream = fs.createReadStream(filePath, opts);

		readStream.on('data', function(chunk) {
			chunk = chunk.toString();
			//console.log(chunk);
			while(match = patt.exec(chunk)) {
				//console.log(match);
				console.log('timestamp: ' + match[1] + '    data: ' + match[2]);
				chunk = chunk.replace(patt, '').replace(/^\s*[\r\n]$/m, '');
			}
			buffer = buffer.concat(chunk);
			console.log('buffer:' + buffer);
			//buffer = buffer.replace(/^\s*[\r\n]$/gm, '');
			console.log('buffer:' + buffer);
			buffer = buffer + ":::::";
		});

		readStream.on('end', function() {
			console.log('readStream ended...');
		});
	};

	this.on('ready', function(size) {
		console.log(size);
		getData({}); 
	});

	this.on('sizeChange', function(currSize, newSize) {
		console.log('sizeChange called: ' + currSize + ':' + newSize);
		getData({start:currSize-2,end:newSize});
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
setTimeout(x.stop, 100000);