var fs = require('fs');
var async = require('async');
var jschardet = require('jschardet');
var subtitleDir = 'subs/';
var dialogue = "";


fs.writeFileSync('dialogue.txt', '');
fs.writeFileSync('warnings.txt', '');

fs.readdir(subtitleDir, function(err, filenames) {
	if(err) throw err;
	async.forEach(filenames, function(filename, done) {
		var encoding = jschardet.detect(fs.readFileSync(subtitleDir + filename)).encoding;

		fs.readFile(subtitleDir + filename, {'encoding': encoding}, function(err, file) {
			if(err) throw err;

			var badChars = /[\u0000-\u0009]|[\u000B-\u001F]|[\u0021-\u2FFF]|[\u9FB0-\uFFFF]/gm; // Everything except Japanese, line breaks, and spaces.
			var notDialogueLines = /^(?!.*Dialogue).+/gm;
			var dialogueMetadata = /^(.*,.*,.*,.*,.*,.*,.*,.*,.*,)/gm;
			var manySpaces = /\s\s+/gm; // http://stackoverflow.com/a/1981366/231730
			var blankLines = /^\s*[\r\n]/gm; // http://stackoverflow.com/a/1981366/231730
			var parsedFile = file.replace(notDialogueLines, '').replace(dialogueMetadata, '').replace(badChars, '').replace(manySpaces, ' ').replace(blankLines, '');

			if (parsedFile.length < 50) {
				console.log('BAD FILE!?!?! ' + filename);
			}

			dialogue += parsedFile + "\n";

			done();
		});
	}, function(err) {
		if(err) throw err;

		fs.writeFileSync('dialogue.txt', dialogue);
	});

});

function warn(message) {
	console.warn(message);
	fs.appendFileSync('warnings.txt', message + "\r\n");
}