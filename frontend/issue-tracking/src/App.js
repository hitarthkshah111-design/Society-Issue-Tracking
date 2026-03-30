import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";                          /* Role Selection Page */
import AdminLogin from "./AdminLogin";
import SecretaryLogin from "./SecretaryLogin";
import UserLogin from "./UserLogin";
import SecretaryRegistration from "./SecretaryRegistration";
import UserRegistration from "./UserRegistration";
import ProtectedRoute from "./ProtectedRoute";

/* ===== Admin Pages ===== */
import AdminLayout from "./Admin/Layout";
import AdminDashboard from "./Admin/Dashboard";
import AdminUsers from "./Admin/Users";
import AddUser from "./Admin/AddUser";
import EditUser from "./Admin/EditUser";
import AdminSecretaries from "./Admin/Secretaries";
import AddSecretary from "./Admin/AddSecretary";
import EditSecretary from "./Admin/EditSecretary";
import AdminIssues from "./Admin/Issues";
import AdminIssueLog from "./Admin/IssueLog";
import AdminFeedback from "./Admin/Feedback";
import AdminNotification from "./Admin/Notification";
import AdminReportExport from "./Admin/Report&Export";
import AdminProfile from "./Admin/Profile";

/* ===== Secretary Pages ===== */
import SecretaryLayout from "./Secretary/Layout";
import SecretaryDashboard from "./Secretary/Dashboard";
import SecretaryUserDetails from "./Secretary/UserDetails";
import AddUserSecretary from "./Secretary/AddUser";
import EditUserSecretary from "./Secretary/EditUser";
import SecretaryFeedback from "./Secretary/Feedback";
import SecretaryNotification from "./Secretary/Notification";
import SecretaryReportExport from "./Secretary/Report_Export";
import SecretaryProfile from "./Secretary/Profile";
import SecretaryIssueStatus from "./Secretary/IssueStatus";
import SecretaryIssues from "./Secretary/Issues";

/* ===== User Pages ===== */
import UserLayout from "./User/Layout";
import UserDashboard from "./User/User_dashboard";
import UserReportIssue from "./User/ReportIssue";
import UserFeedback from "./User/Feedback";
import UserNotification from "./User/Notification";
import UserReportExport from "./User/Report_export";
import UserProfile from "./User/Profile";
import UserIssues from "./User/UserIssues";
import AddFeedback from "./User/AddFeedback";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes — Role Selection & Role-Specific Login/Register */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Secretary */}
        <Route path="/secretary/login" element={<SecretaryLogin />} />
        <Route path="/secretary/register" element={<SecretaryRegistration />} />

        {/* User */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegistration />} />

        {/* Legacy redirect — old /register goes to secretary register */}
        <Route path="/register" element={<Navigate to="/secretary/register" />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="secretaries" element={<AdminSecretaries />} />
          <Route path="secretaries/add" element={<AddSecretary />} />
          <Route path="secretaries/edit/:id" element={<EditSecretary />} />
          <Route path="issues" element={<AdminIssues />} />
          <Route path="issue-log" element={<AdminIssueLog />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="notifications" element={<AdminNotification />} />
          <Route path="reports" element={<AdminReportExport />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Secretary Routes */}
        <Route
          path="/secretary"
          element={
            <ProtectedRoute role="secretary">
              <SecretaryLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SecretaryDashboard />} />
          <Route path="users" element={<SecretaryUserDetails />} />
          <Route path="users/add" element={<AddUserSecretary />} />
          <Route path="users/edit/:id" element={<EditUserSecretary />} />
          <Route path="issues" element={<SecretaryIssues />} />
          <Route path="feedback" element={<SecretaryFeedback />} />
          <Route path="notifications" element={<SecretaryNotification />} />
          <Route path="reports" element={<SecretaryReportExport />} />
          <Route path="issues/update/:id" element={<SecretaryIssueStatus />} />
          <Route path="profile" element={<SecretaryProfile />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="report-issue" element={<UserReportIssue />} />
          <Route path="issues" element={<UserIssues />} />
          <Route path="feedback" element={<UserFeedback />} />
          <Route path="add/feedback" element={<AddFeedback />} />
          <Route path="notifications" element={<UserNotification />} />
          <Route path="reports" element={<UserReportExport />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;