export default function TotalMacro({ label, values = [] }) {
  return (
    <div className="flex text-white text-center">
      <p className="font-semibold mr-20">{label}</p>
      {values.map((val, idx) => (
        <p
          key={idx}
          className={
            "flex-1 min-w-[50px] w-20 font-mono " +
            (typeof val === "number" && val < 0 ? "text-red-400 " : "") +
            (idx === 1 || idx === 2 ? "" : idx === 3 ? "mr-9.5" : "")
          }
        >
          {typeof val === "number" ? Math.round(val) : val}
        </p>
      ))}
    </div>
  );
}
