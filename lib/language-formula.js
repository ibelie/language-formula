"use 6to5";

const grammar = require('./formula-grammar');
const provider = require('./formula-provider');

module.exports = {
	// Configuration
	config: {
		formulaPackagePath: {
			type: 'string',
			'default': ''
		}
	},

	/**
	 * This offer the formula provider for autocomplete-plus.
	 */
	provide: () => provider,

	/**
	 * This is the primary required function for an exported module. This
	 * function invokes updateGrammars to load formula packages.
	 */
	activate: (state) => {
		atom.config.observe('language-formula', (cfg) => grammar.updateGrammars(cfg));
		grammar.updateGrammars(atom.config.get('language-formula'));
	}
};
