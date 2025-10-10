"use client";
import {
  CirclePlus,
  Edit,
  LayoutDashboard,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { API, ENDPOINTS } from "../../../../utils/config";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { profile } from "console";
import Image from "next/image";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";

interface Data {
  id: string;
  name: string;
  value: string;
}

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
  type: string;
}

interface CommentPrakerin {
  id: string;
  photo_profile: string;
  name: string;
  position: string;
  comment: string;
}

interface FormPartner {
  logo: File | null;
  name: string;
  address: string;
  type: string;
}

interface FormCommentPrakerin {
  photo_profile: File | null;
  name: string;
  position: string;
  comment: string;
}

interface FormErrors {
  [key: string]: string;
}

const PerusahaanPage: React.FC = () => {
  const router = useRouter();
  const [inputSearch, setInputSearch] = useState<string>("");
  const debouncedQuery = useDebounce(inputSearch, 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addLabel, setAddLabel] = useState<string>("");

  const [formError, setFormError] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [data, setData] = useState<Data[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commentPrakerin, setCommentPrakerin] = useState<CommentPrakerin[]>([]);

  const [formData, setFormData] = useState<Data[]>([]);

  const [profileImage, setImage] = useState<string | null>(null);

  const [formPartner, setFormPartner] = useState<FormPartner>({
    logo: null as File | null,
    name: "",
    address: "",
    type: "",
  });

  const [FormCommentPrakerin, setFormCommentPrakerin] =
    useState<FormCommentPrakerin>({
      photo_profile: null as File | null,
      name: "",
      position: "",
      comment: "",
    });

  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await API.get(ENDPOINTS.HOMEPAGES, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Data fetched successfully:", response.data);
      setData(response.data.data.homepages);
      setPartners(response.data.data.partners);
      setCommentPrakerin(response.data.data.comment_prakerins);
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const confirm = await alertConfirm(
      "Apakah anda yakin ingin menyimpan perubahan?"
    );
    if (!confirm) return;
    // return
    console.log("Form Data to be saved:", formData);
    try {
      const response = await API.patch(
        ENDPOINTS.HOMEPAGES,
        {
          data: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      console.log("Data saved successfully:", response.data);
      fetchData();
      await alertSuccess("Data berhasil disimpan!");
    } catch (error) {
      await alertError("Terjadi kesalahan saat menyimpan data.");
      console.error("Error saving data:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormPartner({ ...formPartner, logo: file });
      setFormCommentPrakerin({ ...FormCommentPrakerin, photo_profile: file });
      const objectUrl = URL.createObjectURL(file);
      setImage(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (editingPartnerId) {
        await API.post(
          `${ENDPOINTS.PARTNERS}/${editingPartnerId}`,
          formPartner,
          {
            params: {
              _method: "PATCH",
            },
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else if (editingCommentId) {
        await API.post(
          `${ENDPOINTS.COMMENTPRAKERINS}/${editingCommentId}`,
          FormCommentPrakerin,
          {
            params: {
              _method: "PATCH",
            },
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        switch (addLabel) {
          case "Mitra":
            await API.post(ENDPOINTS.PARTNERS, formPartner, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
                "Content-Type": "multipart/form-data",
              },
            });
            break;
          case "Ulasan":
            await API.post(ENDPOINTS.COMMENTPRAKERINS, FormCommentPrakerin, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
                "Content-Type": "multipart/form-data",
              },
            });
            break;
        }
      }
      await fetchData();
      setFormError({});

      setEditingPartnerId(null);
      setFormPartner({
        logo: null,
        name: "",
        address: "",
        type: "",
      });

      setEditingCommentId(null);
      setFormCommentPrakerin({
        photo_profile: null,
        name: "",
        position: "",
        comment: "",
      });

      setImage(null);
      setIsModalOpen(false);
      await alertSuccess("Data berhasil ditambahkan!");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setFormError(responseError);
        }
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartner = async (partner: Partner) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menghapus mitra dengan ${partner.name}?`
    );

    if (!confirm) return;
    try {
      await API.delete(`${ENDPOINTS.PARTNERS}/${partner.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess("Mitra berhasil dihapus!");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };
  const handleUpdatePartner = async (partner: Partner) => {
    setEditingPartnerId(partner.id);
    setIsModalOpen(true);
    setAddLabel("Mitra");
    setFormPartner({
      logo: null,
      name: partner.name,
      address: partner.address,
      type: partner.type,
    });
    setImage(
      `${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${partner.logo}`
    );
  };

  const handleDeleteComment = async (comment: CommentPrakerin) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menghapus ulasan dari ${comment.name}?`
    );
    if (!confirm) return;
    try {
      await API.delete(`${ENDPOINTS.COMMENTPRAKERINS}/${comment.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await fetchData();
      await alertSuccess("Ulasan berhasil dihapus!");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };
  const handleUpdateComment = async (comment: CommentPrakerin) => {
    setEditingCommentId(comment.id);
    setIsModalOpen(true);
    setAddLabel("Ulasan");
    setFormCommentPrakerin({
      photo_profile: null,
      name: comment.name,
      position: comment.position,
      comment: comment.comment,
    });
    setImage(
      `${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${comment.photo_profile}`
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormPartner({
      logo: null,
      name: "",
      address: "",
      type: "",
    });
    setFormCommentPrakerin({
      photo_profile: null,
      name: "",
      position: "",
      comment: "",
    });
    setFormError({});
    setImage(null);
    setEditingPartnerId(null);
    setEditingCommentId(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="p-6 relative">
      <h1 className="text-accent-dark text-sm mb-5">Isi Halaman</h1>

      <div className="mb-8 p-4 rounded-lg">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <LayoutDashboard className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Isi Halaman</h2>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative bg-white rounded-2xl w-1/5">
          <input
            type="text"
            onChange={(e) => setInputSearch(e.target.value)}
            value={inputSearch}
            placeholder="Cari perusahaan..."
            className="text-gray-600 w-full px-4 py-3 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 rounded-2xl"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setAddLabel("Mitra");
              setIsModalOpen(true);
            }}
            className="text-white bg-accent rounded-xl p-3 px-5 flex items-center cursor-pointer hover:bg-accent-hover transition-colors shadow-md gap-2"
          >
            <CirclePlus className="w-5 h-5 " />
            <span>Tambah Mitra</span>
          </button>
          <button
            onClick={() => {
              setAddLabel("Ulasan");
              setIsModalOpen(true);
            }}
            className="text-white bg-accent rounded-xl p-3 px-5 flex items-center cursor-pointer hover:bg-accent-hover transition-colors shadow-md gap-2"
          >
            <CirclePlus className="w-5 h-5 " />
            <span>Tambah Ulasan</span>
          </button>
        </div>
      </div>

      <section id="mitra-sekolah" className="mt-10">
        <h2 className="text-2xl font-semibold text-accent mb-6 flex items-center gap-2">
          <span>Mitra Sekolah / Perguruan Tinggi</span>
          <div className="h-[2px] bg-accent/30 flex-1"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative min-h-[200px]">
          {partners.filter((p) => p.type === "school").length > 0 ? (
            partners
              .filter((p) => p.type === "school")
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 flex flex-col gap-3 group relative"
                >
                  {/* Tombol Aksi (Edit + Hapus) */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleUpdatePartner(item)}
                      className="p-2 rounded-full hover:bg-blue-50 text-blue-500 cursor-pointer"
                      title="Edit Mitra"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePartner(item)}
                      className="p-2 rounded-full hover:bg-red-50 text-red-500 cursor-pointer"
                      title="Hapus Mitra"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Logo Mitra */}
                  <div className="w-32 h-32 mx-auto relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                      alt={item.name}
                      fill
                      sizes="100%"
                      className="object-cover rounded-md border border-gray-100 shadow-sm"
                    />
                  </div>

                  {/* Detail Mitra */}
                  <div className="text-center mt-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">{item.address}</p>
                  </div>
                </div>
              ))
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <NotFoundComponent text="Tidak ada mitra sekolah yang ditemukan." />
            </div>
          )}
        </div>
      </section>

      <section id="mitra-perusahaan" className="mt-10">
        <h2 className="text-2xl font-semibold text-accent mb-6 flex items-center gap-2">
          <span>Mitra Dunia Usaha / Dunia Industri</span>
          <div className="h-[2px] bg-accent/30 flex-1"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative min-h-[200px]">
          {partners.filter((p) => p.type === "company").length > 0 ? (
            partners
              .filter((p) => p.type === "company")
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 flex flex-col gap-3 group relative"
                >
                  {/* Tombol Aksi (Edit + Hapus) */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleUpdatePartner(item)}
                      className="p-2 rounded-full hover:bg-blue-50 text-blue-500 cursor-pointer"
                      title="Edit Mitra"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePartner(item)}
                      className="p-2 rounded-full hover:bg-red-50 text-red-500 cursor-pointer"
                      title="Hapus Mitra"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Logo Mitra */}
                  <div className="w-32 h-32 mx-auto relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                      alt={item.name}
                      fill
                      sizes="100%"
                      className="object-cover rounded-md border border-gray-100 shadow-sm"
                    />
                  </div>

                  {/* Detail Mitra */}
                  <div className="text-center mt-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">{item.address}</p>
                  </div>
                </div>
              ))
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <NotFoundComponent text="Tidak ada mitra perusahaan yang ditemukan." />
            </div>
          )}
        </div>
      </section>

      <section id="ulasan" className="mt-16">
        <h2 className="text-2xl font-semibold text-accent mb-8 flex items-center gap-3">
          <span>Ulasan</span>
          <div className="h-[2px] bg-accent/30 flex-1"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative min-h-[260px]">
          {commentPrakerin.length > 0 ? (
            commentPrakerin.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center group relative border border-gray-100"
              >
                {/* Tombol Aksi (Edit + Hapus) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleUpdateComment(item)}
                    className="p-2 rounded-full hover:bg-blue-50 text-blue-500 cursor-pointer"
                    title="Edit Ulasan"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(item)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 cursor-pointer"
                    title="Hapus Ulasan"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Foto Profil */}
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border border-gray-100 mb-4 relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${item.photo_profile}`}
                    alt={item.name}
                    fill
                    sizes="100%"
                    className="object-cover"
                  />
                </div>

                {/* Detail Ulasan */}
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h3>
                <p className="text-sm text-accent font-medium mb-2">
                  {item.position}
                </p>
                <p className="text-gray-600 text-sm italic leading-relaxed">
                  "{item.comment}"
                </p>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <NotFoundComponent text="Tidak ada ulasan yang ditemukan." />
            </div>
          )}
        </div>
      </section>

      <section id="isi-halaman" className="mt-10">
        <h2 className="text-2xl font-semibold text-accent mb-6 flex items-center gap-2">
          <span>Isi Halaman</span>
          <div className="h-[2px] bg-accent/30 flex-1"></div>
        </h2>

        <div className="columns-1 lg:columns-2 gap-6 mt-4 ">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-4 mb-6 break-inside-avoid"
            >
              <label htmlFor={item.id} className="font-medium text-lg">
                {item.name}
              </label>

              <textarea
                id={item.id}
                value={
                  formData.find((form) => form.id === item.id)?.value ??
                  item.value
                }
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData((prev) => {
                    const exists = prev.find((f) => f.id === item.id);
                    if (exists) {
                      return prev.map((f) =>
                        f.id === item.id ? { ...f, value: newValue } : f
                      );
                    } else {
                      return [...prev, { ...item, value: newValue }];
                    }
                  });
                }}
                className="border p-3 rounded-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent
          w-full resize-y overflow-auto min-h-40 lg:min-h-32"
              />
            </div>
          ))}
        </div>
      </section>

      {/* MODAL - FIXED OVERFLOW */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-lg w-full max-w-md max-h-[90vh] flex flex-col my-8">
            {/* Header Modal - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold">
                {editingPartnerId || editingCommentId ? "Edit" : "Tambah"}{" "}
                {addLabel}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form
                className="flex flex-col gap-6"
                onSubmit={handleSubmit}
                id="modal-form"
              >
                {addLabel === "Mitra" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="logo-upload">Pilih Foto Mitra</label>
                      <div
                        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 relative cursor-pointer ${
                          formError.logo ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-lg"
                            width={300}
                            height={300}
                          />
                        ) : (
                          <>
                            <UploadCloud
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <span className="text-sm text-gray-500">
                              Unggah Foto
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          name="logo"
                          id="logo-upload"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {formError.logo && (
                        <p className="text-sm text-red-500">{formError.logo}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="partner-name">Nama</label>
                      <input
                        value={formPartner.name}
                        onChange={(e) =>
                          setFormPartner({
                            ...formPartner,
                            name: e.target.value,
                          })
                        }
                        id="partner-name"
                        type="text"
                        placeholder="Masukkan nama mitra"
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                          formError.name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formError.name && (
                        <p className="text-sm text-red-500">{formError.name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="partner-type">Tipe Mitra</label>
                      <select
                        value={formPartner.type}
                        onChange={(e) =>
                          setFormPartner({
                            ...formPartner,
                            type: e.target.value,
                          })
                        }
                        id="partner-type"
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                          formError.type ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Pilih tipe mitra</option>
                        <option value="company">Perusahaan</option>
                        <option value="school">Sekolah</option>
                      </select>
                      {formError.type && (
                        <p className="text-sm text-red-500">{formError.type}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="partner-address">Alamat</label>
                      <input
                        value={formPartner.address}
                        onChange={(e) =>
                          setFormPartner({
                            ...formPartner,
                            address: e.target.value,
                          })
                        }
                        id="partner-address"
                        type="text"
                        placeholder="Bandung, Jawa Barat"
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                          formError.address
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formError.address && (
                        <p className="text-sm text-red-500">
                          {formError.address}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {addLabel === "Ulasan" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="photo-profile">
                        Pilih Foto Pemberi Ulasan
                      </label>
                      <div
                        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 relative cursor-pointer ${
                          formError.photo_profile
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-lg"
                            width={300}
                            height={300}
                          />
                        ) : (
                          <>
                            <UploadCloud
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <span className="text-sm text-gray-500">
                              Unggah Foto
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          name="photo-profile"
                          id="photo-profile"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {formError.photo_profile && (
                        <p className="text-sm text-red-500">
                          {formError.photo_profile}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="comment-name">Nama</label>
                      <input
                        value={FormCommentPrakerin.name}
                        onChange={(e) =>
                          setFormCommentPrakerin({
                            ...FormCommentPrakerin,
                            name: e.target.value,
                          })
                        }
                        id="comment-name"
                        type="text"
                        placeholder="Masukkan nama pemberi ulasan"
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                          formError.name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formError.name && (
                        <p className="text-sm text-red-500">{formError.name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="comment-position">Posisi</label>
                      <input
                        value={FormCommentPrakerin.position}
                        onChange={(e) =>
                          setFormCommentPrakerin({
                            ...FormCommentPrakerin,
                            position: e.target.value,
                          })
                        }
                        id="comment-position"
                        type="text"
                        placeholder="Masukkan jurusan pemberi ulasan"
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                          formError.position
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formError.position && (
                        <p className="text-sm text-red-500">
                          {formError.position}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="comment-text">Ulasan</label>
                      <textarea
                        value={FormCommentPrakerin.comment}
                        onChange={(e) =>
                          setFormCommentPrakerin({
                            ...FormCommentPrakerin,
                            comment: e.target.value,
                          })
                        }
                        id="comment-text"
                        placeholder="Masukkan ulasan"
                        rows={4}
                        className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none ${
                          formError.comment
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formError.comment && (
                        <p className="text-sm text-red-500">
                          {formError.comment}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Footer Modal - Fixed */}
            <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="submit"
                form="modal-form"
                disabled={isSubmitting}
                className="bg-accent text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover"
              >
                {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="fixed bottom-8 right-8 bg-accent p-4 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-accent-hover transition-colors cursor-pointer"
      >
        <Save />
      </button>
    </main>
  );
};
export default PerusahaanPage;