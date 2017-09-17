"use 6to5";

const fg = require('./formula-grammar');

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
			fg.updateGrammars(cfg);
		});
		fg.updateGrammars(atom.config.get('language-formula'));
	}
};
