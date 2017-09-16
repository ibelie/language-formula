"use 6to5";

const fs = require('fs');
const CSON = require(atom.config.resourcePath + '/node_modules/season/lib/cson.js');
const Grammar = require(atom.config.resourcePath + '/node_modules/first-mate/lib/grammar.js')

var grammars = [];

function updateGrammars(cfg) {
	for (let g of grammars) {
		atom.grammars.removeGrammarForScopeName(g);
	}
	if (!cfg.formulaPackagePath) {
		return;
	}
	fs.readdir(cfg.formulaPackagePath, function(err, dir) {
		if (err) {
			console.warn(err);
			return;
		}
		for (let f of dir) {
			if (!f.endsWith('.cson')) {
				continue;
			}
			var p = CSON.readFileSync(cfg.formulaPackagePath + '/' + f);
			var patterns = [];
			if (p.input) {
				patterns.push({
					match: '\\b(' + p.input.join('|') + ')\\b',
					name: 'string.unquoted.formula',
				});
			}
			if (p.function) {
				patterns.push({
					match: '\\b(' + p.function.join('|') + ')\\b',
					name: 'storage.modifier.formula',
				});
			}
			if (p.data) {
				patterns.push({
					match: '\\b(' + p.data.join('|') + ')\\b',
					name: 'invalid.deprecated.formula',
				});
			}
			patterns.push({
				include: 'source.formula',
			});
			var name = f.slice(0, -5);
			var grammar = {
				scopeName: 'source.formula.' + name,
				name: 'Formula-' + name,
				fileTypes: [name + '.f'],
				patterns: patterns,
			};
			atom.grammars.addGrammar(new Grammar(atom.grammars, grammar));
			grammars.push(grammar.scopeName);
		}
	});
}

module.exports = {
	// Configuration
	config: {
		formulaPackagePath: {
			type: 'string',
			'default': ''
		}
	},

	/**
	 * This is the primary required function for an exported module. This
	 * function invokes updateGrammars to load formula packages.
	 */
	activate: function(state) {
		atom.config.observe('language-formula', function(cfg) {
			updateGrammars(cfg);
		});
		updateGrammars(atom.config.get('language-formula'));
	}
};
