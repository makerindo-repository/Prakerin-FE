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
  MapPin,
  Clock,
  GraduationCap,
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
      unoptimized
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
          <h1 className="mb-2 py-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            Lowongan Magang
          </h1>
          <p className="mb-5 max-w-2xl text-base text-gray-600">
            Temukan peluang magang dari berbagai perusahaan ternama. Daftar,
            lamar, dan mulai perjalanan kariermu bersama kami.
          </p>
          <div className="bg-white shadow-sm border border-gray-200 p-6 mb-4 rounded-xl">
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                onChange={(e) => setInputSearch(e.target.value)}
                value={inputSearch}
                placeholder="Cari lowongan magang impian anda..."
                className="w-full pl-4 pr-4 py-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4">
              {/* Provinsi */}
              <div className="relative">
                <select
                value={filterData.province_id} onChange={(e) => handleFilterChange("province_id", e.target.value)}
                className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
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
                className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
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
                className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
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
                className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
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
                className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-600 rounded-xl w-full"
                >
                  <option value="">Durasi</option>
                  {[...durations]
                    .sort((a, b) => {
                      const unitOrder: Record<string, number> = { day: 1, month: 2, year: 3 };
                      const unitA = unitOrder[a.duration_unit] || 99;
                      const unitB = unitOrder[b.duration_unit] || 99;
                      if (unitA !== unitB) return unitA - unitB;
                      return a.duration_value - b.duration_value;
                    })
                    .map((duration) => (
                      <option key={duration.id} value={duration.id}>
                        {duration.duration_value} {getDurationUnit(duration.duration_unit)}
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
          Total Posisi: <span className="font-bold text-gray-800">{data.length}</span>
          {"   ·   "}
          Total Perusahaan:{" "}
          <span className="font-bold text-gray-800">
            {new Set(data.map((d) => d.company?.name).filter(Boolean)).size}
          </span>
        </h5>
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          <div className="w-full lg:flex-1 flex flex-col gap-6 mt-3">
            {loading ? (
              <LoaderData />
            ) : data.length > 0 ? (
              <>
                {paginatedData.map((item) => {
                  const isActive = selectedJob?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedJob(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedJob(item);
                        }
                      }}
                      className={`group flex cursor-pointer flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        isActive ? "border-accent ring-1 ring-accent/30" : "border-gray-200 hover:border-accent/40"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          <ImageWithFallback
                            src={
                              item.user?.photo_profile
                                ? `${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.user.photo_profile}`
                                : null
                            }
                            alt={item.company?.name ?? "Perusahaan"}
                            fill
                            sizes="56px"
                            className="object-cover"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center">
                                <Building className="h-6 w-6 text-accent/50" />
                              </div>
                            }
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-accent">{item.company?.name}</p>
                          <h2 className="mt-0.5 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-accent">
                            {item.title}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleClickFavorite(e, item.id)}
                          aria-label={item.save_job_opening ? "Hapus dari tersimpan" : "Simpan lowongan"}
                          className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-accent/5 hover:text-accent"
                        >
                          <Bookmark className={`h-5 w-5 ${item.save_job_opening ? "fill-accent text-accent" : ""}`} />
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="truncate">{item.city_regency?.name ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                          <span>
                            {item.duration?.duration_value} {getDurationUnit(item.duration?.duration_unit)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UsersRound className="h-4 w-4 shrink-0 text-gray-400" />
                          <span>{item.qouta} Posisi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="truncate">{getLabel("grade", item.grade)}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-accent/5 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/15">
                          {getLabel("location", item.location)}
                        </span>
                        <span className="rounded-full bg-accent/5 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/15">
                          {getLabel("type", item.type)}
                        </span>
                        {item.is_paid ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                            Dibayar
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                            Tidak Dibayar
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-400">
                          Berakhir{" "}
                          {new Date(item.closing_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/lowongan/${item.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent-light px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-md hover:brightness-105"
                        >
                          Lihat Detail <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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