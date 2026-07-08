# PRAKERIN DASHBOARD REDESIGN PLAN
## Dashboard Architecture & Role-Based Layouts

**Based On:** Admin Dashboard Example (contoh_dashboard.jpeg)
**Created:** June 30, 2026
**Status:** Planning Phase

---

## 📐 DASHBOARD LAYOUT STRUCTURE

### Common Layout Components (All Dashboards)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
│  [Logo] Search Bar ... [Notification] [User Profile]        │
└─────────────────────────────────────────────────────────────┘
┌──────────────────┬───────────────────────────────────────────┐
│  SIDEBAR         │  MAIN CONTENT AREA                        │
│  - Dashboard     │                                           │
│  - Menu Items    │  [KPI Cards]                              │
│  - Master Data   │                                           │
│  - Management    │  [Charts & Insights]                      │
│  - Settings      │                                           │
│  - Logout        │  [Recent Activity / Lists]                │
│                  │                                           │
└──────────────────┴───────────────────────────────────────────┘
```

### Sidebar Navigation Structure

**Consistent across all roles:**
- Active indicator (highlight current page)
- Collapsible sections (Master Data, Management, etc.)
- Icons + Labels
- Settings at bottom
- Logout button at bottom

---

## 🎓 SISWA STUDENT DASHBOARD

### Dashboard Components

**1. Header Section**
- Welcome message: "Halo, [Student Name]"
- Current date/time
- Search bar (search jobs, companies, internships)

**2. KPI Cards (4 cards in a row)**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Lamaran Aktif   │  Berhasil Dipanggil│  Tersimpan    │  Profil Kelengkapan│
│                  │                  │                  │                  │
│      12          │      3           │      8           │      85%         │
│  +2 dari minggu  │  +1 dari minggu  │  -1 dari minggu  │  -5% dari minggu │
│  ini             │  ini             │  ini             │  ini             │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

- **Lamaran Aktif** (Active Applications): Count of pending/in-progress applications
- **Berhasil Dipanggil** (Called for Interview): Count of interview invitations
- **Tersimpan** (Saved): Count of bookmarked jobs/internships
- **Profil Kelengkapan** (Profile Completion): Percentage (triggers notification to complete profile if < 100%)

**3. Insight Section: "Insights Hari Ini"**

Cards showing:
- Recent matches (jobs matching profile)
- Skill recommendations (what to improve)
- Upcoming interview dates
- New job postings matching profile

**4. Charts Section**

**Left Side: "Distribusi Lamaran"**
- Pie chart showing application distribution:
  - By status (pending, accepted, rejected, interview)
  - Color coded with percentages

**Right Side: "Top Skills Demand"**
- Bar chart showing most demanded skills in matched jobs
- Shows percentage/count per skill

**5. Recent Activity Section: "Aktivitas Terbaru"**
- Timeline of recent actions:
  - "Lamaran dikirim ke PT ABC" (5 minutes ago)
  - "Profil dilihat 3 kali" (1 hour ago)
  - "Job baru yang cocok ditemukan" (2 hours ago)
  - etc.

**6. Recommendations Section: "Rekomendasi Untukmu"**
- AI-powered suggestions:
  - Jobs matching profile
  - Companies to follow
  - Skills to develop

### Sidebar Navigation

```
Dashboard (Home)
├── LAMARAN & APLIKASI
│   ├── Lamaran Saya (My Applications)
│   ├── Undangan Wawancara (Interview Invitations)
│   └── Riwayat Lamaran (Application History)
├── EKSPLORASI
│   ├── Cari Pekerjaan (Search Jobs)
│   ├── Cari Magang (Search Internships)
│   ├── Tersimpan (Saved)
│   └── Daftar Perusahaan (Company List)
├── PROFIL & CV
│   ├── Profil Saya (My Profile)
│   ├── CV Saya (My CV)
│   ├── Portfolio
│   └── Media Sosial (Social Links)
├── PEMBELAJARAN
│   ├── Skill Assessment
│   ├── Rekomendasi Skill
│   └── Resource (Learning Materials)
├── PENGATURAN
│   ├── Akun (Account Settings)
│   ├── Notifikasi (Notifications)
│   ├── Privacy
│   └── Preferensi (Preferences)
└── LAINNYA
    ├── Bantuan (Help)
    ├── Aktivitas (Activity Logs)
    └── Keluar (Logout)
