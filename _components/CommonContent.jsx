export default function ({comp, data}, helpers) {
  const content_id = helpers.render_common(data._file, {...data, comp});
  return (
      <div data-common-content-id={content_id}>REUSABLE_CONTENT_STUB</div>
  );
}
