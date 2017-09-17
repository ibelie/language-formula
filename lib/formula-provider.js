"use 6to5";

const fs = require('fs');
const CSON = require(atom.config.resourcePath + '/node_modules/season/lib/cson.js');
const Grammar = require(atom.config.resourcePath + '/node_modules/first-mate/lib/grammar.js')

function LCS(a, b) {
	var dp = new Uint8Array(b.length + 1);
	for (let i = 0; i < a.length; i++) {
		for (let j = 0; j < b.length; j++) {
			if (a[i] == b[j]) {
				dp[j + 1] = dp[j] + 1;
			} else {
				dp[j + 1] = Math.max(dp[j], dp[j + 1]);
			}
		}
	}
	return dp[dp.length - 1];
}

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

	packages: {},

	// Required: Return a promise, an array of suggestions, or null.
	getSuggestions: function({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
		var propertyTree = this.packages[editor.getRootScopeDescriptor()];
		if (!propertyTree) {
			return [];
		}
		var matchs = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]).match(/[A-Za-z_][A-Za-z_0-9.]*$/g);
		prefix = (matchs && matchs[0]) || prefix;
		if (prefix == '.' || prefix == '') {
			return [];
		}

		return new Promise(function(resolve) {
			var properties = prefix.split('.');
			for (let property of properties.slice(0, -1)) {
				propertyTree = propertyTree[property];
			}
			if (!propertyTree) {
				return resolve([]);
			}

			var suggestions = [];
			var sortKeys = {};
			var replacementPrefix = properties[properties.length - 1];
			for (let property of Object.keys(propertyTree)) {
				var sortKey = property;
				if (replacementPrefix.length > 0) {
					sortKey = -LCS(property, replacementPrefix);
					if (sortKey >= 0) {
						continue;
					}
				}

				var value = propertyTree[property];
				if (value !== String(value)) {
					value = 'Object';
				}
				sortKeys[property] = sortKey;
				suggestions.push({
					text: property,
				});
			}
			suggestions.sort(function(a, b) {
				var k1 = sortKeys[a.text];
				var k2 = sortKeys[b.text];
				if (k1 < k2) {
					return -1;
				} else if (k1 == k2) {
					return 0;
				} else {
					return 1;
				}
			});

			return resolve(suggestions);
		});
	},

	// (optional): called _after_ the suggestion `replacementPrefix` is replaced
	// by the suggestion `text` in the buffer
	onDidInsertSuggestion: function({editor, triggerPosition, suggestion}) {},

	// (optional): called when your provider needs to be cleaned up. Unsubscribe
	// from things, kill any processes, etc.
	dispose: function() {},
};