```

### Data Source / API Endpoints

```
GET /api/siswa/{id}/dashboard
- activeApplicationsCount
- interviewInvitationsCount
- savedJobsCount
- profileCompletion

GET /api/siswa/{id}/applications?status=pending
- Return list of applications with status

GET /api/siswa/{id}/insights
- recentMatches
- skillRecommendations
- upcomingInterviews
- newJobPostings

GET /api/siswa/{id}/activity-logs
- Return recent activity timeline

GET /api/statistics/skill-demand
- mostDemandedSkills (for bar chart)

GET /api/siswa/{id}/recommendations
- aiPoweredJobMatches
- companySuggestions
```

---

## 🎓 MAHASISWA STUDENT DASHBOARD

### Similar to Siswa but with differences:

**KPI Cards:**
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Lamaran Aktif   │  Berhasil Dipanggil│  Tersimpan    │  Profil Kelengkapan│
│      8           │      2           │      5           │      90%         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Different sidebar items:**
- Semester instead of "Class"
- GPA/Academic performance section
- Internship schedule (related to academic calendar)
- Thesis/Research projects

**Mahasiswa-specific sections:**
- "Magang yang Sesuai Semester" (Internship matching semester)
- "Laporan Akademik" (Academic performance)
- "Timeline Magang" (Internship timeline aligned with study)

---

## 🏫 SCHOOL ADMIN (SEKOLAH) DASHBOARD

### Dashboard Components

**1. KPI Cards (4 cards)**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Total Siswa     │  Siswa Aktif     │  MOU Aktif       │  Tingkat Penempatan│
│                  │  Magang          │                  │  (Placement Rate) │
│      250         │      45          │      8           │      72%         │
│  +12 bulan ini   │  +5 bulan ini    │  +1 bulan ini    │  +8% bulan ini   │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**2. Insight Section: "Insights Penempatan"**
- Students ready for internship
- Companies with open positions
- Matching statistics
- Success stories

**3. Charts**

**Left: "Distribusi Siswa Magang"**
- Pie chart showing students by:
  - Status (active, completed, dropped)
  - By company sector

**Right: "Perusahaan Partner"**
- Bar chart showing number of students placed in each company

**4. MOU Management Section: "MOU Aktif"**
- List of active MOUs with:
  - Company name
  - Expiry date
  - Number of students placed
  - Status (active/inactive/expired)

**5. Recent Activity**
- "Siswa baru mendaftar" (New student registration)
- "MOU baru ditandatangani" (New MOU signed)
- "Siswa menyelesaikan magang" (Student completed internship)

**6. Performance Analytics**
- Success rate by sector
- Company ratings from students
- Average internship duration

### Sidebar Navigation

```
Dashboard (Home)
├── SISWA
│   ├── Data Siswa (Student List)
│   ├── Siswa Aktif Magang (Active Interns)
│   ├── Laporan Siswa (Student Reports)
│   └── Verifikasi Siswa (Student Verification)
├── MOU & KERJASAMA
│   ├── MOU Saya (My MOUs)
│   ├── Tambah MOU (Add MOU)
│   ├── Laporan Kerjasama (Cooperation Reports)
│   └── Perusahaan Partner (Partner Companies)
├── MAGANG
│   ├── Program Magang (Internship Programs)
│   ├── Penempatan Siswa (Student Placement)
│   ├── Monitoring Magang (Internship Monitoring)
│   └── Laporan Magang (Internship Reports)
├── ANALITIK
│   ├── Statistik (Statistics)
│   ├── Rating Perusahaan (Company Ratings)
│   └── Tren Penempatan (Placement Trends)
├── PENGATURAN
│   ├── Profil Sekolah (School Profile)
│   ├── Data Sekolah (School Data)
│   ├── Notifikasi (Notifications)
│   └── Akun (Account)
└── LAINNYA
    ├── Bantuan (Help)
    ├── Aktivitas (Activity Logs)
    └── Keluar (Logout)
