/** The Indian vegetarian mark: a green square with a green dot inside. */
export function VegMark({
  className = "size-5",
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center rounded-[3px] border-2 bg-white ${className}`}
      style={{ borderColor: "#1e9e3e" }}
    >
      {pulse && (
        <span
          className="absolute inset-[-6px] animate-ping rounded-[6px] border-2 opacity-40"
          style={{ borderColor: "#1e9e3e" }}
        />
      )}
      <span className="size-[45%] rounded-full" style={{ background: "#1e9e3e" }} />
    </span>
  );
}
