import { useState } from "react";
import Nav from "./Components/Nav";

import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./Pages/Home";
import Library from "./Pages/Library";
import Notes from "./Pages/Notes";
import Explore from "./Pages/Explore";
import TimerControler from "./Components/TimerControler";
import Focus from "./Pages/Focus";

import ViewPdf from "./Features/ViewPdf";

import OnboardingFirst from "./Pages/Onboarding/OnboardingFirst";
import OnboardingSecond from "./Pages/Onboarding/OnboardingSecond";
import OnboardingThird from "./Pages/Onboarding/OnboardingThird";
import OnboardingFourth from "./Pages/Onboarding/OnboardingFourth";
import Signup from "./Pages/Auth/Signup";
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import Otp from "./Pages/Auth/Otp";
import NewPassword from "./Pages/Auth/NewPassword";
import Pricing from "./Pages/Pricing/Pricing";
import Profile from "./Pages/Profile/Profile";
import Settings from "./Pages/Profile/Settings";
import Statistics from "./Pages/Profile/Statistics";
import ViewEpub from "./Features/ViewEpub";

function App() {
  const location = useLocation();

  const navRoutes = ["/home", "/library", "/notes", "/explore", "/profile"];
  const showNav = navRoutes.includes(location.pathname);

  return (
    <div
      className={`font-manrope h-dvh ${showNav ? "bg-background overflow-scroll" : ""}`}
    >
      {showNav && <TimerControler />}

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile/settings" element={<Settings />} />
        <Route path="/profile/statistics" element={<Statistics />} />

        <Route path="/focus" element={<Focus />} />

        <Route path="/viewpdf/:fileId" element={<ViewPdf />} />
        <Route path="/viewepub/:fileId" element={<ViewEpub />} />

        <Route path="/" element={<OnboardingFirst />} />
        <Route path="/onboarding1" element={<OnboardingFirst />} />
        <Route path="/onboarding2" element={<OnboardingSecond />} />
        <Route path="/onboarding3" element={<OnboardingThird />} />
        <Route path="/onboarding4" element={<OnboardingFourth />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/newpassword" element={<NewPassword />} />
      </Routes>

      {showNav && <Nav />}
    </div>
  );
}

export default App;