```

### Data Source / API Endpoints

```
GET /api/sekolah/{id}/dashboard
- totalStudents
- activeInterns
- activeMous
- placementRate

GET /api/sekolah/{id}/students
- List all students with status

GET /api/sekolah/{id}/mous
- List all MOUs with details

GET /api/sekolah/{id}/internships
- List all internship placements

GET /api/sekolah/{id}/statistics
- Distribution data
- Performance metrics

GET /api/sekolah/{id}/activity-logs
```

---

## 🏢 UNIVERSITY ADMIN (PTN) DASHBOARD

### Very similar to Sekolah but:

**KPI Cards:**
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Total Mahasiswa │  Mahasiswa Aktif │  MOU Aktif       │  Tingkat Penempatan│
│                  │  Magang          │                  │                  │
│      1,250       │      320         │      15          │      68%         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Mahasiswa-specific items:**
- Semester distribution (which semester students are in)
- Academic program alignment (which programs have internship)
- Faculty-based statistics
- Graduation timing

**Sidebar:**
- Same structure but with:
  - Program/Faculty management
  - Semester-based filtering
  - Academic calendar integration

---

## 🏪 COMPANY OWNER/ADMIN DASHBOARD

### Dashboard Components

**1. KPI Cards (4 cards)**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Posisi Terbuka  │  Lamaran Masuk   │  Sedang Interview│  Tertarik Total  │
│                  │                  │                  │  (Bookmarked)    │
│      12          │      48          │      8           │      156         │
│  +3 minggu ini   │  +15 minggu ini  │  +2 minggu ini   │  +28 minggu ini  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**2. Insight Section: "Insights Rekrutmen"**
- Top applied positions
- Candidate quality metrics
- Time to hire analytics
- Budget utilization

**3. Charts**

**Left: "Aplikasi per Posisi"**
- Bar chart showing applications per open position

**Right: "Status Rekrutmen"**
- Pie chart showing applicants by status:
  - Applied
  - Interview
  - Offered
  - Rejected

**4. Job Openings Management**
- List of open positions with:
  - Number of applications
  - Days posted
  - Status (open/closed/filled)
  - Quick actions (view applications, close posting, etc.)

**5. Recent Applications**
- Latest applicants with:
  - Name & profile
  - Position applied
  - Time applied
  - Quick action buttons (review, schedule interview, etc.)

**6. Candidate Pipeline**
- Funnel chart showing:
  - Total applicants
  - Screening passed
  - Interview stage
  - Offer stage

### Sidebar Navigation

```
Dashboard (Home)
├── REKRUTMEN
│   ├── Posisi Terbuka (Open Positions)
│   ├── Buat Posisi Baru (Create Job Opening)
│   ├── Kelola Posisi (Manage Positions)
│   └── Laporan Rekrutmen (Recruitment Reports)
├── APLIKASI
│   ├── Semua Aplikasi (All Applications)
│   ├── Aplikasi Baru (New Applications)
│   ├── Wawancara (Interviews)
│   ├── Penawaran (Offers)
│   └── Ditolak (Rejected)
├── KANDIDAT
│   ├── Database Kandidat (Candidate Database)
│   ├── Favorit (Favorites)
│   ├── Rating Kandidat (Candidate Ratings)
│   └── Riwayat Kerjasama (Past Candidates)
├── ANALITIK
│   ├── Pipeline Perekrutan (Recruitment Pipeline)
│   ├── Metrik Perekrutan (Recruitment Metrics)
│   ├── Analisis Kinerja (Performance Analysis)
│   └── Laporan Budget (Budget Report)
├── PENGATURAN
│   ├── Profil Perusahaan (Company Profile)
│   ├── Manajemen Tim (Team Management)
│   ├── Notifikasi (Notifications)
│   ├── Template Email (Email Templates)
│   └── Integrasi (Integrations)
└── LAINNYA
    ├── Bantuan (Help)
    ├── Aktivitas (Activity Logs)
    └── Keluar (Logout)
