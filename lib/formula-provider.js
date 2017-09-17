"use 6to5";

const fs = require('fs');
const CSON = require(atom.config.resourcePath + '/node_modules/season/lib/cson.js');
const Grammar = require(atom.config.resourcePath + '/node_modules/first-mate/lib/grammar.js')

module.exports = {
	// This will work on Formula files, but not in comments.
	selector: '.source.formula',
	disableForSelector: '.source.formula .comment',

	// This will take priority over the default provider, which has an inclusionPriority of 0.
	// `excludeLowerPriority` will suppress any providers with a lower priority
	// i.e. The default provider will be suppressed if it's true.
	inclusionPriority: 1,
	excludeLowerPriority: false,

	// This will be suggested before the default provider, which has a suggestionPriority of 1.
	suggestionPriority: 2,

	// Required: Return a promise, an array of suggestions, or null.
	getSuggestions: function({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
		var matchs = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]).match(/[A-Za-z_][A-Za-z_0-9.]*$/g);
		prefix = (matchs && matchs[0]) || prefix;
		if (prefix == '.' || prefix == '') {
			return [];
		}
		var properties = prefix.split('.');
		console.info(properties);

		return new Promise(function(resolve) {
			return resolve([{text: 'something asdf'}]);
		});
	},

	// (optional): called _after_ the suggestion `replacementPrefix` is replaced
	// by the suggestion `text` in the buffer
	onDidInsertSuggestion: function({editor, triggerPosition, suggestion}) {
		console.info('onDidInsertSuggestion', editor, triggerPosition, suggestion);
	},

	// (optional): called when your provider needs to be cleaned up. Unsubscribe
	// from things, kill any processes, etc.
	dispose: function() {},
};
