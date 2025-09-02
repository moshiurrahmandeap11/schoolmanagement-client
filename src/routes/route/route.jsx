import { createBrowserRouter } from "react-router";
import RootLayout from "../../layouts/RootLayout/RootLayout";
import Home from "../../pages/Home/Home";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import Login from "../../components/authItems/Login/Login";
import SignUp from "../../components/authItems/SignUp/SignUp";
import TermsAndConditions from "../../components/TermsAndCondtions/TermsAndConditions";
import PrivacyPolicy from "../../components/PrivacyPolicy/PrivacyPolicy";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    children: [
        { index: true, element: <Home></Home> },
        { path: "/terms-and-conditions", element: <TermsAndConditions></TermsAndConditions> },
        { path: "/privacy-policy", element: <PrivacyPolicy></PrivacyPolicy> }
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    children: [
        {
            path: "login",
            element: <Login></Login>
        },
        {
            path: "signup",
            element: <SignUp></SignUp>
        }
    ]
  }
]);