```

### Data Source / API Endpoints

```
GET /api/company/{id}/dashboard
- openPositions
- incomingApplications
- interviewingCandidates
- totalSaved

GET /api/company/{id}/job-openings
- List all jobs with application counts

GET /api/company/{id}/applications
- List applications with status

GET /api/company/{id}/analytics
- Pipeline data
- Metrics

GET /api/company/{id}/activity-logs
```

---

## 👨‍💼 SUPER ADMIN DASHBOARD

### Dashboard Components (Like the example provided)

**1. KPI Cards (5 cards)**

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Registrasi   │ Pengguna     │ Total Lowongan│ Status       │ Tingkat      │
│ Baru (24h)   │ Aktif        │              │ Verifikasi   │ Keberhasilan │
│              │              │              │              │              │
│    156       │   1,024      │    320       │    86%       │    72%       │
│ +12% bulan   │ +8% bulan    │ +6% bulan    │ +5% bulan    │ Stabil       │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**2. Insight Section: "I Insight Hari Ini"**

Multiple insight cards:
- **Prediksi Siswa Bermasalah** (At-risk students prediction)
  - 18 siswa Sedang (Medium risk)
  
- **Rekomendasi Perusahaan Cocok** (Recommended companies)
  - 42 matches waiting for profile update
  
- **Estimasi Keberhasilan Penempatan** (Placement success estimation)
  - 86% predicted success rate

**3. Charts Section**

**Left: "Distribusi Pengguna"**
- Donut/Pie chart showing user distribution:
  - Siswa/Mahasiswa: 72% (737 users)
  - Perusahaan: 20% (204 users)
  - Sekolah: 7% (83 users)
  - Others: 1% (10 users)

**Right: "Distribusi Regional"**
- Bar chart showing user distribution by region:
  - Jawa Barat: 112
  - Sumatera Barat: 88
  - Banten: 56
  - Bangka Belitung: 32
  - Bengkulu: 20

**4. Recent Activity Section: "Aktivitas Terbaru"**
- Timeline of platform-wide events:
  - New user registrations
  - New job postings
  - Completed internships
  - New MOUs

**5. Status Section: "Status Penempatan"**
- Pie chart showing placement status distribution:
  - Meninggal (Waiting/Pending): 46 (14%)
  - Proses (In Progress): 96 (30%)
  - Berhasil (Successful): 128 (40%)
  - Selesai (Completed): 46 (14%)
  - Dibatalkan (Cancelled): 4 (1%)

**6. AI Recommendations: "AI Matching Score"**
- Skills with matching scores:
  - Teknik Komputer: 92%
  - RPL: 88%
  - TKJ: 84%
  - Multimedia: 79%

**7. Additional Insights**
- Company recommendations
- System performance
- Data updates
- Priority alerts

### Sidebar Navigation

```
Dashboard (Home)
├── MASTER DATA
│   ├── Provinsi (Provinces)
│   ├── Kota/Kabupaten (Cities/Regencies)
│   ├── Sektor Perusahaan (Business Sectors)
│   ├── Durasi Magang (Internship Durations)
│   ├── Jurusan Siswa (Student Majors)
│   ├── Bidang Magang (Internship Fields)
│   └── Manage Master Data (Settings)
├── MANAJEMEN PENGGUNA
│   ├── Isi Halaman (Homepage Management)
│   ├── User (All Users)
│   ├── Verifikasi Akun (Account Verification)
│   ├── Laporan Pengguna (User Reports)
│   └── Suspended Users
├── PENGELOLAAN
│   ├── Sekolah (High Schools)
│   ├── Universitas (Universities)
│   ├── Perusahaan (Companies)
│   ├── Program Magang (Internship Programs)
│   ├── MOA/MOU (Agreements)
│   └── Partners
├── ANALITIK & LAPORAN
│   ├── Dashboard Analytics
│   ├── User Statistics
│   ├── Placement Statistics
│   ├── Company Performance
│   ├── System Health
│   └── Export Reports
├── SISTEM
│   ├── Aktivitas Sistem (System Logs)
│   ├── Error Logs
│   ├── API Performance
│   ├── Database Status
│   └── Backup & Recovery
├── PENGATURAN
│   ├── Konfigurasi Sistem (System Settings)
│   ├── Email Configuration
│   ├── Notifikasi (Notification Settings)
│   ├── Security Settings
│   └── API Keys
└── LAINNYA
    ├── Bantuan (Help)
    ├── Audit Logs (Complete Activity Logs)
    └── Keluar (Logout)
