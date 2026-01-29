import type { Helpers } from '../_types.d.ts';

interface PermissionNode {
    docs: Record<string, string>;
    scopes: string[];
    actions: string[];
    children?: Record<string, PermissionNode>;
}

interface Permissions {
    "*": PermissionNode;
}

interface PermissionRow {
    key: string;
    docs: [string, string][];
    scopes: string[];
    actions: string[];
}

interface Comp {
    DataReference: (props: { children: unknown }) => unknown;
    DataReferenceRow: (props: { label: string; children: unknown }) => unknown;
}

interface PermissionsTreeProps {
    comp: Comp;
    permissions: Permissions;
}

const getPermissionDocs = (permissions: Permissions): PermissionRow[] => {
  const root = permissions["*"];
	const outputs: PermissionRow[] = [];	

	const enumeratePerms = (key: string, node: PermissionNode) => {
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

const formatScopes = (scopes: string[], helpers: Helpers) => scopes.map((s, i) => {
  if (i) {
    return (<>, <i>{helpers.unslug(s)}</i></>);
  } else {
    return (<> <i>{helpers.unslug(s)}</i></>);
  }
});

const formatDocs = (docs: [string, string][]) => docs.map(([action, doc]) => (<li key={action}><code>{action}</code> → {doc}</li>));

const formatRow = (perm: PermissionRow, comp: Comp, helpers: Helpers) => {
  return (
   <comp.DataReferenceRow label={perm.key}>
      <p>Available scopes: {formatScopes(perm.scopes, helpers)}</p>
      <ul> {formatDocs(perm.docs)} </ul>
    </comp.DataReferenceRow>
  );
}

export default function PermissionsTree({ comp, permissions }: PermissionsTreeProps, helpers: Helpers) {
  const rowsObjects = getPermissionDocs(permissions);
  const rows = rowsObjects.map(r => formatRow(r, comp, helpers));

  return (
    <comp.DataReference>
      {rows}
    </comp.DataReference>
  );
}
