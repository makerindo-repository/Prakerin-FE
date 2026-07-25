"use client";
import { Pencil, Plus, Search, Trash, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import Link from "next/link";
import { API, ENDPOINTS } from "@/utils/config";
import { useRouter } from "next/navigation";

type ActiveTab = "Semua" | "Sekolah" | "Perusahaan" | "Siswa" | "Mahasiswa";

interface Pages {
  activePages: number;
  pages: number;
}

interface Data {
  username: string;
  id: string;
  email: string;
  role: string;
  company: {
    name: string;
    is_verified: boolean;
  };
}

interface FormErrors {
  [key: string]: string | undefined;
}

const Users: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 500);

  const tabs = ["Semua" , "Sekolah" , "Perusahaan" , "Siswa" , "Mahasiswa"];

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [data, setData] = useState<Data[]>([]);

  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "student",
    name: "",
    address: "",
    school_id: "",
    type: "school",
  });
  const [addErrors, setAddErrors] = useState<FormErrors>({});
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await API.get(ENDPOINTS.USERS, {
          params: { role: "school", limit: 100 },
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        });
        setSchools(response.data.data || []);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    if (showAddModal) {
      fetchSchools();
    }
  }, [showAddModal]);

  const fetchData = async () => {
    setLoading(true);

    try {
      let roles: string | undefined = undefined;
      let schoolType: string | undefined = undefined;
      switch (activeTab) {
        case "Sekolah":
          roles = "school";
          break;
        case "Perusahaan":
          roles = "company";
          break;
        case "Siswa":
          roles = "student";
          schoolType = "school";
          break;
        case "Mahasiswa":
          roles = "student";
          schoolType = "university";
          break;
        default:
          break;
      }

      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          role: roles,
          school_type: schoolType,
          search: debouncedQuery,
          limit: 10,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setData(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    setIsAdding(true);
    setAddErrors({});
    try {
      await API.post(ENDPOINTS.USERS, newUserData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Pengguna berhasil ditambahkan!");
      setShowAddModal(false);
      setNewUserData({
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "student",
        name: "",
        address: "",
        school_id: "",
        type: "school",
      });
      fetchData();
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setAddErrors(responseError || {});
        }
      } else {
        console.error(error);
        await alertError("Gagal menambahkan pengguna");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };



  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "student":
        return "Siswa";
      case "school":
        return "Sekolah";
      case "company":
        return "Perusahaan";
      case "super_admin":
        return "Super Admin";
      default:
        return "Pengguna";
    }
  };

  const handleDelete = async (id: string, name: string, role: string) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menghapus pengguna "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`${getRoleLabel(role)} ${name} berhasil dihapus!`);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  const handleAccept = async (id: string, name: string, role: string) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menerima pengguna "${name}"?`
    );
    if (!confirm) return;
    try {
      await API.patch(
        `${ENDPOINTS.USERS}/${id}`,
        {
          is_verified: true,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await fetchData();
      await alertSuccess(`${getRoleLabel(role)} ${name} berhasil diterima!`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  useEffect(() => {
    setPages((prev) => ({ ...prev, activePages: 1 }));
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, activeTab, debouncedQuery]);
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Daftar User</h1>
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UsersRound className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar User</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          <span>Tambah Pengguna</span>
        </button>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as ActiveTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer  ${
              activeTab === tab
                ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
                : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari User..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-colors"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  No
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Username
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Email
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Role
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // BUG-08 fix: show loader only while loading
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                // BUG-08 fix: show accurate empty state only when not loading
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    <NotFoundComponent text="Tidak ada pengguna yang ditemukan." />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800">{item.username}</td>
                    <td className="p-4 text-gray-800">{item.email}</td>
                    <td className="p-4 text-gray-800">{item.role}</td>
                    <td className="p-4 flex gap-2">
                      
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" onClick={() => router.push(`users/${item.id}`)}><Pencil className="w-4 h-4" /></button>
                      <button
                        onClick={() =>
                          handleDelete(item.id, item.username, item.role)
                        }
                        className="p-2 text-red-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UsersRound className="text-accent w-5 h-5" />
              <span>Tambah Pengguna Baru</span>
            </h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role<span className="text-red-500">*</span>
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="student">Siswa / Mahasiswa</option>
                  <option value="school">Sekolah</option>
                  <option value="company">Perusahaan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap / Instansi<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    addErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{addErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Masukkan username"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    addErrors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addErrors.username && (
                  <p className="mt-1 text-xs text-red-500">{addErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Masukkan email"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    addErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{addErrors.email}</p>
                )}
              </div>

              {/* Conditional Field: Address for school/company */}
              {(newUserData.role === "school" || newUserData.role === "company") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newUserData.address}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Masukkan alamat lengkap"
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                      addErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {addErrors.address && (
                    <p className="mt-1 text-xs text-red-500">{addErrors.address}</p>
                  )}
                </div>
              )}

              {/* Conditional Field: School selection for student */}
              {newUserData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sekolah Asal<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.school_id}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, school_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent ${
                      addErrors.school_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Sekolah</option>
                    {schools.map((schoolItem) => {
                      const schoolDetails = schoolItem.school;
                      if (!schoolDetails) return null;
                      return (
                        <option key={schoolDetails.id || schoolItem.id} value={schoolDetails.id || schoolItem.id}>
                          {schoolDetails.name}
                        </option>
                      );
                    })}
                  </select>
                  {addErrors.school_id && (
                    <p className="mt-1 text-xs text-red-500">{addErrors.school_id}</p>
                  )}
                </div>
              )}

              {/* Conditional Field: Type for school (school/university) */}
              {newUserData.role === "school" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Instansi<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.type}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="school">Sekolah (SMK)</option>
                    <option value="university">Universitas (Perguruan Tinggi)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Masukkan password"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    addErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{addErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUserData.password_confirmation}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  placeholder="Konfirmasi password"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    addErrors.password_confirmation ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addErrors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-500">{addErrors.password_confirmation}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isAdding}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 font-medium"
                disabled={isAdding}
              >
                {isAdding ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
export default Users;
