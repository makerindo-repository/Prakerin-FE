import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";

const renderCustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="14"
      fontWeight="600"
    >
      {value}
    </text>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3  -gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        <p className="text-teal-600">
          <span className="font-medium">Tugas Selesai: </span>
          <span className="font-bold">{`${payload[0].value}`}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface BarChartComponentProps {
  legend: string;
  dataList: {
    name: string;
    value: number;
  }[];
}

export default function BarChartComponent({
  legend,
  dataList,
}: BarChartComponentProps) {
  return (
    <div className="w-full h-full mx-auto bg-gray-50 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 text-center mb-8">
        {legend} {dataList.length}
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataList}
            margin={{
              top: 10,
              right: 20,
              left: 50,
              bottom: 5,
            }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={true}
              tick={{
                fontSize: dataList.length <= 5 ? 12 : 0,
                fill: "#374151",
                fontWeight: "500",
              }}
              angle={0}
              textAnchor="middle"
              interval={0}
            />
            <YAxis
              axisLine={true}
              tickLine={true}
              tick={{
                fontSize: 12,
                fill: "#374151",
              }}
              label={{
                value: "Tugas Selesai",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fontSize: "12px",
                  fill: "#374151",
                },
              }}
              domain={[0, 60]}
              tickCount={7}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              label={renderCustomizedLabel}
            >
              {dataList.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={"var(--color-accent)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Additional info */}
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">Siswa/Mahasiswa Magang</p>
      </div>
    </div>
  );
}
