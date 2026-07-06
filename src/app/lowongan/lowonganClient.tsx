"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import { useRouter, useSearchParams } from "next/navigation";
import DescriptionRendererLite from "@/components/RenderBlocksLite";
import LoaderData from "@/components/loader";
import { getDurationUnit } from "@/utils/getDurationUnit";
import { Lowongan } from "@/types/lowongan";
import {
  ArrowRight,
  Bookmark,
  Building,
  ChevronDown,
  Search,
  UsersRound,
  MapPin
} from "lucide-react";
import {
  getGrade,
  getType,
  getLocation,
  getTypeTest,
} from "@/utils/lowonganLabel";
import NotFoundComponent from "@/components/NotFoundComponent";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import LowonganDetail from "@/components/LowonganDetail";

interface ProvinceAndCityRegencyAndField {
  id: string;
  name: string;
}

interface Filter {
  province_id: string;
  city_regency_id: string;
  grade: string;
  field_id: string;
  duration_id: string;
}

interface Duration {
  id: string;
  duration_value: number;
  duration_unit: string;
}

type DurationUnit = "year" | "month" | "day";
type Type = "full_time" | "part_time";
type Grade = "smk" | "mahasiswa" | "all";
type Location = "onsite" | "remote" | "hybrid";

// ====== Helper: Image dengan fallback otomatis saat gagal dimuat (403/forbidden/404/dll) ======
interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallback: React.ReactNode;
}

function ImageWithFallback({ src, alt, fallback, ...imageProps }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      {...imageProps}
    />
  );
}
// ================================================================================================

// Utilitas label
const getLabel = (type: string, value: string) => {
  const labels: Record<string, Record<string, string>> = {
    grade: {
      smk: "Tingkat SMK",
      mahasiswa: "Tingkat Mahasiswa",
      all: "Semua Tingkat",
    },
    type: {
      full_time: "Penuh Waktu",
      part_time: "Paruh Waktu",
    },
    location: {
      onsite: "WFO",
      remote: "WFH",
      hybrid: "WFO & WFH",
    },
  };
  return labels[type]?.[value] || value;
};

export default function InternshipPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InternshipPageContent />
    </Suspense>
  )
}

