"use 6to5";

const fs = require('fs');
const CSON = require(atom.config.resourcePath + '/node_modules/season/lib/cson.js');
const Grammar = require(atom.config.resourcePath + '/node_modules/first-mate/lib/grammar.js')
const provider = require('./formula-provider');

var grammars = [];
var slots = {
	input: 'support.variable.input.formula',
	function: 'support.function.portable.formula',
	data: 'support.constant.data.formula',
};

module.exports = {
	updateGrammars: function(cfg) {
		for (let g of grammars) {
			delete provider.packages[g];
			atom.grammars.removeGrammarForScopeName(g);
		}
		if (cfg.formulaPackagePath) {
			// Supplement grammer
			var formulaGrammar = atom.grammars.grammarsByScopeName['source.formula'];
			if (!formulaGrammar || !formulaGrammar.rawPatterns) {
				setTimeout(function() {
					this.updateGrammars(cfg);
				}.bind(this), 1000);
				console.log('[language-formula] Grammar not yet available, trying again in 1s');
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
					var generic_names = {
						patterns: [],
					};
					for (let slot of Object.keys(slots)) {
						if (p[slot]) {
							generic_names.patterns.push({
								match: '\\b(' + p[slot].join('|') + ')\\b',
								name: slots[slot],
							});
						}
					}
					generic_names.patterns.push(formulaGrammar.rawRepository.generic_names);

					var repository = {};
					for (let key of Object.keys(formulaGrammar.rawRepository)) {
						repository[key] = formulaGrammar.rawRepository[key];
					}
					repository.generic_names = generic_names;

					var name = f.slice(0, -5);
					var grammar = {
						scopeName: 'source.formula.' + name,
						name: 'Formula-' + name,
						fileTypes: [name + '.f'],
						repository: repository,
						patterns: formulaGrammar.rawPatterns
					};
					atom.grammars.addGrammar(new Grammar(atom.grammars, grammar));
					provider.packages['.' + grammar.scopeName] = p.properties;
					grammars.push(grammar.scopeName);
				}
			});
		}

		// Reload all todo grammars to match
		atomVersion = parseFloat(atom.getVersion());
		atom.workspace.observeTextEditors(function(editor) {
			if (editor.getPath().endsWith('.f')) {} else if (atomVersion < 1.11) {
				editor.reloadGrammar();
			} else {
				// Workaround because:
				// - `reloadGrammar` is buggy before 1.11 (https://github.com/atom/atom/issues/13022)
				// - `maintainGrammar` change this behavior and don't reload existing grammar.
				//   - https://github.com/atom/atom/pull/12125
				//   - https://github.com/atom/atom/blob/c844d0f099e6ed95c52f0b94e1f141759926aeb8/src/text-editor-registry.js#L201
				grammarOverride = atom.textEditors.editorGrammarOverrides[editor.id];
				atom.textEditors.setGrammarOverride(editor, 'text.plain');
				if (grammarOverride) {
					atom.textEditors.setGrammarOverride(editor, grammarOverride);
				} else {
					atom.textEditors.clearGrammarOverride(editor);
				}
			}
		});
	},
};
