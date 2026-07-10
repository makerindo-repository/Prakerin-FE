# Laporan Perbaikan Bug (Bug Fix Report) - Phase 1

Berikut adalah daftar perbaikan yang telah diselesaikan untuk buggy features (Phase 1: Quick Wins):

## 1. Siswa & Mahasiswa CRUD
### Backend
- **Rebuild MySQL Migration untuk SQLite Compatibility**: Modifikasi file migration status enum MOU agar kompatibel dengan database SQLite (`:memory:`) sehingga test suite dapat dijalankan dengan lancar.
- **Penyelesaian update() StudentController**: Melengkapi logika penyimpanan ke database pada method `update` di StudentController.
- **Penghapusan Double Hashing Password**: Menghapus `Hash::make` manual pada `StudentController@store` karena model `User` sudah meng-cast password secara otomatis (`'password' => 'hashed'`).
- **Peralihan Tipe Parameter ID**: Mengubah tanda tipe parameter `$id` dari `int` ke `string` di method `update()` dan `destroy()` pada `StudentController` karena model Student menggunakan UUID.
- **Koreksi Penulisan tokenCan**: Mengoreksi spelling dari `school:access` ke `school-access` pada StudentController method `show`.
- **Eager Loading Major**: Menambahkan eager loading `student.major` pada User controller list endpoint untuk menghilangkan N+1 query.
- **Pembersihan User Orfan**: Mengubah method `destroy()` agar menghapus record `User` terkait ketika record `Student` dihapus.

### Frontend
- **Kolom Aksi di Tabel Siswa**: Menambahkan kolom baru "Aksi" pada tabel daftar siswa baik pada tampilan desktop (table) maupun mobile (cards).
- **Tombol Hapus dengan Konfirmasi**: Menambahkan tombol hapus (ikon Trash) yang memicu modal konfirmasi `alertConfirm` sebelum mengirim request `DELETE /api/v1/students/{studentId}`.
- **Tombol & Halaman Edit Siswa**: Menambahkan tombol edit (ikon Pencil) yang mengarah ke halaman edit siswa.
- **Halaman Form Edit Siswa**: Membuat halaman baru `/dashboard/school/daftarsiswa/[id]/edit/page.tsx` yang memuat data siswa saat ini dan menyimpannya menggunakan method `PATCH` via _method payload.
- **Penambahan Kolom Profil Lengkap**: Menambahkan kolom input `Kelas` (select), `Jurusan` (select), `Jenis Kelamin` (radio), `Tanggal Lahir` (date), `Nomor Telepon` (input), dan `Alamat` (textarea) pada form Tambah Siswa dan Edit Siswa.

## 2. User Management
### Backend
- **Koreksi Target Role Validation**: Mengubah validasi profil di `UserUpdateProfileRequest` agar menggunakan role milik *target user* yang diupdate (`$userId` dari parameter url), bukan user yang sedang login (`$this->user()`), sehingga field profile tidak ter-strip (kosong) saat super admin atau sekolah mengubah profile user lain.

### Frontend
- **Tombol & Modal Tambah Pengguna Baru**: Menambahkan tombol "Tambah Pengguna" di halaman master-data user management yang membuka modal form pendaftaran pengguna dengan validasi dan kondisional field dinamis berdasarkan role yang dipilih (siswa, sekolah, atau perusahaan).
- **Koreksi Label Sukses Toast**: Mengubah toast alert sukses (`handleDelete` & `handleAccept`) agar menampilkan role asli user secara dinamis (seperti Siswa, Sekolah, atau Perusahaan) alih-alih hardcoded "Perusahaan".