function InternshipPageContent() {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [data, setData] = useState<Lowongan[]>([]);
  const [search, setSearch] = useState<string>("");
  const [inputSearch, setInputSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search") || "";

  const provinceIdParam = searchParams.get("province_id") || "";
  const cityRegencyIdParam = searchParams.get("city_regency_id") || "";
  const gradeParam = searchParams.get("grade") || "";
  const fieldIdParam = searchParams.get("field_id") || "";
  const durationIdParam = searchParams.get("duration_id") || "";

  const [selectedJob, setSelectedJob] = useState<Lowongan | null>(null);

  const [provinces, setProvinces] = useState<ProvinceAndCityRegencyAndField[]>(
    []
  );
  const [cityRegencies, setCityRegencies] = useState
    <ProvinceAndCityRegencyAndField[]
  >([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [fields, setFields] = useState<ProvinceAndCityRegencyAndField[]>([]);

  const [filterData, setFilterData] = useState<Filter>({
    province_id: "",
    city_regency_id: "",
    grade: "",
    field_id: "",
    duration_id: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputSearch]);

  const fetchJobOpenings = useCallback(async () => {
    try {
      const response = await API.get(ENDPOINTS.JOB_OPENINGS, {
        params: {
          province_id: filterData.province_id,
          city_regency_id: filterData.city_regency_id,
          grade: filterData.grade,
          search: search,
          duration_id: filterData.duration_id,
          field_id: filterData.field_id,
        },
      });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [filterData, search]);

  const handleClickFavorite = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await API.post(
          `${ENDPOINTS.SAVE_JOB_OPENINGS}`,
          { job_opening_id: id },
          { headers: { Authorization: `Bearer ${Cookies.get("userToken")}` } }
        );
        if (response.status === 200 || response.status === 201) {
          setData((prev) =>
            prev.map((job) =>
              job.id === id
                ? { ...job, save_job_opening: !job.save_job_opening }
                : job
            )
          );
        }
      } catch (error: any) {
        if (error.status === 401) {
          router.push("/masuk");
        }
      }
    },
    [router]
  );

  const handleFilterChange = (
    key: keyof Filter,
    value: string
  ) => {
    setFilterData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggle = useCallback(
    (filter: string) => {
      setOpenFilter(openFilter === filter ? null : filter);
    },
    [openFilter]
  );

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    Promise.all([
      API.get(ENDPOINTS.PROVINCES),
      API.get(ENDPOINTS.DURATIONS),
      API.get(ENDPOINTS.FIELDS),
    ]).then(([provRes, durRes, fieldRes]) => {
      if (provRes.status === 200) setProvinces(provRes.data.data);
      if (durRes.status === 200) setDurations(durRes.data.data);
      if (fieldRes.status === 200) setFields(fieldRes.data.data);
    });
    setLoading(false);
  }, [loading]);
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterData]);
  useEffect(() => {
    fetchJobOpenings();
  }, [filterData, search, fetchJobOpenings]);

  useEffect(() => {
    setInputSearch(keyword);
    setSearch(keyword);
    setFilterData({
      province_id: provinceIdParam,
      city_regency_id: cityRegencyIdParam,
      grade: gradeParam,
      field_id: fieldIdParam,
      duration_id: durationIdParam,
    });
  }, [
    keyword,
    provinceIdParam,
    cityRegencyIdParam,
    gradeParam,
    fieldIdParam,
    durationIdParam,
  ]);

  useEffect(() => {
    if (!filterData.province_id) {
      setCityRegencies([]);
      return;
    }
    API.get(ENDPOINTS.CITY_REGENCIES, {
      params: { province_id: filterData.province_id },
    })
      .then((response) => {
        if (response.status === 200) setCityRegencies(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching city regencies:", error);
      });
  }, [filterData.province_id]);

  const fieldButtons = useMemo(
    () =>
      fields.map((field) => (
        <button
          key={field.id}
          onClick={() => setInputSearch(field.name)}
          className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
        >
          {field.name}
        </button>
      )),
    [fields]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <section className="mt-15">
        <div className="w-[85%] mx-auto">
          <h1 className="text-6xl font-bold py-4 text-left mb-3 bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">Lowongan Magang</h1>
          <p className="text-black text-xl text-left mb-4">
            Temukan peluang magang dari berbagai perusahaan ternama. Daftar,
            lamar, dan mulai perjalanan kariermu bersama kami.
          </p>
          <div className="bg-white shadow-sm border border-gray-600 p-6 mb-4 rounded-xl">
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                onChange={(e) => setInputSearch(e.target.value)}
                value={inputSearch}
                placeholder="Cari lowongan magang impian anda..."
                className="w-full pl-4 pr-4 py-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4">
              {/* Provinsi */}
              <div className="relative">
                <select
                value={filterData.province_id} onChange={(e) => handleFilterChange("province_id", e.target.value)}
                className="appearance-none border border-gray-600 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              {/* Kotkab */}
              <div className="relative">
                <select
                value={filterData.city_regency_id} onChange={(e) => handleFilterChange("city_regency_id", e.target.value)} disabled={!filterData.province_id}
                className="appearance-none border border-gray-600 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Kota / Kabupaten</option>
                  {cityRegencies.map((cityreg) => (
                    <option key={cityreg.id} value={cityreg.id}>
                      {cityreg.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              {/* Tingkat */}
              <div className="relative">
                <select
                value={filterData.grade} onChange={(e) => handleFilterChange("grade", e.target.value)}
                className="appearance-none border border-gray-600 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Tingkat</option>
                  <option value="smk">Tingkat SMK</option>
                  <option value="mahasiswa">Tingkat Mahasiswa</option>
                  <option value="all">Semua Tingkat</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              {/* Bidang */}
              <div className="relative">
                <select
                value={filterData.field_id} onChange={(e) => handleFilterChange("field_id", e.target.value)}
                className="appearance-none border border-gray-600 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Bidang</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              {/* Durasi */}
              <div className="relative">
                <select value={filterData.duration_id} onChange={(e) => handleFilterChange("duration_id", e.target.value)}
                className="appearance-none border border-gray-600 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Durasi</option>
                  {durations.map((duration) => (
                    <option key={duration.id} value={duration.id}>
                      {duration.duration_value} {duration.duration_unit}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              <button
                onClick={() => setSearch(inputSearch)}
                className="bg-gradient-to-r from-accent to-accent-light text-white py-3 hover:from-accent-light hover:to-accent-light duration-300 transition-all px-6 py-3 rounded-xl"
              >
                <Search className="w-6 h-6 text-white-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10 w-[95%] mx-auto">
        <h5 className="text-sm text-gray-600">
          Total Posisi: <span className="text-gray-800 font-bold">{data.length} </span>
          Total Perusahaan: <span className="text-gray-800 font-bold">8</span>
        </h5>
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          <div className="w-full lg:flex-1 flex flex-col gap-6 mt-3">
            {loading ? (
              <LoaderData />
            ) : data.length > 0 ? (
              <>
                {paginatedData.map((item, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedJob(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedJob(item);
                      }
                    }}
                    className="bg-white border border-gray-600 shadow-sm p-5 flex flex-col rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer hover:border hover:border-cyan-500"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-15 h-15 relative rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={
                            item.user?.photo_profile
                              ? `${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.user.photo_profile}`
                              : null
                          }
                          alt="Company"
                          fill
                          sizes="100%"
                          className="object-cover"
                          fallback={<Building className="w-full h-full text-[var(--color-accent)]" />}
                        />
                      </div>

                      <p className="text-sm font-medium text-gray-500">
                        Berakhir:{" "}
                        <span className="text-red-500">
                          {new Date(item.closing_date).toLocaleDateString("id-ID", {day: "numeric", month: "long", year: "numeric",})}
                        </span>
                      </p>
                    </div>

                    <p className="text-sm font-bold text-blue-500">
                      {item.company.name}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900">
                      {item.title}
                    </h2>

                    <div className="flex items-center text-gray-600 mb-2 gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      {item.city_regency?.name ?? "N/A"},{" "}
                      {item.province?.name ?? "N/A"}
                    </div>

                    <div className="flex items-center gap-2 text-blue-600 mb-2 text-sm">
                      <UsersRound className="w-4 h-4" />
                      {item.qouta} Posisi
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 border border-cyan-500 bg-cyan-50 text-blue-600 text-sm rounded-3xl">
                        {getLabel("location", item.location)}
                      </span>

                      <span className="px-3 py-1 border border-cyan-500 bg-cyan-50 text-blue-600 text-sm rounded-3xl">
                        {getLabel("type", item.type)}
                      </span>

                      {item.is_paid && (
                        <span className="px-3 py-1 border border-cyan-500 bg-cyan-50 text-blue-600 text-sm rounded-3xl">
                          Dibayar
                        </span>
                      )}
                    </div>

                    <div className="border-t-4 border-gray-600 mb-4 mt-10"></div>

                    <div className="mt-auto">
                      <p className="text-sm text-gray-500 mb-4">
                        Diposting {new Date(item.created_at).toLocaleDateString("id-ID", {day: "numeric", month: "long", year: "numeric",})}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/lowongan/${item.id}`);
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-light text-white py-3 hover:from-accent-light hover:to-accent-light duration-300 transition-all"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
              ))}
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-2 rounded-lg border disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? "bg-cyan-700 text-white"
                          : "border"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-2 rounded-lg border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 col-span-2 ">
                <NotFoundComponent text="Tidak ada lowongan yang ditemukan." />
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 min-h-[700px] mt-3">
              <LowonganDetail
                data={selectedJob}
                handleClickFavorite={handleClickFavorite}
                getGrade={getGrade}
                getLocation={getLocation}
                getType={getType}
                getDurationUnit={getDurationUnit}
                getTypeTest={getTypeTest}
              />
          </div>
        </div>
      </section>
    </>
  );
}