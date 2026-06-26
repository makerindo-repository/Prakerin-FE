"use client";
import {
  BriefcaseBusiness,
  Building,
  CheckSquare,
  CircleArrowRight,
  MapPin,
  Search,
  User,
  User2,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";

interface Student {
  id: number;
  job: string;
  photo_profile: string;
  student: {
    name: string;
    company: {
      name: string;
      user: {
        photo_profile: string;
      };
      province: {
        name: string;
      };
      city_regency: {
        name: string;
      };
    }[];
  };
}

const PerusahaanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebounce(searchTerm, 1000);

  const [data, setData] = useState<Student[]>([]);
  const [count, setCount] = useState({
    total_student_internship: "",
  });

  const fetchData = async () => {
    try {
      const user = API.get(`${ENDPOINTS.USERS}`, {
        params: {
          is_verified: true,
          page: 1,
          limit: 10,
          role: "student",
          status: "ongoing",
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const count = API.get(`${ENDPOINTS.USERS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const response = await Promise.all([user, count]);
      console.log(response);
      setData(response[0].data.data);
      setCount(response[1].data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      if (!debouncedQuery) {
        setData([]);
        return;
      }
    }

    fetchData();
  }, [debouncedQuery]);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        Daftar Penempatan Siswa/Mahasiswa
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MapPin className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Penempatan Siswa/Mahasiswa</h2>
        </div>
      </div>
      <div className="lg:flex lg:justify-between items-end mb-5">
        <div className="bg-white p-3 rounded-2xl flex items-center justify-between space-x-5 px-5 mb-5 lg:mb-0">
          <div className="text-black">
            <h1 className="text-2xl font-extrabold">
              {count.total_student_internship}
            </h1>
            <span className="text-sm">Total Siswa/Mahasiswa Magang</span>
          </div>
          <BriefcaseBusiness className="w-10 h-10  text-accent" />
        </div>
        <div className="">
          <div className="relative flex-1 bg-white rounded-2xl shadow-md">
            <input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder="Cari penampatan siswa/mahasiswa..."
              className="text-gray-600 w-full px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-accent  focus:border-transparent  rounded-2xl transition-all duration-300"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-black">
        {data &&
          data.map((item) => (
            <div
              className="bg-white space-y-5 p-5 px-10 md:px-5 rounded-2xl"
              key={item.id}
            >
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center">
                <div className="flex w-full md:w-auto">
                  {item.photo_profile ? (
                    <div className="w-10 h-10 relative self-center rounded-full border-white border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.photo_profile}`}
                        alt="Logo Perusahaan"
                        fill
                        sizes="100%"
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <User className="w-10 h-10 self-center text-[var(--color-accent)]" />
                  )}
                  <div className="ms-3 ">
                    <h5 className="text-gray-800 text-2xl font-bold">
                      {item.student.name}
                    </h5>
                    <span className="flex text-accent">{item.job} Role</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/school/penempatan/${item.id}`}
                  className="bg-accent/10 flex justify-between hover:bg-accent/20 items-center p-1 px-2 space-x-2 rounded-full"
                >
                  <span>Detail</span>
                  <CircleArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex w-full md:w-auto items-center bg-accent-light/15 p-3 rounded-2xl border border-accent-light">
                {item.student.company[0].user.photo_profile ? (
                  <div className="w-10 h-10 relative rounded-full border-white border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.student.company[0].user.photo_profile}`}
                      alt="Logo Perusahaan"
                      fill
                      sizes="100%"
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <Building className="w-10 h-10 text-[var(--color-accent)]" />
                )}
                <div className="ms-3 flex gap-2 flex-col text-md">
                  <h5 className="text-accent font-bold">
                    {item.student.company[0].name}
                  </h5>
                  <span className="flex">
                    <MapPin className="w-5 h-5" />{" "}
                    {item.student.company[0].city_regency.name},{" "}
                    {item.student.company[0].province.name}
                  </span>
                </div>
              </div>
            </div>
          ))}

        {data.length === 0 && (
          <div className="text-center py-12 col-span-2 ">
            <XCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
            <p className="text-gray-500">
              Tidak ada daftar penempatan siswa/mahasiswa yang ditemukan
            </p>
          </div>
        )}
      </div>
    </main>
  );
};
export default PerusahaanPage;
