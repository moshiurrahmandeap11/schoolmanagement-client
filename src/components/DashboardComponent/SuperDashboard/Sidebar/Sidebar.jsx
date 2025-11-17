import {
  LucideUserPlus2,
  LucideUsers2,
  LucideUserSquare2,
  Notebook,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";
import { BsCoin, BsPatchCheckFill } from "react-icons/bs";
import { CgChevronDown, CgClose, CgFormatBold } from "react-icons/cg";
import {
  FaBell,
  FaBookOpen,
  FaBullhorn,
  FaCalendarAlt,
  FaCalendarDay,
  FaChalkboardTeacher,
  FaCog,
  FaEnvelope,
  FaFileAlt,
  FaHistory,
  FaHome,
  FaImages,
  FaInfoCircle,
  FaLaptop,
  FaLink,
  FaPhone,
  FaPhotoVideo,
  FaQuoteRight,
  FaRegCalendarAlt,
  FaRegIdCard,
  FaSchool,
  FaShieldAlt,
  FaSms,
  FaUserFriends,
  FaUserGraduate,
  FaUserTie,
  FaVideo,
  FaWpforms,
} from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";
import {
  GiGraduateCap,
  GiGroupedDrops,
  GiPathDistance,
  GiTeamIdea,
  GiUpgrade,
} from "react-icons/gi";
import { GoReport } from "react-icons/go";
import { HiOutlineIdentification } from "react-icons/hi";
import { ImInfo } from "react-icons/im";
import {
  LuBookOpenCheck,
  LuClipboardList,
  LuFile,
  LuFileBadge,
  LuFileOutput,
  LuFileStack,
  LuMenu,
  LuTable,
  LuUser,
  LuUserCog,
} from "react-icons/lu";
import {
  MdAddCard,
  MdClass,
  MdHomeWork,
  MdManageHistory,
  MdOutlineAccessTime,
  MdOutlineAssignment,
  MdOutlineAssignmentTurnedIn,
  MdOutlineCategory,
  MdOutlineClass,
  MdOutlineDomain,
  MdOutlineEventBusy,
  MdOutlinePayments,
  MdOutlinePrint,
  MdReport,
  MdRoom,
} from "react-icons/md";
import {
  PiBehanceLogoBold,
  PiBuildingsBold,
  PiCertificateBold,
  PiChalkboardTeacherBold,
  PiChalkboardTeacherFill,
  PiChatCircleBold,
  PiDownloadBold,
  PiImageBold,
  PiMoneyBold,
  PiMoneyLight,
  PiMoneyWavyBold,
  PiNewspaperBold,
  PiSeat,
  PiStackBold,
  PiStudent,
  PiStudentBold,
  PiTableBold,
  PiUploadBold,
  PiUserPlusBold,
  PiUsersThreeBold,
  PiVideoBold,
} from "react-icons/pi";
import {
  RiBriefcaseLine,
  RiCalendarEventLine,
  RiCalendarScheduleLine,
  RiContactsBookLine,
  RiLayoutLine,
  RiLogoutBoxRLine,
  RiMoneyCnyCircleLine,
  RiSendPlaneLine,
  RiSettings3Line,
} from "react-icons/ri";
import {
  TbArrowsExchange2,
  TbBell,
  TbBuilding,
  TbCalendarStats,
  TbCategory,
  TbClock,
  TbCoins,
  TbCoinTaka,
  TbList,
  TbReceiptRefund,
  TbReport,
  TbReportAnalytics,
  TbReportMoney,
  TbTableAlias,
  TbTools,
} from "react-icons/tb";

// ====================================
// এখানে শুধু মেনু যোগ করুন - খুবই সহজ!
// ====================================
const MENU_ITEMS = [
  // সিম্পল মেনু (সাবমেনু ছাড়া)
  {
    id: "home",
    label: "হোম পৃষ্ঠা",
    icon: FaHome,
    color: "blue",
    submenu: [
      {
        id: "institute-info",
        label: "প্রতিষ্ঠানের তথ্য হালনাগাদ",
        icon: FaInfoCircle,
      },
      { id: "update-images", label: "Update Images", icon: FaImages },
      { id: "history", label: "ইতিহাস", icon: FaHistory },
      { id: "annual-reports", label: "Annual Reports", icon: FaFileAlt },
      { id: "contact", label: "যোগাযোগ", icon: FaPhone },
      { id: "social-links", label: "সামাজিক লিংকসমূহ", icon: FaLink },
      { id: "privacy-policy", label: "প্রাইভেসি পলিসি", icon: FaShieldAlt },
    ],
  },
  {
    id: "class",
    label: "ক্লাস",
    icon: MdOutlineClass,
    color: "blue",
    submenu: [
      { id: "session", label: "সেশন", icon: MdOutlineAccessTime },
      { id: "class-id", label: "ক্লাস", icon: MdClass },
      { id: "section", label: "সেকশন", icon: FaTableList },
      { id: "batch", label: "ব্যাচ", icon: BsPatchCheckFill },
      { id: "patthokrom", label: "পাঠ্যক্রম", icon: LuBookOpenCheck },
      {
        id: "class-wise-teacher",
        label: "ক্লাসভিত্তিক শিক্ষক যোগ",
        icon: PiChalkboardTeacherFill,
      },
      { id: "divide-pattokrom", label: "পাঠ্যক্রম বণ্টন", icon: FaBookOpen },
      {
        id: "class-routine",
        label: "ক্লাস রুটিন",
        icon: RiCalendarScheduleLine,
      },
      { id: "plus-new-report", label: "নতুন রিপোর্ট", icon: GoReport },
      { id: "class-report-list", label: "ক্লাস রিপোর্ট লিস্ট", icon: MdReport },
    ],
  },
  {
    id: "students",
    label: "শিক্ষার্থী",
    icon: PiStudentBold,
    color: "blue",
    submenu: [
      {
        id: "students-submenu",
        label: "শিক্ষার্থী",
        icon: PiUsersThreeBold,
      },
      {
        id: "add-student",
        label: "শিক্ষার্থী যোগ",
        icon: PiUserPlusBold,
      },
      {
        id: "add-student-image",
        label: "শিক্ষার্থীর ছবি যোগ",
        icon: PiImageBold,
      },
      {
        id: "student-class-update",
        label: "শিক্ষার্থীর শ্রেণী পরিবর্তন",
        icon: GiUpgrade,
      },
      {
        id: "migrate-status",
        label: "Migrate Status",
        icon: TbArrowsExchange2,
      },
      {
        id: "migrate-branch",
        label: "Migrate Branch",
        icon: GiPathDistance,
      },
      {
        id: "student-leave",
        label: "Student Leave",
        icon: RiLogoutBoxRLine,
      },
    ],
  },
  {
    id: "fees",
    label: "ফি",
    icon: PiMoneyWavyBold,
    color: "blue",
    submenu: [
      { id: "fine-type", label: "জরিমানার ধরণ", icon: TbCoins },
      { id: "fee-type", label: "ফির ধরণ", icon: PiMoneyBold },
      { id: "discount", label: "ডিস্কাউন্ট", icon: AiOutlinePercentage },
      { id: "add-fee", label: "ফি যোগ", icon: MdAddCard },
      { id: "add-discount", label: "ডিসকাউন্ট যোগ", icon: AiOutlinePercentage },
      { id: "assign-fines", label: "Assign Fines", icon: BsCoin },
      { id: "fee-settings", label: "ফি সেটিং", icon: RiSettings3Line },
      { id: "collect-fee", label: "ফি সংগ্রহ করুন", icon: MdOutlinePayments },
      { id: "due-fee", label: "শিক্ষার্থীদের বকেয়া বেতন", icon: TbCoinTaka },
      { id: "collected-fee", label: "সংগ্রহীত বেতন", icon: PiMoneyLight },
      {
        id: "monthly-fee-report",
        label: "Monthly Fee Report Statement",
        icon: LuClipboardList,
      },
      {
        id: "monthly-fee-summary",
        label: "Monthly Fee Colletion Summary",
        icon: LuFileOutput,
      },
      { id: "due-fee-sms", label: "বকেয়া বেতনের এস এম এস", icon: FaSms },
      { id: "deleted-fees", label: "Deleted Fees", icon: TbReceiptRefund },
      {
        id: "monthly-fee-report-2",
        label: "Monthly Fee Report Statement",
        icon: LuClipboardList,
      },
    ],
  },
  {
    id: "print",
    label: "প্রিন্ট",
    icon: MdOutlinePrint,
    color: "blue",
    submenu: [
      {
        id: "admission-token",
        label: "Admission Token",
        icon: HiOutlineIdentification,
      },
      { id: "admit-card", label: "অ্যাডমিট কার্ড", icon: FaRegIdCard },
      { id: "tabular-result", label: "টেবুলার রেজাল্ট", icon: TbTableAlias },
      {
        id: "income-expense-report",
        label: "আয়ের - ব্যয়ের রিপোর্ট",
        icon: TbReportMoney,
      },
      {
        id: "summary-income-statement",
        label: "Summary-Income Statement",
        icon: TbReportAnalytics,
      },
      {
        id: "monthly-income-expense",
        label: "মাসিক আয়-ব্যয়ের রিপোর্ট",
        icon: TbCalendarStats,
      },
      { id: "print-student", label: "শিক্ষার্থী", icon: PiStudent },
      { id: "salary-sheet", label: "Salary Sheet", icon: RiMoneyCnyCircleLine },
      {
        id: "teacher-salary-report",
        label: "Teacher Salary Report",
        icon: LucideUsers2,
      },
      {
        id: "employee-salary-report",
        label: "Employee Salary Report",
        icon: LuUserCog,
      },
    ],
  },
  {
    id: "forms-certificates",
    label: "ফর্ম & সার্টিফিকেট",
    icon: LuFileBadge,
    color: "blue",
    submenu: [
      { id: "instant-form", label: "Instant Form", icon: FaWpforms },
      { id: "certificate", label: "Certificate", icon: PiCertificateBold },
      {
        id: "classwise-forms",
        label: "Classwise Forms / Certificate",
        icon: LuFileStack,
      },
      {
        id: "form-category-list",
        label: "Form Category List",
        icon: TbCategory,
      },
      {
        id: "institute-form-list",
        label: "Institute Form List",
        icon: MdOutlineDomain,
      },
    ],
  },
  {
    id: "accounts",
    label: "হিসাব",
    icon: TbReportMoney,
    color: "blue",
    submenu: [
      { id: "bank-accounts", label: "একাউন্ট", icon: RiSettings3Line },
      { id: "income-sources", label: "আয়ের উৎস", icon: TbReportMoney },
      { id: "expense-category", label: "Expense Category", icon: TbCategory },
      { id: "expense-item", label: "Expense Item", icon: TbList },
      { id: "due-expense-field", label: "Due Expense Field", icon: TbReport },
      {
        id: "transaction-types",
        label: "লেনদেনের ধরন",
        icon: TbArrowsExchange2,
      },
      { id: "incomes", label: "আয়", icon: TbReportMoney },
      { id: "due-expenses", label: "Due Expenses", icon: TbReport },
      { id: "expenses", label: "ব্যয়", icon: TbReportMoney },
      { id: "balance-sheet", label: "ব্যাল্যান্স শিট", icon: LuFileOutput },
      { id: "transactions", label: "লেনদেনসমূহ", icon: TbArrowsExchange2 },
    ],
  },
  {
    id: "home-works",
    label: "Home Works",
    icon: MdHomeWork,
    color: "blue",
    submenu: [{ id: "home-work", label: "Home Work", icon: MdHomeWork }],
  },
  {
    id: "attendance",
    label: "উপস্থিতি",
    icon: TbReport,
    color: "blue",
    submenu: [
      {
        id: "attendance-settings",
        label: "সেটিংস",
        icon: RiSettings3Line,
        submenu: [
          { id: "smart-attendance", label: "Smart Attendance", icon: TbReport },
          {
            id: "student-attendance-shift",
            label: "Student Attendance Shift",
            icon: TbClock,
          },
          {
            id: "teacher-shift",
            label: "Teacher Shift",
            icon: FaChalkboardTeacher,
          },
          {
            id: "smart-attendance-teacher",
            label: "Smart Attendance Teacher",
            icon: LucideUsers2,
          },
        ],
      },
      {
        id: "attendance-report",
        label: "Attendance Report",
        icon: TbReport,
        submenu: [
          { id: "summary-report", label: "Summery Report", icon: TbReport },
          {
            id: "detailed-report",
            label: "বিস্তারিত রিপোর্ট",
            icon: TbReportAnalytics,
          },
          {
            id: "print-student-data-report",
            label: "Print Student Data Report",
            icon: MdOutlinePrint,
          },
          {
            id: "print-teacher-data-report",
            label: "Print Teacher Data Report",
            icon: MdOutlinePrint,
          },
          {
            id: "print-student-attendance",
            label: "Print Student Attendance",
            icon: PiStudentBold,
          },
          {
            id: "print-teacher-attendance",
            label: "Print Teacher Attendance",
            icon: LucideUsers2,
          },
          {
            id: "monthly-report-students",
            label: "Monthly Report for Students",
            icon: PiStudentBold,
          },
          {
            id: "monthly-report-teachers",
            label: "Monthly Report for Teachers",
            icon: LucideUsers2,
          },
        ],
      },
      {
        id: "attendance-leave",
        label: "Leave",
        icon: MdOutlineEventBusy,
        submenu: [
          { id: "holiday", label: "Holiday", icon: FaCalendarAlt },
          { id: "leave-type", label: "Leave Type", icon: TbCategory },
          { id: "students-leave", label: "Student Leave", icon: PiStudentBold },
          { id: "employee-leave", label: "Employee Leave", icon: LuUserCog },
          { id: "teacher-leave", label: "Teacher Leave", icon: LucideUsers2 },
        ],
      },
    ],
  },
  {
    id: "exams",
    label: "পরীক্ষা",
    icon: GiGraduateCap,
    color: "blue",
    submenu: [
      { id: "grading", label: "Grading", icon: TbReport },
      { id: "exam-category", label: "Exam Category", icon: PiStackBold },
      { id: "exam-group", label: "Exam Group", icon: PiStackBold },
      { id: "exam", label: "পরীক্ষা", icon: MdOutlineAssignment },
      {
        id: "exam-routine",
        label: "পরীক্ষার রুটিন",
        icon: RiCalendarEventLine,
      },
    ],
  },
  {
    id: "seat-plan",
    label: "Seat Plan",
    icon: RiLayoutLine,
    color: "blue",
    submenu: [
      { id: "exam-hall", label: "পরীক্ষার হল", icon: RiLayoutLine },
      { id: "exam-timetable", label: "পরীক্ষার সময় কাল", icon: TbClock },
      { id: "seat-arrangement", label: "আসন পরিকল্পনা", icon: PiTableBold },
      {
        id: "seat-download",
        label: "আসন পরিকল্পনা ডাউনলোড",
        icon: PiDownloadBold,
      },
    ],
  },
  {
    id: "results",
    label: "ফলাফল",
    icon: MdOutlineAssignmentTurnedIn,
    color: "blue",
    submenu: [
      { id: "result", label: "ফলাফল", icon: TbReport },
      { id: "combined-result", label: "Combined Result", icon: TbReport },
      {
        id: "result-sheet-upload",
        label: "রেজাল্ট শিট আপলোড",
        icon: PiUploadBold,
      },
      {
        id: "subject-wise-marks",
        label: "বিষয়ভিত্তিক নাম্বার যোগ",
        icon: PiUploadBold,
      },
      {
        id: "excel-marks-entry",
        label: "এক্সেলে নাম্বার যোগ",
        icon: PiUploadBold,
      },
      { id: "tabular-results", label: "টেবুলার রেজাল্ট", icon: LuTable },
      {
        id: "marksheet-download",
        label: "মার্কশিট ডাউনলোড",
        icon: PiDownloadBold,
      },
      { id: "result-sms", label: "রেজাল্টের এস এম এস", icon: FaSms },
    ],
  },
  {
    id: "sms",
    label: "এস এম এস",
    icon: PiChatCircleBold,
    color: "blue",
    submenu: [
      {
        id: "send-instant-message",
        label: "Send Instant Message",
        icon: PiChatCircleBold,
      },
      { id: "sms-balance", label: "এস এম এস ব্যালেন্স", icon: TbCoinTaka },
      { id: "sms-list", label: "এস এম এস", icon: FaSms },
      { id: "send-sms", label: "এস এম এস পাঠান", icon: RiSendPlaneLine },
      { id: "due-fees-sms", label: "বকেয়া বেতনের এস এম এস", icon: FaSms },
      { id: "sms-report", label: "এস এম এস রিপোর্ট", icon: TbReport },
    ],
  },
  {
    id: "teachers",
    label: "শিক্ষক",
    icon: LucideUserSquare2,
    color: "blue",
    submenu: [
      {
        id: "teachers-staffs",
        label: "Teachers / Staffs",
        icon: LucideUserPlus2,
      },
      {
        id: "salary-report",
        label: "Salary Report",
        icon: RiMoneyCnyCircleLine,
      },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: LuFile,
    color: "blue",
    submenu: [
      { id: "document-category", label: "Document Category", icon: TbCategory },
      { id: "documents", label: "Documents", icon: LuFile },
    ],
  },
  {
    id: "institute",
    label: "প্রতিষ্ঠান",
    icon: PiBuildingsBold,
    color: "blue",
    submenu: [
      {
        id: "institute-messages",
        label: "Institute Messages",
        icon: PiChatCircleBold,
      },
      { id: "contact-home", label: "যোগাযোগ", icon: RiContactsBookLine },
      { id: "services", label: "সেবাসমূহ", icon: TbTools },
      {
        id: "management-committee",
        label: "পরিচালনা কমিটি",
        icon: GiGroupedDrops,
      },
      { id: "jobs", label: "চাকুরী", icon: RiBriefcaseLine },
    ],
  },
  {
    id: "publication",
    label: "প্রকাশনা",
    icon: PiNewspaperBold,
    color: "blue",
    submenu: [
      { id: "notices", label: "নোটিশ", icon: TbBell },
      { id: "event", label: "ইভেন্ট", icon: FaRegCalendarAlt },
      { id: "photo-gallery", label: "ফটো গ্যালারী", icon: FaPhotoVideo },
      { id: "author", label: "লেখক", icon: LuUser },
      { id: "blog-category", label: "ব্লগ ক্যাটাগরি", icon: TbCategory },
      { id: "blog", label: "ব্লগ", icon: PiBehanceLogoBold },
      { id: "menu", label: "Menu", icon: LuMenu },
      { id: "page", label: "Page", icon: LuFile },
    ],
  },
  {
    id: "admission",
    label: "ভর্তি",
    icon: PiStudentBold,
    color: "blue",
    submenu: [
      { id: "admission-infos", label: "ভর্তি তথ্য", icon: PiStudentBold },
      { id: "online-application", label: "অনলাইন আবেদন", icon: FaLaptop },
    ],
  },
  {
    id: "faculty",
    label: "অনুষদ",
    icon: TbBuilding,
    color: "blue",
    submenu: [
      { id: "new-faculty", label: "নতুন অনুষদ", icon: TbBuilding },
      { id: "faculty-list", label: "অনুষদ তালিকা", icon: TbList },
      { id: "new-department", label: "নতুন বিভাগ", icon: MdOutlineCategory },
      { id: "department-list", label: "বিভাগ তালিকা", icon: TbList },
    ],
  },
  {
    id: "institute-media",
    label: "প্রতিষ্ঠানের মিডিয়া",
    icon: FaPhotoVideo,
    color: "blue",
    submenu: [
      { id: "new-media", label: "New Media", icon: FaPhotoVideo },
      { id: "media-list", label: "Media List", icon: TbList },
      { id: "new-video", label: "New Video", icon: PiVideoBold },
      { id: "video-list", label: "Video List", icon: TbList },
    ],
  },
  {
    id: "management-board",
    label: "পরিচালনা পরিষদ",
    icon: GiTeamIdea,
    color: "blue",
    submenu: [
      { id: "officers", label: "কর্মকর্তা", icon: GiTeamIdea },
      { id: "teachers", label: "শিক্ষকবৃন্দ", icon: LucideUsers2 },
      { id: "studentss", label: "শিক্ষার্থী", icon: PiStudentBold },
    ],
  },
  {
    id: "settings",
    label: "সেটিংস",
    icon: RiSettings3Line,
    color: "blue",
    submenu: [
      { id: "basic-settings", label: "প্রাথমিক সেটিং", icon: RiSettings3Line },
      { id: "users-settings", label: "ইউজার সেটিংস", icon: Users},
    ],
  },
  {
    id: "collaboration",
    label: "সহযোগিতা",
    icon: PiChalkboardTeacherBold,
    color: "blue",
    submenu: [
      { id: "tutorial", label: "টিউটোরিয়াল", icon: PiChalkboardTeacherBold },
    ],
  },

  { id: "announcement", label: "Announcement", icon: FaBullhorn },
  { id: "notice", label: "Notice", icon: FaBullhorn },
  { id: "routine", label: "Routine", icon: FaCalendarDay },
  { id: "school-history", label: "School History", icon: FaSchool },
  { id: "speech", label: "Speech", icon: FaQuoteRight },

  // সাবমেনু সহ মেনু
  {
    id: "student",
    label: "Manage Student",
    icon: FaUserGraduate,
    color: "green",
    submenu: [
      { id: "students", label: "Students", icon: FaUserGraduate },
      { id: "total-seats", label: "Total Seat", icon: PiSeat },
      { id: "class-rooms", label: "Class Rooms", icon: MdRoom },
      { id: "admission-info", label: "Admission Info", icon: ImInfo },
      { id: "admission-form", label: "Admission Form", icon: CgFormatBold },
    ],
  },

  {
    id: "teachers",
    label: "Management",
    icon: FaChalkboardTeacher,
    color: "purple",
    submenu: [
      { id: "teacher-list", label: "Teacher List", icon: FaChalkboardTeacher },
      { id: "workers-list", label: "Workers List", icon: FaUserFriends },
      { id: "headmasters-list", label: "Headmasters List", icon: FaUserTie },
      { id: "off-days", label: "Off Days", icon: FaCalendarAlt },
      { id: "circular", label: "Circular", icon: FaBell },
    ],
  },

  {
    id: "gallery",
    label: "Gallery",
    icon: FaImages,
    color: "orange",
    submenu: [
      { id: "photo-gallery", label: "Photo Gallery", icon: FaImages },
      { id: "video-gallery", label: "Video Gallery", icon: FaVideo },
    ],
  },

  {
    id: "history",
    label: "History",
    icon: FaHistory,
    color: "red",
    submenu: [
      { id: "upazilla-history", label: "Upazilla History", icon: FaHistory },
      { id: "zilla-history", label: "Zilla History", icon: FaHistory },
    ],
  },

  {
    id: "contact",
    label: "যোগাযোগ",
    icon: FaPhone,
    color: "indigo",
    submenu: [
      { id: "contact-info", label: "যোগাযোগ তথ্য", icon: FaEnvelope },
      { id: "social-links-sub", label: "সোশ্যাল মিডিয়া", icon: FaBullhorn },
    ],
  },

  // আরও সিম্পল মেনু
  { id: "blogs", label: "Blogs", icon: Notebook },
  { id: "managing", label: "Committee", icon: MdManageHistory },
  { id: "settings", label: "Settings", icon: FaCog },
];

// ====================================
// মূল কম্পোনেন্ট
// ====================================
const Sidebar = ({ activeMenu, setActiveMenu, isSidebarOpen, setIsSidebarOpen }) => {
  const [openSubmenus, setOpenSubmenus] = useState(() => {
    const saved = localStorage.getItem("sidebar_open_submenus");
    return saved ? JSON.parse(saved) : {};
  });

  const sidebarRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("sidebar_active_menu", activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    localStorage.setItem("sidebar_open_submenus", JSON.stringify(openSubmenus));
  }, [openSubmenus]);

  const handleMenuClick = (e, menuId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const toggleSubmenu = (e, menuId) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubmenus(prev => {
      const newState = {};
      // শুধু একটা সাবমেনু ওপেন থাকবে
      newState[menuId] = !prev[menuId];
      return newState;
    });
  };

  // Mobile click outside close
  useEffect(() => {
    const handleOutside = (e) => {
      if (window.innerWidth < 1024 && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isSidebarOpen]);

  const MenuItem = ({ item, isSubmenuItem = false, level = 0 }) => {
    const Icon = item.icon;
    const isActive = activeMenu === item.id;

    return (
      <button
        onClick={(e) => handleMenuClick(e, item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
          ${isActive 
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold shadow-sm" 
            : "text-gray-600 hover:bg-gray-50"
          }
          ${isSubmenuItem ? "text-sm" : ""}
        `}
        style={{ paddingLeft: isSubmenuItem ? `${28 + level * 16}px` : "16px" }}
      >
        {Icon && <Icon className={`text-xl ${isActive ? "text-blue-600" : "text-gray-500"}`} />}
        <span className="flex-1">{item.label}</span>
      </button>
    );
  };

  const MenuWithSubmenu = ({ item, level = 0 }) => {
    const Icon = item.icon;
    const isOpen = !!openSubmenus[item.id];
    const hasActiveChild = item.submenu?.some(sub => 
      sub.submenu ? sub.submenu.some(s => s.id === activeMenu) : sub.id === activeMenu
    );

    return (
      <div className="mt-1">
        <button
          onClick={(e) => toggleSubmenu(e, item.id)}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all
            ${(hasActiveChild || isOpen) ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}
          `}
          style={{ paddingLeft: `${16 + level * 16}px` }}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className={`text-xl ${(hasActiveChild || isOpen) ? "text-blue-600" : "text-gray-500"}`} />}
            <span>{item.label}</span>
          </div>
          <CgChevronDown className={`transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
        </button>

        {isOpen && (
          <div className="mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {item.submenu.map(sub => 
              sub.submenu ? (
                <MenuWithSubmenu key={sub.id} item={sub} level={level + 1} />
              ) : (
                <MenuItem key={sub.id} item={sub} isSubmenuItem={true} level={level + 1} />
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl border-r border-gray-200 z-50
          transition-transform duration-300 flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="lg:hidden flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">মেনু</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded">
            <CgClose className="text-xl" />
          </button>
        </div>

        <div className="hidden lg:block p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">সুপার ড্যাশবোর্ড</h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MENU_ITEMS.map(item => 
            item.submenu ? (
              <MenuWithSubmenu key={item.id} item={item} />
            ) : (
              <MenuItem key={item.id} item={item} />
            )
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;