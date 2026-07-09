import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  // Sembunyikan label untuk slice yang terlalu kecil supaya tidak numpuk/tabrakan
  if ((percent ?? 0) < 0.05) return null;

  // Posisi label di LUAR donat, bukan di tengah cincin
  const labelRadius = outerRadius + 20;
  const x = cx + labelRadius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + labelRadius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="700"
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label, tooltip }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg">
        {/* 1: variable tooltip */}
        <p className="font-semibold text-gray-800">{tooltip}</p>

        {/* 2 & 3: data dari slice */}
        <p className="text-teal-600">
          <span className="font-medium">{payload[0].name}:</span>
          <span className="font-bold"> {payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface PieChartCompenentProps {
  legend: string;
  tooltip?: string;
  dataList: DataPieChart[];
  hideCardStyle?: boolean;
}

export interface DataPieChart {
  name: string;
  value: number;
  color: string;
}

export default function PieChartComponent({
  legend,
  tooltip,
  dataList,
  hideCardStyle = false,
}: PieChartCompenentProps) {
  return (
    <div className={hideCardStyle ? "w-full" : "w-full h-full mx-auto bg-gray-50 rounded-lg p-4 shadow-sm"}>
      {legend && (
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          {legend}
        </h2>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataList.map((data) => ({
                name: data.name,
                value: data.value,
              }))}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
              label={renderCustomizedLabel}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              fill="#8884d8"
              dataKey="value"
            >
              {dataList.map((data) => (
                <Cell key={`cell-${data.name}`} fill={data.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip tooltip={tooltip} />}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {dataList.map((data) => (
          <div key={data.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm text-gray-700 font-medium">
              {data.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}