```

### Data Source / API Endpoints

```
GET /api/admin/dashboard
- newRegistrations
- activeUsers
- totalOpenings
- verificationStatus
- placementRate

GET /api/admin/statistics
- userDistribution (pie chart data)
- regionalDistribution (bar chart data)
- placementStatus (pie chart data)
- aiMatchingScores

GET /api/admin/insights
- At-risk students
- Recommended companies
- Placement predictions

GET /api/admin/activity-logs
- All platform activities

GET /api/admin/users
- List all users with filters

GET /api/admin/analytics/trends
- Historical data for charts
```

---

## 🎨 SHARED UI COMPONENTS ACROSS ALL DASHBOARDS

### 1. KPI Card Component

```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend: number; // +/-
  trendLabel: string;
  icon: ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

// Usage:
<KPICard
  title="Lamaran Aktif"
  value={12}
  trend={+2}
  trendLabel="dari minggu ini"
  icon={<ApplicationIcon />}
  color="primary"
/>
```

### 2. Chart Components

**Bar Chart Component**
- Using: Recharts or Chart.js
- Props: data, title, showLegend, colors

**Pie/Donut Chart Component**
- Using: Recharts
- Props: data, title, showLegend, colors

**Line Chart Component** (for trends over time)
- Props: data, title, xAxis, yAxis

### 3. Activity List Component

```typescript
interface ActivityItem {
  id: string;
  icon: ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  action?: ReactNode; // Optional action button
}

// Timeline list showing recent activities
```

### 4. Insight Card Component

```typescript
interface InsightCardProps {
  icon: ReactNode;
  title: string;
  metric: number | string;
  description: string;
  status: 'positive' | 'negative' | 'neutral';
  actionLabel?: string;
  onAction?: () => void;
}
```

### 5. Navigation Components

**Sidebar Component**
- Collapsible sections
- Active state indicator
- Icon + Label
- Mobile responsive

**Top Navigation**
- Search bar
- Notifications
- User profile dropdown

---

## 📱 RESPONSIVE DESIGN STRATEGY

### Desktop (> 1024px)
- Full sidebar visible
- 2-column or 3-column grid for KPI cards
- Full charts side by side
- All data visible

### Tablet (768px - 1024px)
- Sidebar collapsible/hamburger menu
- 2-column grid for KPI cards
- Charts stacked vertically
- Scroll horizontally for tables

### Mobile (< 768px)
- Sidebar hidden (hamburger menu)
- 1-column grid for KPI cards
- Charts full width
- Bottom navigation for quick access
- Tables with horizontal scroll

---

## 🎨 COLOR & DESIGN CONSISTENCY

### Based on Example Dashboard:

**Primary Color:** Teal/Cyan (#00A8A8 or similar)
- Used for: Primary buttons, active states, highlights

**Secondary Colors:**
- Blue (#3B82F6): Charts, primary data
- Orange (#F59E0B): Warnings, trends
- Green (#10B981): Success, positive trends
- Red/Pink (#EF4444): Danger, alerts
- Purple (#8B5CF6): AI/Intelligence features

**Neutral Colors:**
- Light Gray (#F3F4F6): Backgrounds
- Medium Gray (#D1D5DB): Borders
- Dark Gray (#374151): Text

**Typography:**
- Headings: Bold, larger sizes
- Labels: Medium weight
- Body: Regular weight
- Secondary text: Light weight, lighter color

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1 (Week 1-2): Core Structure
- [ ] Layout components (Sidebar, Header, Main content area)
- [ ] KPI card component
- [ ] Activity list component
- [ ] Navigation structure

### Phase 2 (Week 3-4): Siswa/Mahasiswa Dashboards
- [ ] Siswa dashboard
- [ ] Mahasiswa dashboard
- [ ] Chart components
- [ ] API integration

### Phase 3 (Week 5-6): School/Company Dashboards
- [ ] Sekolah dashboard
- [ ] PTN dashboard
- [ ] Company dashboard
- [ ] Data display components

### Phase 4 (Week 7-8): Admin Dashboard
- [ ] Super admin dashboard
- [ ] All charts & insights
- [ ] Complex data visualization
- [ ] Analytics integration

### Phase 5 (Week 9): Polish & Responsive
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization

---

## 🔄 DATA REFRESH STRATEGY

### Real-Time vs Cached Data

**Real-Time (Update every 5 seconds):**
- KPI cards (counts may change frequently)
- Notifications badge
- Activity logs

**Cached (Update every 1-5 minutes):**
- Charts (aggregate data)
- Statistics
- Analytics

**On-Demand:**
- Lists (paginated, load more)
- User interactions

### API Polling Strategy

```typescript
// For KPI data - refresh every 5 seconds
const { data: kpis } = useSWR('/api/dashboard/kpis', fetcher, {
  refreshInterval: 5000,
  revalidateOnFocus: true,
});

