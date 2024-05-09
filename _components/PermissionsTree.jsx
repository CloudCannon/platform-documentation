const getPermissionDocs = (permissions) => {
  const root = permissions["*"];
	const outputs = [];	

	const enumeratePerms = (key, node) => {
    const docs = Object.entries(node.docs).filter(([_, doc]) => doc);
		if (docs.length) {
      outputs.push({
        key,
        docs,
        scopes: node.scopes,
        actions: node.actions,
      });
		}

		if (node.children) {
			for (const [subkey, subnode] of Object.entries(node.children)) {
				enumeratePerms(subkey, subnode);
			}
		}
  };

	enumeratePerms("*", root);

	return outputs;
}

const formatScopes = (scopes) => scopes.map(s => (<> <code>{s}</code> </>));

const formatDocs = (docs) => docs.map(([action, doc]) => (<li key={action}><code>{action}</code> → {doc}</li>));

const formatRow = (comp, perm) => {
  return (
   <comp.DataReferenceRow label={perm.key}>
      <p>Available scopes: {formatScopes(perm.scopes)}</p>
      <ul> {formatDocs(perm.docs)} </ul>
    </comp.DataReferenceRow>
  );
}

export default function ({comp, permissions}) {
  const rowsObjects = getPermissionDocs(permissions);
  const rows = rowsObjects.map(r => formatRow(comp, r));

  return (
    <comp.DataReference>
      {rows}
    </comp.DataReference>
  );
}