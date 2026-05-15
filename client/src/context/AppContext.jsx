import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  //  Backend URL WITHOUT ending slash
  const backendUrl = import.meta.env.DEV ? "http://localhost:3000" : "https://lms-1-ki76.onrender.com";

  // ==========================
  //  Fetch All Courses
  // ==========================
  const fetchAllCourses = async () => {
    console.log(" Calling fetchAllCourses...");
    try {
      const res = await fetch(`${backendUrl}/api/course/all`, {
        method: "GET",
        credentials: "include", // Clerk session ke liye zaroori
        headers: { "Content-Type": "application/json" },
      });

      console.log(" Response status:", res.status);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      console.log("✅ All Courses from backend:", data);

      // ✅ Auto fallback to dummyCourses if backend returns empty
      if (data.success && data.courses.length > 0) {
        setAllCourses(data.courses);
      } else {
        console.warn(" Backend empty or failed, using dummyCourses");
        setAllCourses(dummyCourses);
      }

    } catch (err) {
      console.error(" API Error:", err);
      toast.error(`API Error: ${err.message}`);
      setAllCourses(dummyCourses); // fallback
    }
  };

  // ==========================
  // Fetch User Data
  // ==========================
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.user);

        const userRole = data.user?.role || user?.publicMetadata?.role;
        setIsEducator(userRole === 'educator');

        const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';
        const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map((email) => email.trim().toLowerCase()) || [];
        const isEmailAdmin = email && adminEmails.includes(email.toLowerCase());
        setIsAdmin(userRole === 'admin' || isEmailAdmin);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(" fetchUserData Error:", error.message);
    }
  };

  // ==========================
  //  Fetch User Enrolled Courses
  // ==========================
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  Calculate Helpers
  const calculateRating = (course) => {
    if (!course.courseRating || course.courseRating.length === 0) return 0;
    let totalRating = 0;
    course.courseRating.forEach((rating) => (totalRating += rating.rating));
    return Math.floor(totalRating / course.courseRating.length);
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) =>
      chapter.chapterContent.forEach((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateNoOfLecture = (course) => {
    if (!course || !course.courseContent) return 0;
    return course.courseContent.reduce((total, chapter) => {
      return total + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0);
    }, 0);
  };

  // ==========================
  //  Effects
  // ==========================
  useEffect(() => {
    console.log(" useEffect triggered for fetchAllCourses");
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  // ==========================
  //  Context Value
  // ==========================
  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLecture,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    isAdmin,
    getToken,
    fetchAllCourses,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
