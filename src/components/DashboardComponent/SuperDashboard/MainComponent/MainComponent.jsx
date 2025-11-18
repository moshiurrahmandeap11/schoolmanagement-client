// MainComponent/MainComponent.jsx
import AdmissionFormAdmin from "../Sidebar/AdmissionFormAdmin/AdmissionFormAdmin";
import AdmissionInfoAdmin from "../Sidebar/AdmissionInfo/AdmissionInfoAdmin";
import BlogsAdmin from "../Sidebar/BlogsAdmin/BlogsAdmin";
import CircularAdmin from "../Sidebar/CircularAdmin/CircularAdmin";
import ClassRooms from "../Sidebar/ClassRooms/ClassRooms";
import ContactInfoAdmin from "../Sidebar/ContactInfoAdmin/ContactInfoAdmin";
import HeadmastersListAdmin from "../Sidebar/HeadmastersListAdmin/HeadmastersListAdmin";
import HolidayListAdmin from "../Sidebar/HolidayListAdmin/HolidayListAdmin";
import ManagingCommitteeAdmin from "../Sidebar/ManagingCommitteeAdmin/ManagingCommitteeAdmin";
import NoticesAdmin from "../Sidebar/NoticesAdmin/NoticesAdmin";
import PhotoGallaryAdmin from "../Sidebar/PhotoGallaryAdmin/PhotoGallaryAdmin";
import RecentlyAdmin from "../Sidebar/RecentlyAdmin/RecentlyAdmin";
import RoutineAdmin from "../Sidebar/RoutineAdmin/RoutineAdmin";
import SchoolHistory from "../Sidebar/SchoolHistory/SchoolHistory";
import SDashboardItems from "../Sidebar/SDashboardItems/SDashboardItems";
import Settings from "../Sidebar/Settings/Settings";
import SpeechAdmin from "../Sidebar/SpeechAdmin/SpeechAdmin";
import StudentsAdmin from "../Sidebar/StudentsAdmin/StudentsAdmin";
import TeacherListAdmin from "../Sidebar/TeachersListAdmin/TeacherListAdmin";
import TotalSeats from "../Sidebar/TotalSeats/TotalSeats";
import UpazillaHistoryAdmin from "../Sidebar/UpazillaHistoryAdmin/UpazillaHistoryAdmin";
import VideoGallaryAdmin from "../Sidebar/VideoGallaryAdmin/VideoGallaryAdmin";
import WorkersListAdmin from "../Sidebar/WorkersListAdmin/WorkersListAdmin";
import ZillaHistoryAdmin from "../Sidebar/ZillaHistoryAdmin/ZillaHistoryAdmin";

