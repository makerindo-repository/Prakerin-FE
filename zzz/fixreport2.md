# Laporan Implementasi Fitur (Feature Implementation Report) - Hubungi Kami (Contact Form)

Berikut adalah daftar pekerjaan yang telah diselesai untuk implementasi fitur "Hubungi Kami":

## 1. Database & Migrasi
- **Tabel contact_messages**: Membuat tabel `contact_messages` dengan kolom UUID primary key (`id`), nama pengirim (`name`), email pengirim (`email`), kategori (`category` - enum: general, bug, feedback), subjek (`subject`), isi pesan (`message`), status (`status` - enum: new, read, replied), dan `user_id` (nullable, untuk relasi pengguna login).
- **Tabel contact_replies**: Membuat tabel `contact_replies` dengan kolom UUID primary key, relasi ke `contact_messages.id` (cascade), relasi ke `users.id` (replied_by_id, cascade), dan isi balasan (`reply_message`).
- **Eksekusi Migrasi**: Melakukan migrasi database untuk membuat kedua tabel tersebut di lingkungan backend.

## 2. Models & Validasi Request
- **ContactMessage Model**: Implementasi model Eloquent dengan UUID generator otomatis pada event `creating`, relasi `replies()` (HasMany), `user()` (BelongsTo), serta helper methods `markAsRead()` dan `markAsReplied()`.
- **ContactReply Model**: Implementasi model Eloquent dengan UUID generator otomatis dan relasi `contactMessage()` serta `repliedBy()`.
- **StoreContactMessageRequest & StoreContactReplyRequest**: Membuat request class validator Laravel untuk menolak input kosong atau tidak valid (menjamin email terformat dengan benar, isi pesan min 10 karakter untuk pesan baru, dan min 5 karakter untuk balasan).

## 3. Notifikasi Email (Mailables)
- **ContactFormSubmitted**: Mailable untuk mengirim email pemberitahuan ke admin ketika ada pesan baru masuk. Menggunakan template HTML yang memuat kategori, detail pengirim, dan link langsung ke dashboard admin.
- **ContactReplyNotification**: Mailable untuk memberitahu pengirim asli tentang tanggapan dari tim admin, lengkap dengan kutipan balasan dan link langsung untuk melihat detail.
- **Try-Catch Email Safety**: Seluruh pengiriman email dibungkus dalam blok try-catch agar kegagalan koneksi SMTP tidak menggagalkan proses penyimpanan data ke database.

## 4. API Controller & Routing
- **ContactController**:
  1. `POST /api/v1/contacts` (Public): Menerima pesan baru, otomatis mengaitkan `user_id` jika login, dan memicu email admin.
  2. `GET /api/v1/contacts` (Admin Only): Mengambil seluruh daftar pesan dengan pagination 20 baris, terurut dari yang terbaru, dan mendukung filter kategori, status, dan pencarian kata kunci.
  3. `GET /api/v1/contacts/{id}` (Admin Only): Menampilkan detail pesan dan riwayat balasan secara kronologis, sekaligus mengubah status menjadi `read`.
  4. `POST /api/v1/contacts/{id}/reply` (Admin Only): Menyimpan balasan dari staff admin yang sedang login, mengubah status pesan menjadi `replied`, dan memicu notifikasi email ke pengguna.
  5. `GET /api/v1/contacts/user/{email}` (Public): Mengembalikan seluruh daftar pesan dan riwayat balasan berdasarkan alamat email pengguna.
- **Route Registration**: Menambahkan routing API yang aman dan terstruktur di `routes/api.php` di bawah prefix `contacts` dengan proteksi middleware `auth:sanctum` dan `abilities:admin-access`.

## 5. Halaman Antarmuka (Frontend TSX)
- **Halaman Form Publik (`/hubungi-kami/page.tsx`)**:
  - Menyediakan tab "Kirim Pesan" dengan form input nama, email (terisi otomatis jika login), kategori, subjek, dan textarea pesan.
  - Menyediakan tab "Cek Balasan" di mana pengguna (baik tamu maupun yang sudah masuk) dapat mencari riwayat pesan mereka berdasarkan email, serta membaca thread percakapan dan balasan dari admin.
- **Halaman Dashboard Admin (`/dashboard/contact-messages/page.tsx`)**:
  - Halaman tabel data list yang menampilkan nama, subjek, kategori badge berwarna, status badge berwarna, tanggal, dan tombol lihat detail.
  - Terintegrasi dengan fitur pencarian real-time (debounced search), filter status & kategori dropdown, serta pagination component.
- **Halaman Detail Dashboard Admin (`/dashboard/contact-messages/[id]/page.tsx`)**:
  - Menampilkan isi pesan lengkap pengirim dan riwayat balasan admin sebelumnya secara urut.
  - Menyediakan form textarea balasan dinamis untuk mengirim respon tambahan ke pengguna.
