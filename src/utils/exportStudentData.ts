import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";

export interface ExportStudentOptions {
  format: "csv" | "excel";
  schoolType: "school" | "university";
  activeTab?: string;
  debouncedQuery?: string;
  currentStudents?: any[];
  title?: string;
}

export const getStatusName = (status?: string): string => {
  switch (status) {
    case "ongoing":
      return "Sedang Magang";
    case "not_started":
      return "Belum Magang";
    case "completed":
      return "Selesai Magang";
    default:
      return "-";
  }
};

export const exportStudentData = async (options: ExportStudentOptions): Promise<void> => {
  const {
    format,
    schoolType,
    activeTab,
    debouncedQuery,
    currentStudents = [],
    title = "Data Siswa",
  } = options;

  let statusParam: string | undefined;
  switch (activeTab) {
    case "Sedang Magang":
      statusParam = "ongoing";
      break;
    case "Belum Magang":
      statusParam = "not_started";
      break;
    case "Selesai Magang":
      statusParam = "completed";
      break;
    default:
      statusParam = undefined;
  }

  let exportList = currentStudents;
  try {
    const response = await API.get(`${ENDPOINTS.USERS}`, {
      params: {
        is_verified: true,
        page: 1,
        limit: 1000,
        role: "student",
        school_type: schoolType,
        status: statusParam,
        search: debouncedQuery,
      },
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      exportList = response.data.data;
    }
  } catch (err) {
    console.warn("Error fetching full student list for export, using current table data.", err);
  }

  if (!exportList || exportList.length === 0) {
    throw new Error("Tidak ada data siswa untuk diunduh!");
  }

  const isUniv = schoolType === "university";
  const headers = [
    "No",
    isUniv ? "Nama Mahasiswa" : "Nama Siswa",
    "Username",
    "Email",
    isUniv ? "NIM / Kelas" : "Kelas",
    "Jurusan",
    "Status Magang",
    "Status Langganan",
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const filePrefix = isUniv ? "Data_Mahasiswa" : "Data_Siswa";
  const filename = `${filePrefix}_${todayStr}`;

  if (format === "csv") {
    const rows = exportList.map((item: any, index: number) => {
      const magangStatus = item.status_magang || item.status || item.student?.status_magang || "not_started";
      const subStatus = item.status_subscription || item.student?.status_subscription || "free";
      return [
        index + 1,
        item.student?.name || "-",
        item.username || "-",
        item.email || "-",
        item.student?.class || "-",
        item.major?.name || "-",
        getStatusName(magangStatus),
        subStatus.toUpperCase(),
      ];
    });

    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Excel (.xls) format
    const rowsHtml = exportList
      .map((item: any, index: number) => {
        const magangStatus = item.status_magang || item.status || item.student?.status_magang || "not_started";
        const subStatus = item.status_subscription || item.student?.status_subscription || "free";
        return `
          <tr>
            <td style="text-align: center; border: 1px solid #cccccc; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${item.student?.name || "-"}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${item.username || "-"}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${item.email || "-"}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${item.student?.class || "-"}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${item.major?.name || "-"}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${getStatusName(magangStatus)}</td>
            <td style="border: 1px solid #cccccc; padding: 8px;">${subStatus.toUpperCase()}</td>
          </tr>
        `;
      })
      .join("");

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${title}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #0D9488; color: white; border: 1px solid #cccccc; padding: 10px; text-align: left; }
          td { border: 1px solid #cccccc; padding: 8px; }
        </style>
      </head>
      <body>
        <h2 style="font-family: Arial, sans-serif; color: #0D9488;">${title}</h2>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th style="background-color: #0D9488; color: white; border: 1px solid #cccccc; padding: 10px;">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
