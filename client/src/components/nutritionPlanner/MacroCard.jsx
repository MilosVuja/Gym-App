export default function MacroCard({
  title,
  macros,
  units = {},
  emptyNote = null,
  className = "",
}) {
  return (
    <div className={`text-sm text-white ${className}`}>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      {macros && Object.keys(macros).length > 0 ? (
        Object.entries(macros).map(([key, value]) => {
          const unit = units[key] ?? "";
          const label = key.charAt(0).toUpperCase() + key.slice(1) + ":";

          return (
            <div key={key} className="flex gap-2 mb-1 items-baseline">
              <div className="w-15 text-left">
                <span>{label}</span>
              </div>
              <div
                className="text-right"
                style={{
                  minWidth: "40px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </div>
              <div className="text-left min-w-[60px]">{unit}</div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-400">
          {emptyNote ?? "No data available."}
        </p>
      )}
    </div>
  );
}
