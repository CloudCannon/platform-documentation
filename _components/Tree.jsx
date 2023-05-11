const tree = (str, placeholder = ">") => {
	const lines = str.split('\n');

  for (let l = 0; l < lines.length; l++) {
		const line = lines[l].split('');
		for (let c = 0; c < line.length; c++) {
			if (line[c] !== placeholder) continue;
			
			const lineAbove = lines[l-1]?.[c] === placeholder;
			const lineBelow = lines[l+1]?.[c] === placeholder;
			const lineLeft= lines[l][c-1] === placeholder;
			const lineRight= lines[l][c+1] === placeholder;

			if (lineLeft) {
				line[c] = "─";
			} else if (lineBelow && lineRight) {
				line[c] = "├";
			} else if (lineBelow) {
				line[c] = "│";
			} else {
				line[c] = "└";
			}
		}
		lines[l] = line.join('');
	}

	return lines.join('\n');
};

export default function ({ comp, children }) {
  const code_str = children?.props?.children?.props?.children;
  const tree_str = tree(code_str);
  return (
    <div className="c-code-block">
      <div className="c-code-block__code">
        <figure className="highlight">
          <pre>
            <code className={`language-tree`}>
              {tree_str}
            </code>
          </pre>
        </figure>
      </div>
    </div>
  )
}