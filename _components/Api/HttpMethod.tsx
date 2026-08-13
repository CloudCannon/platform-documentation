interface HttpMethodProps {
  method: string;
}

// Colour-codes the HTTP verb. Classes are styled in styles/api-reference.scss.
export default function HttpMethod({ method }: HttpMethodProps) {
  const slug = method.toLowerCase();
  return (
    <span className={`c-api-method c-api-method--${slug}`}>{method}</span>
  );
}
