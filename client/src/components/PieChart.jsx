import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#c42e00ff", "#FFBB28"];

function MacroPieChart({ protein, carbs, fat }) {
  const data = [
    { name: "Protein", value: Math.round(protein) },
    { name: "Carbs", value: Math.round(carbs) },
    { name: "Fat", value: Math.round(fat) },
  ];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="top" align="center" />
    </PieChart>
  );
}

export default MacroPieChart;
