(function (Prism) {
	Prism.languages.cc_tree = {
		'comment': /\/\*[\s\S]*?\*\/|\/\/.+$|#.+$/m,
    'function': {
      pattern: /(^|\s)\S+\/\s*$/m,
      lookbehind: true
    },
    'keyword': {
      pattern: /(^|\s)[^\/\s─├│└]+\s*$/m,
      lookbehind: true
    },
    'branches': {
      pattern: /─|├|│|└/,
      alias: 'comment'
    }
	};

	Prism.languages.tree = Prism.languages.cc_tree;

}(Prism));