// সব SDashboardItems কম্পোনেন্ট
import DetailedReport from "../Sidebar/Attendance/DetailedReport/DetailedReport";
import EmployeeLeave from "../Sidebar/Attendance/EmployeeLeave/EmployeeLeave";
import Holiday from "../Sidebar/Attendance/Holiday/Holiday";
import HolidayType from "../Sidebar/Attendance/HolidayType/HolidayType";
import MonthlyReportsStudents from "../Sidebar/Attendance/MonthlyReportStudents/MonthlyReportsStudents";
import MonthlyReportTeachers from "../Sidebar/Attendance/MonthlyReportTeachers/MonthlyReportTeachers";
import PrintStudentAttendance from "../Sidebar/Attendance/PrintStudentAttendance/PrintStudentAttendance";
import PrintStudentDataReport from "../Sidebar/Attendance/PrintStudentDataReport/PrintStudentDataReport";
import PrintTeacherAttendance from "../Sidebar/Attendance/PrintTeacherAttendance/PrintTeacherAttendance";
import PrintTeacherDataReport from "../Sidebar/Attendance/PrintTeacherDataReport/PrintTeacherDataReport";
import SmartAttendance from "../Sidebar/Attendance/SmartAttendance/SmartAttendance";
import SmartAttendanceTeacher from "../Sidebar/Attendance/SmartAttendanceTeacher/SmartAttendanceTeacher";
import StudentAttendanceShift from "../Sidebar/Attendance/StudentAttendanceShift/StudentAttendanceShift";
import SummeryReport from "../Sidebar/Attendance/SummeryReport/SummeryReport";
import TteacherShift from "../Sidebar/Attendance/TeacherShift/TteacherShift";
import TeachersLeave from "../Sidebar/Attendance/TeachersLeave/TeachersLeave";
import BasicSettings from "../Sidebar/BasicSettings/BasicSettings";
import Batch from "../Sidebar/Class/Batch/Batch";
import Class from "../Sidebar/Class/ClassId/Class";
import ClassWiseTeacher from "../Sidebar/Class/ClassWiseTeacher/ClassWiseTeacher";
import DividePathokrom from "../Sidebar/Class/dividePathokrom/DividePathokrom";
import Section from "../Sidebar/Class/Section/Section";
import Session from "../Sidebar/Class/Session/Session";
import Subjects from "../Sidebar/Class/Subjects/Subjects";
import DueFeeSms from "../Sidebar/DueFeeSms/DueFeeSms";
import ExamGroup from "../Sidebar/exam/ExamGroup/ExamGroup";
import AssignFines from "../Sidebar/Fee/AssignFines/AssignFines";
import CollectedFee from "../Sidebar/Fee/CollectedFee/CollectedFee";
import CollectFee from "../Sidebar/Fee/CollectFee/CollectFee";
import DeletedFees from "../Sidebar/Fee/DeletedFees/DeletedFees";
import Discount from "../Sidebar/Fee/Discount/Discount";
import DiscountJog from "../Sidebar/Fee/DiscountJog/DiscountJog";
import Fee from "../Sidebar/Fee/Fee/Fee";
import FeeSettings from "../Sidebar/Fee/FeeSettings/FeeSettings";
import FeesType from "../Sidebar/Fee/FeesType/FeesType";
import FineTypes from "../Sidebar/Fee/FineTypes/FineTypes";
import MonthlyFeeReport from "../Sidebar/Fee/MonthlyFeeReport/MonthlyFeeReport";
import MonthlyFeeSummary from "../Sidebar/Fee/MonthlyFeeSummary/MonthlyFeeSummary";
import StudentsBokeya from "../Sidebar/Fee/StudentsBokeya/StudentsBokeya";
import ClassWiseForm from "../Sidebar/FormAndCertificates/ClassWiseForm/ClassWiseForm";
import DueExpenses from "../Sidebar/Hisab/DueExpenses/DueExpenses";
import ExpenseCategory from "../Sidebar/Hisab/ExpenseCategory/ExpenseCategory";
import ExpenseItems from "../Sidebar/Hisab/ExpenseCategory/ExpenseItems/ExpenseItems";
import AnnualReports from "../Sidebar/HomePristha/AnnualReports/AnnualReports";
import ContactHome from "../Sidebar/HomePristha/ContactHome/ContactHome";
import ContactMain from "../Sidebar/Institute/ContactMain/ContactMain";
import InstituteJobs from "../Sidebar/Institute/InstituteJobs/InstituteJobs";
import InstituteMessage from "../Sidebar/Institute/InstituteMessage/InstituteMessage";
import ServicesSomuho from "../Sidebar/Institute/ServicesSomuho/ServicesSomuho";
import MediaList from "../Sidebar/instituteMedia/MediaList/MediaList";
import NewMedia from "../Sidebar/instituteMedia/NewMedia/NewMedia";
import NewVideo from "../Sidebar/instituteMedia/NewVideo/NewVideo";
import VideoList from "../Sidebar/instituteMedia/VideoList/VideoList";
import DepartmentList from "../Sidebar/Onusod/DepertmentList/DepertmentList";
import FacultyList from "../Sidebar/Onusod/FacultyList/FacultyList";
import NewDepartment from "../Sidebar/Onusod/NewDepartment/NewDepartment";
import NewFaculty from "../Sidebar/Onusod/NewFaculty/NewFaculty";
import AdmissionToken from "../Sidebar/Print/AdmissionToken/AdmissionToken";
import AdmitCard from "../Sidebar/Print/AdmitCard/AdmitCard";
import EmployeeSalaryReport from "../Sidebar/Print/EmployeeSalaryReport/EmployeeSalaryReport";
import IncomeExpenseReport from "../Sidebar/Print/IncomeExpenseReport/IncomeExpenseReport";
import MonthlyIncomeExpense from "../Sidebar/Print/MonthlyIncomeExpense/MonthlyIncomeExpense";
import PrintStudent from "../Sidebar/Print/PrintStudent/PrintStudent";
import SalaryReport from "../Sidebar/Print/SalaryReport/SalaryReport";
import SalarySheet from "../Sidebar/Print/SalarySheet/SalarySheet";
import SummaryIncomeStatement from "../Sidebar/Print/SummaryIncomeStatement/SummaryIncomeStatement";
import TabularResult from "../Sidebar/Print/TabularResult/TabularResult";
import TeacherSalaryReport from "../Sidebar/Print/TeacherSalaryReport/TeacherSalaryReport";
import BlogCategory from "../Sidebar/Prokashona/BlogCategory/BlogCategory";
import CombinedResult from "../Sidebar/results/CombinedResult/CombinedResult";
import ResultSheetUpload from "../Sidebar/results/ResultSheetUpload/ResultSheetUpload";
import AcademicManagement from "../Sidebar/SDashboardItems/AcademicManagement/AcademicManagement";
import AllDocument from "../Sidebar/SDashboardItems/AcademicManagement/AllDocument/AllDocument";
import Assignments from "../Sidebar/SDashboardItems/AcademicManagement/Assignments/Assignments";
import Category from "../Sidebar/SDashboardItems/AcademicManagement/Category/Category";
import ClassReport from "../Sidebar/SDashboardItems/AcademicManagement/ClassReport/ClassReport";
import ClassReportList from "../Sidebar/SDashboardItems/AcademicManagement/ClassReportList/ClassReportList";
import Students from "../Sidebar/SDashboardItems/AcademicManagement/Students/Students";
import AccountsManagement from "../Sidebar/SDashboardItems/AccountsManagement/AccountsManagement";
import BalanceSheet from "../Sidebar/SDashboardItems/AccountsManagement/BalanceSheet/BalanceSheet";
import BankAccounts from "../Sidebar/SDashboardItems/AccountsManagement/BankAccounts/BankAccounts";
import Expenses from "../Sidebar/SDashboardItems/AccountsManagement/Expenses/Expenses";
import Incomes from "../Sidebar/SDashboardItems/AccountsManagement/Incomes/Incomes";
import IncomeSources from "../Sidebar/SDashboardItems/AccountsManagement/IncomeSources/IncomeSources";
import PaymentTypes from "../Sidebar/SDashboardItems/AccountsManagement/PaymentTypes/PaymentTypes";
import Transactions from "../Sidebar/SDashboardItems/AccountsManagement/Transactions/Transactions";
import AttendanceManagement from "../Sidebar/SDashboardItems/AttendanceManagement/AttendanceManagement";
import { default as Branch, default as BranchManagement } from "../Sidebar/SDashboardItems/Branch/Branch";
import NewBranch from "../Sidebar/SDashboardItems/Branch/NewBranch/NewBranch";
import CertificateCategory from "../Sidebar/SDashboardItems/CertificateManagement/CertificateCategory/CertificateCategory";
import CertificateManagement from "../Sidebar/SDashboardItems/CertificateManagement/CertificateManagement";
import CreateCertificate from "../Sidebar/SDashboardItems/CertificateManagement/CreateCertificate/CreateCertificate";
import { default as InstantStudentForm } from "../Sidebar/SDashboardItems/CertificateManagement/InstantStudentForm/InstantStudentForm";
import InstituteFormListC from "../Sidebar/SDashboardItems/CertificateManagement/InstituteFormList/InstituteFormList";
import DepartmentManagement from "../Sidebar/SDashboardItems/DepartmentManagement/DepartmentManagement";
import DonationManagement from "../Sidebar/SDashboardItems/DonationManagement/DonationManagement";
import Exam from "../Sidebar/SDashboardItems/ExaminationManagement/Exam/Exam";
import ExaminationManagement from "../Sidebar/SDashboardItems/ExaminationManagement/ExaminationManagement";
import ExcelMarks from "../Sidebar/SDashboardItems/ExaminationManagement/ExcelMarks/ExcelMarks";
import Grading from "../Sidebar/SDashboardItems/ExaminationManagement/Grading/Grading";
import Marksheet from "../Sidebar/SDashboardItems/ExaminationManagement/Marksheet/Marksheet";
import Result from "../Sidebar/SDashboardItems/ExaminationManagement/Result/Result";
import ResultSMS from "../Sidebar/SDashboardItems/ExaminationManagement/ResultSMS/ResultSMS";
import Routine from "../Sidebar/SDashboardItems/ExaminationManagement/Routine/Routine";
import SubjectMarks from "../Sidebar/SDashboardItems/ExaminationManagement/SubjectMarks/SubjectMarks";
import FeeManagement from "../Sidebar/SDashboardItems/FeeManagement/FeeManagement";
import PrintManagement from "../Sidebar/SDashboardItems/PrintManagement/PrintManagement";
import SalaryBonusManagement from "../Sidebar/SDashboardItems/SalaryBonusManagement/SalaryBonusManagement";
import SMSManagement from "../Sidebar/SDashboardItems/SMSManagement/SMSManagement";
import Authors from "../Sidebar/SDashboardItems/WebsiteManagement/Authors/Authors";
import Events from "../Sidebar/SDashboardItems/WebsiteManagement/Events/Events";
import Facilities from "../Sidebar/SDashboardItems/WebsiteManagement/Facilities/Facilities";
import InstituteInfo from "../Sidebar/SDashboardItems/WebsiteManagement/InstitueInfo/InstituteInfo";
import Menu from "../Sidebar/SDashboardItems/WebsiteManagement/Menu/Menu";
import Pages from "../Sidebar/SDashboardItems/WebsiteManagement/Pages/Pages";
import PrivacyPolicy from "../Sidebar/SDashboardItems/WebsiteManagement/PrivacyPolicy/PrivacyPolicy";
import SocialLinks from "../Sidebar/SDashboardItems/WebsiteManagement/SocialLinks/SocialLinks";
import WebsiteManagement from "../Sidebar/SDashboardItems/WebsiteManagement/WebsiteManagement";
import ExamHall from "../Sidebar/SeatPlan/ExamHall/ExamHall";
import ExamTimeTable from "../Sidebar/SeatPlan/ExamTimeTable/ExamTimeTable";
import SeatArrangement from "../Sidebar/SeatPlan/SeatArrangement/SeatArrangement";
import SeatDownload from "../Sidebar/SeatPlan/SeatDownload/SeatDownload";
import ExamCategory from "../Sidebar/SidebarExam/ExamCategory/ExamCategory";
import MessageForAdmin from "../Sidebar/sms/MessageForAdmin/MessageForAdmin";
import SendInstantMessage from "../Sidebar/sms/SendInstantMessage/SendInstantMessage";
import SmsBalance from "../Sidebar/sms/SmsBalance/SmsBalance";
import AddStudentImage from "../Sidebar/Students/AddStudentImage/AddStudentImage";
import MigrateBranch from "../Sidebar/Students/MigrateBranch/MigrateBranch";
import MigrateStatus from "../Sidebar/Students/MigrateStatus/MigrateStatus";
import StudentsClassUpdate from "../Sidebar/Students/StudentsClassUpdate/StudentsClassUpdate";
import StudentsLeave from "../Sidebar/Students/StudentsLeave/StudentsLeave";
import AddNewStudent from "../Sidebar/Students/StudentsMenu/AddNewStudent/AddNewStudent";
import StudentsMenu from "../Sidebar/Students/StudentsMenu/StudentsMenu";
import UserSettings from "../Sidebar/UserSettings/UserSettings";
import MainAdmissionInfo from "../Sidebar/Vorti/MainAdmissionInfo/MainAdmissionInfo";
import OnlineApplication from "../Sidebar/Vorti/OnlineApplication/OnlineApplication";

