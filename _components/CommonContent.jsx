export default function ({comp, data, children}, helpers) {
  const content_id = helpers.render_common(data._file, {comp, parameters: data});
  return (
      <div data-common-content-id={content_id}>
        -- REUSABLE_CONTENT_STUB --
        {children}
        -- REUSABLE_CONTENT_STUB --
      </div>
  );
}
