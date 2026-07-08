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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  // Show all labels regardless of size
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
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
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
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
