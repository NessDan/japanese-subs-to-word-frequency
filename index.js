var MeCab = new require('mecab-async');
var mecab = new MeCab();
var fs = require('fs');
var async = require('async');
var subs = fs.readFileSync('dialogue.txt', { encoding: 'utf8' });
var ignoreList = ['　', '、', '「', '」', '', '…', '', '？', '！'];
var mecabResults = [];

// Benchmark
console.time('bench');

// Clear files
fs.writeFileSync('output.txt', '');

// mecab can't handle large strings...
subs = subs.split("\n");
var concattedSubs = [];
var tempString = '';

for (var i = 0; i < subs.length; i++) {
	tempString += subs[i];
	if (i % 500 === 499) {
		concattedSubs.push(tempString);
		tempString = '';
	}
}

subs = concattedSubs;

async.forEach(subs, function(subpart, done) {
	mecab.wakachi(subpart, function(err, result) {
		if (err) throw err;

		result = result.filter(function(el) {
			if (ignoreList.indexOf(el) === -1) {
				return true;
			} else {
				return false;
			}
		});

		mecabResults = mecabResults.concat(result);
		done();
	});
}, function(err) {
	if(err) throw err;

	var counts = {};
	for (var i = 0; i < mecabResults.length; i++) {
	    counts[mecabResults[i]] = 1 + (counts[mecabResults[i]] || 0);
	}

	var sortable = [];
	for (var word in counts)
	      sortable.push([word, counts[word]])
	sortable.sort(function(a, b) {return a[1] - b[1]})

	sortable.reverse();

	fs.writeFileSync('output.txt', sortable.join("\r\n"));
	console.log('Done');
	console.timeEnd('bench');
});