// For charts - refresh every 5 minutes
const { data: charts } = useSWR('/api/dashboard/charts', fetcher, {
  refreshInterval: 300000,
  revalidateOnFocus: false,
});

// For lists - fetch on demand
const { data: activities } = useSWR('/api/activity-logs', fetcher, {
  revalidateOnFocus: false,
});
```

---

## ✅ DASHBOARD CHECKLIST

Before launching each dashboard:

- [ ] All KPI cards pulling correct data
- [ ] Charts rendering properly with sample data
- [ ] Navigation working and highlighting current page
- [ ] Responsive design tested on mobile/tablet
- [ ] Loading states showing while fetching data
- [ ] Error states handled gracefully
- [ ] Empty states displayed when no data
- [ ] Real-time updates working
- [ ] Performance optimized (no unnecessary re-renders)
- [ ] Accessibility standards met (WCAG)
- [ ] Mobile menu working
- [ ] Logout functionality working
- [ ] User data fresh after login
- [ ] Settings accessible from dashboard

---

## 📚 COMPONENT FILE STRUCTURE

```
src/components/dashboard/
├── common/
│   ├── KPICard.tsx
│   ├── ActivityList.tsx
│   ├── InsightCard.tsx
│   ├── Sidebar.tsx
│   ├── TopNav.tsx
│   ├── DashboardLayout.tsx
│   └── LoadingState.tsx
├── charts/
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   ├── LineChart.tsx
│   └── ChartContainer.tsx
├── student/
│   ├── SiswaApplicationCard.tsx
│   ├── SiswaInsights.tsx
│   └── SiswaRecommendations.tsx
├── school/
│   ├── SchoolStudentsList.tsx
│   ├── MOUManagement.tsx
│   └── PlacementStats.tsx
├── company/
│   ├── JobOpeningCard.tsx
│   ├── ApplicationsList.tsx
│   └── PipelineView.tsx
└── admin/
    ├── UserStatistics.tsx
    ├── SystemMetrics.tsx
    ├── AdminInsights.tsx
    └── AuditLogs.tsx
```

---

## 🚀 NEXT STEPS

1. **Finalize dashboard specifications** based on stakeholder feedback
2. **Create design mockups** in Figma (if not already done)
3. **Start building components** in order of priority
4. **Integrate API endpoints** as backend is developed
5. **Test with real data** from database
6. **Iterate based on feedback**

---

**Reference:** Example dashboard (contoh_dashboard.jpeg) shows admin dashboard with:
- KPI cards with trends
- Insight cards with AI-powered data
- Pie and bar charts
- Recent activity timeline
- AI Matching Score visualization
- Recommendations section