const MainComponent = ({ activeMenu, onDashboardItemClick }) => { 
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <SDashboardItems onItemClick={onDashboardItemClick} />; 
      case "branch-management":
        return <BranchManagement />;
      case "donation-management":
        return <DonationManagement />;
      case "certificate-management":
        return <CertificateManagement />;
      case "salary-bonus-management":
        return <SalaryBonusManagement />;
      case "website-management":
        return <WebsiteManagement />;
      case "academic-management":
        return <AcademicManagement />;
      case "examination-management":
        return <ExaminationManagement />;
      case "accounts-management":
        return <AccountsManagement />;
      case "fee-management":
        return <FeeManagement />;
      case "print-management":
        return <PrintManagement />;
      case "sms-management":
        return <SMSManagement />;
      case "attendance-management":
        return <AttendanceManagement />;
      case "department-management":
        return <DepartmentManagement />;
      case "teachers-staffs":
        return <TeacherListAdmin></TeacherListAdmin>
      case "institute-info":
        return <InstituteInfo></InstituteInfo>
      case "update-images":
        return <Settings></Settings>
      case "history":
        return <SchoolHistory></SchoolHistory>
      case "annual-reports":
        return <AnnualReports></AnnualReports>
      case "contact":
        return <ContactHome></ContactHome>
      case "social-links":
        return <SocialLinks></SocialLinks>
      case "privacy-policy":
        return <PrivacyPolicy></PrivacyPolicy>
      case "class-id":
        return <Class></Class>
      case "class-wise-teacher":
        return <ClassWiseTeacher></ClassWiseTeacher>
      case "divide-pattokrom":
        return <DividePathokrom></DividePathokrom>
      case "class-routine":
        return <Routine></Routine>
      case "plus-new-report":
        return <ClassReport></ClassReport>
      case "class-report-list":
        return <ClassReportList></ClassReportList>
      case "add-student":
        return <AddNewStudent></AddNewStudent>
      case "add-student-image":
        return <AddStudentImage></AddStudentImage>
      case "migrate-status":
        return <MigrateStatus></MigrateStatus>
      case "migrate-branch":
        return <MigrateBranch></MigrateBranch>
      case "student-leave":
        return <StudentsLeave></StudentsLeave>
      case "teacher-leave":
        return <TeachersLeave></TeachersLeave>
      case "employee-leave":
        return <EmployeeLeave></EmployeeLeave>
      case "grading":
        return <Grading></Grading>
      case "exam-group":
        return <ExamGroup></ExamGroup>
      case "exam":
        return <Exam></Exam>
      case "exam-routine":
        return <Routine></Routine>
      case "exam-hall":
        return <ExamHall></ExamHall>
      case "exam-timetable":
        return <ExamTimeTable></ExamTimeTable>
      case "seat-arrangement":
        return <SeatArrangement></SeatArrangement>
      case "seat-download":
        return <SeatDownload></SeatDownload>
      case "result":
        return <Result></Result>
      case "combined-result":
        return <CombinedResult></CombinedResult>
      case "result-sheet-upload":
        return <ResultSheetUpload></ResultSheetUpload>
      case "subject-wise-marks":
        return <SubjectMarks></SubjectMarks>
      case "excel-marks-entry":
        return <ExcelMarks></ExcelMarks>
      case "tabular-results":
        return <TabularResult></TabularResult>
      case "marksheet-download":
        return <Marksheet></Marksheet>
      case "result-sms":
        return <ResultSMS></ResultSMS>
      case "send-instant-message":
        return <SendInstantMessage></SendInstantMessage>
      case "sms-balance":
        return <SmsBalance></SmsBalance>
      case "sms-list":
        return <MessageForAdmin></MessageForAdmin>
      case "send-sms":
        return <MessageForAdmin></MessageForAdmin>
      case "due-fees-sms":
        return <DueFeeSms></DueFeeSms>
      case "sms-report":
        return <MessageForAdmin></MessageForAdmin>
      case "salary-report":
        return <SalaryReport></SalaryReport>
      case "documents":
        return <AllDocument></AllDocument>
      case "institute-messages":
        return <InstituteMessage></InstituteMessage>
      case "users-settings":
        return <UserSettings></UserSettings>
      case "all-branch":
        return <Branch></Branch>
      case "new-branch":
        return <NewBranch></NewBranch>
      case "homepage-management":
        return <InstituteInfo></InstituteInfo>
      case "institution-message":
        return <InstituteMessage></InstituteMessage>
      case "historys":
        return <SchoolHistory></SchoolHistory>
      case "contacts":
        return <ContactHome></ContactHome>
      case "facilities":
        return <Facilities></Facilities>
      case "batches":
        return <Batch></Batch>
      case "syllabus":
        return <DividePathokrom></DividePathokrom>
      case "events":
        return <Events></Events>
      case "authors":
        return <Authors></Authors>
      case "exams":
        return <Exam></Exam>
      case "results":
        return <Result></Result>
      case "result-sheet":
        return <ResultSheetUpload></ResultSheetUpload>
      case "officials":
        return <TeacherListAdmin></TeacherListAdmin>
      case "classess":
        return <Class></Class>
      case "contact-home":
        return <ContactMain></ContactMain>
      case "services":
        return <ServicesSomuho></ServicesSomuho>
      case "management-committee":
        return <ManagingCommitteeAdmin></ManagingCommitteeAdmin>
      case "jobs":
        return <InstituteJobs></InstituteJobs>
      case "notices":
        return <NoticesAdmin></NoticesAdmin>
      case "event":
        return <Events></Events>
      case "author":
        return <Authors></Authors>
      case "blog-category":
        return <BlogCategory></BlogCategory>
      case "blog":
        return <BlogsAdmin></BlogsAdmin>
      case "menu":
        return <Menu></Menu>
      case "page":
        return <Pages></Pages>
      case "admission-infos":
        return <MainAdmissionInfo></MainAdmissionInfo>
      case "online-application":
        return <OnlineApplication></OnlineApplication>
      case "new-faculty":
        return <NewFaculty></NewFaculty>
      case "faculty-list":
        return <FacultyList></FacultyList>
      case "new-department":
        return <NewDepartment></NewDepartment>
      case "department-list":
        return <DepartmentList></DepartmentList>
      case "new-media":
        return <NewMedia></NewMedia>
      case "media-list":
        return <MediaList></MediaList>
      case "studentss":
        return <Students></Students>
      case "basic-settings":
        return <BasicSettings></BasicSettings>
      case "new-video":
        return <NewVideo></NewVideo>
      case "video-list":
        return <VideoList></VideoList>
      case "officers":
        return <TeacherListAdmin></TeacherListAdmin>
      case "teachers":
        return <TeacherListAdmin></TeacherListAdmin>
      case "document-category":
        return <Category></Category>
      case "fine-type":
        return <FineTypes></FineTypes>
      case "fee-type":
        return <FeesType></FeesType>
      case "discount":
        return <Discount></Discount>
      case "add-fee":
        return <Fee></Fee>
      case "add-discount":
        return <DiscountJog></DiscountJog>
      case "assign-fines":
        return <AssignFines></AssignFines>
      case "fee-settings":
        return <FeeSettings></FeeSettings>
      case "collect-fee":
        return <CollectFee></CollectFee>
      case "due-fee":
        return <StudentsBokeya></StudentsBokeya>
      case "collected-fee":
        return <CollectedFee></CollectedFee>
      case "monthly-fee-report":
        return <MonthlyFeeReport></MonthlyFeeReport>
      case "monthly-fee-summary":
        return <MonthlyFeeSummary></MonthlyFeeSummary>
      case "due-fee-sms":
        return <DueFeeSms></DueFeeSms>
      case "deleted-fees":
        return <DeletedFees></DeletedFees>
      case "monthly-fee-report-2":
        return <MonthlyFeeReport></MonthlyFeeReport>
      case "admission-token":
        return <AdmissionToken></AdmissionToken>
      case "admit-card":
        return <AdmitCard></AdmitCard>
      case "tabular-result":
        return <TabularResult></TabularResult>
      case "income-expense-report":
        return <IncomeExpenseReport></IncomeExpenseReport>
      case "summary-income-statement":
        return <SummaryIncomeStatement></SummaryIncomeStatement>
      case "monthly-income-expense":
        return <MonthlyIncomeExpense></MonthlyIncomeExpense>
      case "print-student":
        return <PrintStudent></PrintStudent>
      case "salary-sheet":
        return <SalarySheet></SalarySheet>
      case "teacher-salary-report":
        return <TeacherSalaryReport></TeacherSalaryReport>
      case "employee-salary-report":
        return <EmployeeSalaryReport></EmployeeSalaryReport>
      case "instant-form":
        return <InstantStudentForm></InstantStudentForm>
      case "certificate":
        return <CreateCertificate></CreateCertificate>
      case "classwise-forms":
        return <ClassWiseForm></ClassWiseForm>
      case "form-category-list":
        return <CertificateCategory></CertificateCategory>
      case "institute-form-list":
        return <InstituteFormListC></InstituteFormListC>
      case "bank-accounts":
        return <BankAccounts></BankAccounts>
      case "income-sources":
        return <IncomeSources></IncomeSources>
      case "expense-item":
        return <ExpenseItems></ExpenseItems>
      case "due-expense-field":
        return <Expenses></Expenses>
      case "transaction-types":
        return <PaymentTypes></PaymentTypes>
      case "incomes":
        return <Incomes></Incomes>
      case "due-expenses":
        return <DueExpenses></DueExpenses>
      case "expenses":
        return <Expenses></Expenses>
      case "balance-sheet":
        return <BalanceSheet></BalanceSheet>
      case "transactions":
        return <Transactions></Transactions>
      case "home-work":
        return <Assignments></Assignments>
      case "smart-attendance":
        return <SmartAttendance></SmartAttendance>
      case "student-attendance-shift":
        return <StudentAttendanceShift></StudentAttendanceShift>
      case "teacher-shift":
        return <TteacherShift></TteacherShift>
      case "smart-attendance-teacher":
        return <SmartAttendanceTeacher></SmartAttendanceTeacher>
      case "summary-report":
        return <SummeryReport></SummeryReport>
      case "detailed-report":
        return <DetailedReport></DetailedReport>
      case "print-student-data-report":
        return <PrintStudentDataReport></PrintStudentDataReport>
      case "print-student-attendance":
        return <PrintStudentAttendance></PrintStudentAttendance>
      case "print-teacher-attendance":
        return <PrintTeacherAttendance></PrintTeacherAttendance>
      case "monthly-report-students":
        return <MonthlyReportsStudents></MonthlyReportsStudents>
      case "monthly-report-teachers":
        return <MonthlyReportTeachers></MonthlyReportTeachers>
      case "holiday":
        return <Holiday></Holiday>
      case "leave-type":
        return <HolidayType></HolidayType>
      case "students-leave":
        return <StudentsLeave></StudentsLeave>
      case "print-teacher-data-report":
        return <PrintTeacherDataReport></PrintTeacherDataReport>
      case "student-class-update":
        return <StudentsClassUpdate></StudentsClassUpdate>
      case "exam-category":
        return <ExamCategory></ExamCategory>
      case "expense-category":
        return <ExpenseCategory></ExpenseCategory>

      case "announcement":
        return <RecentlyAdmin />;
      case "school-history":
        return <SchoolHistory />;
      case "speech":
        return <SpeechAdmin />;
      case "students":
        return <StudentsAdmin />;
      case "total-seats":
        return <TotalSeats />;
      case "class-rooms":
        return <ClassRooms />;
      case "admission-info":
        return <AdmissionInfoAdmin />;
      case "admission-form":
        return <AdmissionFormAdmin />;
      case "teacher-list":
        return <TeacherListAdmin />;
      case "workers-list":
        return <WorkersListAdmin />;
      case "headmasters-list":
        return <HeadmastersListAdmin />;
      case "off-days":
        return <HolidayListAdmin />;
      case "circular":
        return <CircularAdmin />;
      case "video-gallery":
        return <VideoGallaryAdmin />;
      case "photo-gallery":
        return <PhotoGallaryAdmin />;
      case "blogs":
        return <BlogsAdmin />;
      case "managing":
        return <ManagingCommitteeAdmin />;
      case "upazilla-history":
        return <UpazillaHistoryAdmin />;
      case "zilla-history":
        return <ZillaHistoryAdmin />;
      case "contact-info":
        return <ContactInfoAdmin />;
      case "notice":
        return <NoticesAdmin />;
      case "routine":
        return <RoutineAdmin />;
      case "settings":
        return <Settings />;
      case "section":
        return <Section></Section>
      case "patthokrom":
        return <Subjects></Subjects>
      case "students-submenu":
        return <StudentsMenu></StudentsMenu>
      case "session":
        return <Session></Session>
      case "batch":
        return <Batch></Batch>
      

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ব্যবহারকারী প্রোফাইল</h1>
              <p className="text-gray-600 mt-2">আপনার প্রোফাইল তথ্য দেখুন এবং এডিট করুন।</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">A</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">আপনার নাম</h2>
                  <p className="text-gray-600">অ্যাডমিন ব্যবহারকারী</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="font-medium">পুরো নাম:</p><p>আপনার পুরো নাম</p></div>
                <div><p className="font-medium">ইমেইল:</p><p>your@email.com</p></div>
                <div><p className="font-medium">ভূমিকা:</p><p>অ্যাডমিন</p></div>
                <div><p className="font-medium">সদস্য since:</p><p>১ জানুয়ারি, ২০২৪</p></div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  প্রোফাইল এডিট করুন
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  পাসওয়ার্ড পরিবর্তন
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                সুপার ড্যাশবোর্ডে স্বাগতম
              </h1>
              <p className="text-gray-600 text-lg">
                বাম পাশের মেনু থেকে কোনো অপশন সিলেক্ট করুন
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 bg-gray-50 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainComponent;