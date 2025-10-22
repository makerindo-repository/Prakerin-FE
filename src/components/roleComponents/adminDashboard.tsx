import { Building, School, Users2 } from "lucide-react";
import Loader from "../loader";

export default function AdminDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-bold text-xl">Ringkasan Data Pengguna</h3>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 text-center flex flex-col justify-center items-center">
            <span className="font-light text-gray-400 text-lg">
              Total Pengguna
            </span>
            <h1 className="font-extrabold text-accent text-9xl">455</h1>
            <span className="font-medium text-green-400 text-lg">
              Meningkat 201% Selama 7 hari Terakhir
            </span>
          </div>
          <div className="w-1/2 space-y-5 ">
            <div className="bg-accent/10 p-5 rounded-lg flex justify-between">
              <div className="text-accent w-full">
                <span>Total Sekolah</span>
                <h1 className="text-4xl font-bold">67</h1>
                <span className="text-green-400">
                  Meningkat 13% Selama 7 hari terakhir
                </span>
              </div>
              <School className="text-accent w-15 h-15 m-auto" />
            </div>
            <div className="bg-accent/10 p-5 rounded-lg flex justify-between">
              <div className="text-accent w-full">
                <span>Total Perusahan</span>
                <h1 className="text-4xl font-bold">67</h1>
                <span className="text-green-400">
                  Meningkat 13% Selama 7 hari terakhir
                </span>
              </div>
              <Building className="text-accent w-15 h-15 m-auto" />
            </div>
            <div className="bg-accent/10 p-5 rounded-lg flex justify-between">
              <div className="text-accent w-full">
                <span>Total Siswa</span>
                <h1 className="text-4xl font-bold">67</h1>
                <span className="text-green-400">
                  Meningkat 13% Selama 7 hari terakhir
                </span>
              </div>
              <Users2 className="text-accent w-15 h-15 m-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
