export default function TotalMacro({ label, values }) {
  return (
    <div className="flex text-white text-center">
      <p className="font-semibold mr-28">{label}</p>
      {values.map((val, idx) => (
        <p
          key={idx}
          className={
            "flex-1 min-w-[50px] w-20 " +
            (idx === 1 || idx === 2 ? "" : idx === 3 ? "ml-1 mr-1" : "")
          }
        >
          {val}
        </p>
      ))}
    </div>
  );
}
