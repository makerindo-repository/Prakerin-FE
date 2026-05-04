"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { API, ENDPOINTS } from "../../../utils/config";
import { useRouter, useSearchParams } from "next/navigation";
import DescriptionRendererLite from "@/components/RenderBlocksLite";
import LoaderData from "@/components/loader";
import { getDurationUnit } from "@/utils/getDurationUnit";
import {
  ArrowRight,
  Bookmark,
  Building,
  ChevronDown,
  CircleDollarSign,
  Search,
  UsersRound,
} from "lucide-react";
import NotFoundComponent from "@/components/NotFoundComponent";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

interface ProvinceAndCityRegencyAndField {
  id: string;
  name: string;
}

interface Filter {
  province_id: string[];
  city_regency_id: string[];
  grade: ("smk" | "mahasiswa" | "all" | "")[];
  field_id: string[];
  duration_id: string[];
}

interface Duration {
  id: string;
  duration_value: number;
  duration_unit: string;
}
interface Lowongan {
  id: string;
  title: string;
  description: any;
  grade: Grade;
  is_available: boolean;
  duration: {
    duration_value: number;
    duration_unit: DurationUnit;
  };
  is_paid: boolean;
  qouta: number;
  type: Type;
  location: Location;
  save_job_opening: boolean;
  company: {
    address: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  user: {
    photo_profile: string;
  };
}
type DurationUnit = "year" | "month" | "day";
type Type = "full_time" | "part_time";
type Grade = "smk" | "mahasiswa" | "all";
type Location = "onsite" | "remote" | "hybrid";

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
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [data, setData] = useState<Lowongan[]>([]);
  const [search, setSearch] = useState<string>("");
  const [inputSearch, setInputSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search") || "";

  const [provinces, setProvinces] = useState<ProvinceAndCityRegencyAndField[]>(
    []
  );
  const [cityRegencies, setCityRegencies] = useState<
    ProvinceAndCityRegencyAndField[]
  >([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [fields, setFields] = useState<ProvinceAndCityRegencyAndField[]>([]);

  const [filterData, setFilterData] = useState<Filter>({
    province_id: [],
    city_regency_id: [],
    grade: [],
    field_id: [],
    duration_id: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  // Track which items have expanded descriptions
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const router = useRouter();

  // Debounce search
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
          durasi: filterData.duration_id,
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

  const handleToggle = useCallback(
    (filter: string) => {
      setOpenFilter(openFilter === filter ? null : filter);
    },
    [openFilter]
  );

  // Fetch data paralel
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
    fetchJobOpenings();
  }, [filterData, search, fetchJobOpenings]);

  useEffect(() => {
    setInputSearch(keyword);
    setSearch(keyword);
  }, [keyword]);

  useEffect(() => {
    if (filterData.province_id.length === 0) {
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

  // Memoize fields for filter
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

  return (
    <>
      <section className="flex flex-col items-center text-center justify-center mt-15">
        <h1 className="text-3xl font-bold text-accent mb-5">Lowongan Magang</h1>
        <p className="text-gray-500 text-xl">
          Temukan peluang magang dari berbagai perusahaan ternama. Daftar,
          lamar, dan mulai perjalanan kariermu bersama kami.
        </p>
        <div className="w-3/4 relative items-center rounded-full shadow-md border border-gray-200 bg-gray-200/50 flex mt-8">
          <input
            type="text"
            onChange={(e) => setInputSearch(e.target.value)}
            value={inputSearch}
            placeholder="Cari lowongan magang impian anda..."
            className="w-full pl-12 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 rounded-full"
          />
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <button
            onClick={() => setSearch(inputSearch)}
            className="absolute right-4 bg-accent-dark w-8 h-8  rounded-full text-white hover:bg-prakerin-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowRight className=" w-6 h-6 m-auto" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setInputSearch("Magang Popular")}
            className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
          >
            Magang Popular
          </button>
          {fieldButtons}
        </div>
      </section>
      <section className="px-4 md:px-10 lg:px-20 py-10">
        <h5 className="text-sm text-gray-600">
          lowongan ditemukan:
          <span className="text-gray-800 font-bold"> {data.length}</span>
        </h5>
        <div className="flex flex-col lg:flex-row gap-8  min-h-screen items-stretch">
          <div className="w-full lg:flex-1 flex flex-col gap-6 mt-3">
            {loading ? (
              <LoaderData />
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/lowongan/${item.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/lowongan/${item.id}`);
                    }
                  }}
                  className="bg-white rounded-xl shadow-md p-6 space-y-4 grid grid-cols-1 md:grid-cols-10 gap-2 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  aria-label={`Lihat detail lowongan ${item.title}`}
                >
                  <div className="flex items-start gap-4 col-span-6">
                    {item.user.photo_profile ? (
                      <div className="w-15 h-15 relative rounded-full border-white border">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.user.photo_profile}`}
                          alt="Logo Perusahaan"
                          fill
                          sizes="100%"
                          className="object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <Building className="w-15 h-15 text-[var(--color-accent)]" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-cyan-700">
                        {item.title}
                      </h2>
                      {/* Collapsible description - shows a short preview on mobile and can be expanded */}
                      <div className="mt-3 text-gray-600">
                        <div
                          className={`break-all whitespace-pre-wrap overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                            expandedItems[item.id]
                              ? "max-h-[2000px]"
                              : "max-h-20"
                          }`}
                        >
                          <DescriptionRendererLite data={item.description} />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItems((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }));
                          }}
                          className="mt-2 text-sm text-cyan-700 hover:underline"
                          aria-expanded={!!expandedItems[item.id]}
                          aria-controls={`desc-${item.id}`}
                        >
                          {expandedItems[item.id]
                            ? "Tutup"
                            : "Baca Selengkapnya"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex col-span-4 items-center flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <UsersRound className="w-4 h-4" /> {item.qouta} -{" "}
                      {getLabel("type", item.type)} -{" "}
                      {getLabel("location", item.location)} -{" "}
                      {getLabel("grade", item.grade)} -{" "}
                      {item.duration?.duration_value}{" "}
                      {getDurationUnit(item.duration?.duration_unit)}
                    </div>
                    <div className="flex items-center gap-1">{`${item.company.address}, ${item.city_regency?.name ?? "N/A"}, ${item.province?.name ?? "N/A"}`}</div>
                    {item.is_paid && (
                      <div className="flex items-center gap-1 ">
                        <CircleDollarSign className="w-4 h-4 " />
                        Dibayar
                      </div>
                    )}
                    {Cookies.get("authorization") === "student" && (
                      <button
                        type="button"
                        onClick={(e) => handleClickFavorite(e, item.id)}
                        className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            item.save_job_opening
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        Simpan
                      </button>
                    )}
                    <Link
                      href={`/lowongan/${item.id}`}
                      className="px-4 py-2 rounded-md bg-cyan-700 text-white hover:bg-cyan-800"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 col-span-2 ">
                <NotFoundComponent text="Tidak ada lowongan yang ditemukan." />
              </div>
            )}
          </div>
          {/* Filter Box */}
          <div className="w-full lg:w-1/4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-20">
              <h3 className="text-lg font-semibold mb-4">Filter Lowongan</h3>

              {/* Provinsi */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleToggle("provinsi")}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-700 mb-3"
                >
                  Provinsi
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      openFilter === "provinsi" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilter === "provinsi" && (
                  <div className="filter-dropdown space-y-2">
                    {provinces.map((prov) => (
                      <label className="flex items-center" key={prov.id}>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterData.province_id.includes(prov.id)}
                          onChange={() => {
                            setFilterData((prev) => ({
                              ...prev,
                              province_id: prev.province_id.includes(prov.id)
                                ? prev.province_id.filter(
                                    (id) => id !== prov.id
                                  )
                                : [...prev.province_id, prov.id],
                            }));
                          }}
                        />
                        {prov.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Kota */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleToggle("kota")}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-700 mb-3"
                >
                  Kabupaten / Kota
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      openFilter === "kota" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilter === "kota" && (
                  <div className="filter-dropdown space-y-2">
                    {cityRegencies.length === 0 ? (
                      <div className="text-center py-12 col-span-2 ">
                        <NotFoundComponent text="Tidak ada kota atau kabupaten yang ditemukan." />
                      </div>
                    ) : (
                      <>
                        {cityRegencies.map((cityRegency) => (
                          <label
                            className="flex items-center"
                            key={cityRegency.id}
                          >
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={filterData.city_regency_id.includes(
                                cityRegency.id
                              )}
                              onChange={() => {
                                setFilterData((prev) => ({
                                  ...prev,
                                  city_regency_id:
                                    prev.city_regency_id.includes(
                                      cityRegency.id
                                    )
                                      ? prev.city_regency_id.filter(
                                          (id) => id !== cityRegency.id
                                        )
                                      : [
                                          ...prev.city_regency_id,
                                          cityRegency.id,
                                        ],
                                }));
                              }}
                            />
                            {cityRegency.name}
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pendidikan */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleToggle("pendidikan")}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-700 mb-3"
                >
                  Tingkat Pendidikan
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      openFilter === "pendidikan" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilter === "pendidikan" && (
                  <div className="filter-dropdown space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterData.grade.includes("smk")}
                        onChange={() =>
                          setFilterData((prev) => ({
                            ...prev,
                            grade: prev.grade.includes("smk")
                              ? prev.grade.filter((g) => g !== "smk")
                              : [...prev.grade, "smk"],
                          }))
                        }
                      />
                      SMK
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterData.grade.includes("mahasiswa")}
                        onChange={() =>
                          setFilterData((prev) => ({
                            ...prev,
                            grade: prev.grade.includes("mahasiswa")
                              ? prev.grade.filter((g) => g !== "mahasiswa")
                              : [...prev.grade, "mahasiswa"],
                          }))
                        }
                      />
                      Mahasiswa
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterData.grade.includes("all")}
                        onChange={() =>
                          setFilterData((prev) => ({
                            ...prev,
                            grade: prev.grade.includes("all")
                              ? prev.grade.filter((g) => g !== "all")
                              : [...prev.grade, "all"],
                          }))
                        }
                      />
                      Semua
                    </label>
                  </div>
                )}
              </div>

              {/* Bidang */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleToggle("field")}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-700 mb-3"
                >
                  Bidang Magang
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      openFilter === "field" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFilter === "field" && (
                  <div className="filter-dropdown space-y-2">
                    {fields.map((field) => (
                      <label className="flex items-center" key={field.id}>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterData.field_id.includes(field.id)}
                          onChange={() =>
                            setFilterData((prev) => ({
                              ...prev,
                              field_id: prev.field_id.includes(field.id)
                                ? prev.field_id.filter((id) => id !== field.id)
                                : [...prev.field_id, field.id],
                            }))
                          }
                        />
                        {field.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Durasi */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleToggle("durasi")}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-700 mb-3"
                >
                  Durasi Magang
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      openFilter === "durasi" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFilter === "durasi" && (
                  <div className="filter-dropdown space-y-2">
                    {durations.map((duration) => (
                      <label className="flex items-center" key={duration.id}>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filterData.duration_id.includes(duration.id)}
                          onChange={() =>
                            setFilterData((prev) => ({
                              ...prev,
                              duration_id: prev.duration_id.includes(
                                duration.id
                              )
                                ? prev.duration_id.filter(
                                    (id) => id !== duration.id
                                  )
                                : [...prev.duration_id, duration.id],
                            }))
                          }
                        />
                        {duration.duration_value}{" "}
                        {getDurationUnit(duration.duration_unit)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
