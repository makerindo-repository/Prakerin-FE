# Revisi Plan - Prakerin Project

**Last Updated:** 9 Juli 2026  
**Project:** Prakerin (Internship Management System)  
**Status:** In Progress

---

## Overview

Bugfix dan improvement plan untuk aplikasi Prakerin berdasarkan feedback dari pengelola project. Plan ini mencakup 5 item utama yang perlu diperbaiki.

---

## Bugfix List

### 1. Hide Expired Job Postings ⏰
**Priority:** HIGH  
**Status:** Pending  
**Assigned to:** [Web Developer BE]

**Problem:**
- Job postings dengan tanggal berakhir (Berakhir) yang sudah lewat masih tampil di list
- User bisa melihat lowongan magang yang sudah expired

**Solution:**
- Tambahkan validation logic untuk cek tanggal posting
- Jika tanggal posting sudah lewat dari hari ini, jangan tampilkan di listing
- Filter bisa dilakukan di backend (saat query) atau frontend (saat render)

**Technical Details:**
- Check `Berakhir` date field
- Compare dengan current date
- Hide from UI jika date sudah obsolete

**Expected Result:**
- Hanya posting dengan tanggal berakhir yang masih aktif yang tampil
- User tidak lihat posting lama yang sudah expired

---

### 2. Fix Broken Logo in Detail View 🖼️
**Priority:** HIGH  
**Status:** Pending  
**Assigned to:** [Web Developer BE]

**Problem:**
- Logo di detail page job posting masih broken/not loading
- Logo tidak tampil dengan benar di detail view

**Solution:**
- Check image path dan URL di backend
- Verify image hosting/storage sudah benar
- Ensure logo rendernya proper di frontend

**Technical Details:**
- Inspect logo image source
- Check file path/URL in database
- Verify CORS/hosting issues if any
- Test image loading di detail component

**Expected Result:**
- Logo tampil dengan benar di detail page
- Tidak ada broken image placeholder

---

### 3. Add "Apply for Internship" Button 🎯
**Priority:** HIGH  
**Status:** Pending  
**Assigned to:** [Web Developer BE]

**Problem:**
- Tidak ada button untuk user apply/submit application di job detail page
- User bisa lihat detail tapi tidak bisa langsung apply

**Solution:**
- Tambahkan button "Lamar Magang" atau sejenisnya di detail page
- Button bisa lead ke application form atau trigger modal
- Link/connect ke application submission system

**Technical Details:**
- Add button component di detail page
- Create route/handler untuk application submission
- Validate user sebelum allow apply
- Store application data properly

**Expected Result:**
- User bisa klik "Lamar Magang" button di detail page
- Aplikasi tersimpan di database
- User dapat konfirmasi aplikasinya berhasil dikirim

---

### 4. Fix Incorrect Section Label (Feedback → Success Story) 📝
**Priority:** MEDIUM  
**Status:** Pending  
**Assigned to:** [Web Developer BE]

**Problem:**
- Section "Feedback Siswa/Mahasiswa" seharusnya berjudul "Success Story"
- Label saat ini tidak sesuai dengan konten

**Solution:**
- Ubah text label dari "Feedback Siswa/Mahasiswa" menjadi "Success Story" atau "Cerita Sukses"
- Update di semua tempat label tersebut muncul

**Technical Details:**
- Find dan replace label text
- Check di component carousel/section yang menampilkan feedback
- Update juga di backend jika ada

**Expected Result:**
- Section dengan testimonial/success stories sudah properly labeled
- Tidak ada confusion antara feedback dan success story

---

### 5. Complete Job Description Content 📋
**Priority:** MEDIUM  
**Status:** Pending  
**Assigned to:** [Web Developer BE]

**Problem:**
- Isi job description di detail page masih belum lengkap/sempurna
- Content data belum complete

**Solution:**
- Review dan lengkapi semua job description data
- Pastikan semua field terisi dengan informasi yang benar dan lengkap
- Update di database jika perlu

**Technical Details:**
- Audit existing job descriptions
- Fill missing information
- Validate data completeness
- Update database records

**Expected Result:**
- Semua job posting punya deskripsi yang lengkap dan informatif
- User dapat informasi yang cukup untuk decide apply atau tidak

---

## Implementation Timeline

| Phase | Items | Duration | Status |
|-------|-------|----------|--------|
| Phase 1 | Bug #1, #2, #3 | ~3-5 days | Pending |
| Phase 2 | Bug #4, #5 | ~2-3 days | Pending |
| Testing | QA & Validation | ~2 days | Pending |

---

## Testing Checklist

- [ ] Expired postings tidak tampil di listing
- [ ] Logo loading correctly di detail page
- [ ] "Lamar Magang" button visible & functional di detail page
- [ ] Section label updated ke "Success Story"
- [ ] All job descriptions complete dan readable
- [ ] No broken links atau missing data
- [ ] Responsive design maintained

---

## Notes

- Coordinate dengan tim design & marketing jika ada UI/UX changes
- Test di berbagai browser & devices
- Update documentation setelah fixes selesai
- Inform pengguna jika ada changes ke UI/UX

---

## Revision History

| Date | Updated By | Changes |
|------|-----------|---------|
| 9 Jul 2026 | [Your Name] | Initial planning from boss feedback |

