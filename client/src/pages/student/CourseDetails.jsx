import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useUser } from "@clerk/clerk-react";
import Loading from "../../components/student/Loading";
import { assets, dummyCourses } from "../../assets/assets.js";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/StudentFooter";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const {
    calculateRating,
    calculateNoOfLecture,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    userData,
    getToken,
    backendUrl,
    fetchUserEnrolledCourses,
    enrolledCourses,
  } = useContext(AppContext);

  const { user } = useUser();

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // ✅ Fetch Course Data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
         console.log("Available dummy courses:", dummyCourses);
    console.log("Searching for course ID:", id);
        const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
        console.log("Course API Response:", data);

        if (data.success && data.courseData) {
          setCourseData(data.courseData);
        } else {
          // ✅ Dummy fallback
          const localCourse = dummyCourses.find((c) => String(c._id) === String(id));
          if (localCourse) {
            console.log("Fallback Course:", localCourse);
            setCourseData(localCourse);
          } else {
            toast.error(data.message || "Course not found");
          }
        }
      } catch (error) {
        console.error("Fetch Course Error:", error.message);

        // ✅ Dummy fallback on error
        const localCourse = dummyCourses.find((c) => String(c._id) === String(id));
        if (localCourse) {
          console.log("Fallback Course:", localCourse);
          setCourseData(localCourse);
        } else {
          toast.error(error.message || "Course not found");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, backendUrl]);

  // ✅ Check enrollment
  useEffect(() => {
    if (courseData && enrolledCourses?.length > 0) {
      const already = enrolledCourses.some(
        (c) => String(c.courseId) === String(courseData._id)
      );
      setIsAlreadyEnrolled(already);
    }
  }, [courseData, enrolledCourses]);

  // ✅ Toggle Section
  const toggleSection = (index) => {
    setOpenSection((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // ✅ Enroll Course
 const enrollCourse = async () => {
  try {
    if (!user && !userData) return toast.warn("Login to enroll");
    if (!courseData || !courseData._id) return toast.error("Course data not found");
    if (isAlreadyEnrolled) return toast.warn("Already enrolled");

    const token = await getToken();

    console.log("Sending request with:", {
      courseId: courseData._id,
      token: token ? "Token exists" : "No token"
    });

    const { data } = await axios.post(
      `${backendUrl}/api/user/purchase`,
      { courseId: courseData._id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    console.log("Enroll Response:", data);

    if (data.success) {
      if (data.session_url) {
        toast.info("Redirecting to payment gateway...");
        window.location.replace(data.session_url);
      } else {
        toast.success("Enrollment successful!");
        setIsAlreadyEnrolled(true);
      }
      fetchUserEnrolledCourses();
    } else {
      if (data.message === 'You have already purchased this course' ||
          data.message === 'You are already enrolled in this course') {
        toast.warn(data.message);
      } else {
        console.warn("Backend purchase failed:", data.message);
        toast.error(`Enrollment failed: ${data.message}`);
      }
    }
  } catch (error) {
    console.error("Enroll Error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      toast.error("Course or user not found. Please refresh the page.");
    } else if (error.response?.status === 401) {
      toast.error("Please login again");
    } else {
      toast.error("Enrollment failed. Please try again.");
    }
  }
};
  // ✅ Loading State
  if (loading) return <Loading />;

  // ✅ No Course Found
  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-medium text-red-500">
        Course Not Found
      </div>
    );
  }

  return (
    <>
      <div className="flex md:flex-row w-full flex-col-reverse gap-10 relative items-start justify-baseline text-left">
        {/* Gradient background */}
        <div className="flex flex-col justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 bg-gradient-to-b from-cyan-100/70">
          {/* Left column */}
          <div className="max-w-xl ml-14 z-10 text-gray-500">
            <h1 className="text-xl md:text-4xl font-semibold text-gray-800">
              {courseData.courseTitle}
            </h1>
            <p
              className="pt-4 md:text-base text-sm"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription?.slice(0, 200) || "",
              }}
            ></p>

            {/* Rating */}
            <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
              <p>{calculateRating(courseData)}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={
                      i < Math.floor(calculateRating(courseData))
                        ? assets.star
                        : assets.star_blank
                    }
                    alt={`star-${i}`}
                    className="w-3.5 h-3.5"
                  />
                ))}
              </div>
              <p className="text-gray-500">
                ({courseData.courseRatings?.length || 0}{" "}
                {courseData.courseRatings?.length > 1 ? "ratings" : "rating"})
              </p>
              <p className="text-blue-600">
                {courseData.enrolledStudents?.length || 0}{" "}
                {courseData.enrolledStudents?.length > 1
                  ? "students"
                  : "student"}
              </p>
            </div>

            <p className="text-sm">
              Course buy <span className="text-blue-600 underline">Learnify</span>
            </p>
          </div>

          {/* Course structure */}
          <div className="pt-8 ml-14 text-gray-800">
            <h2 className="text-xl font-semibold">Course structure</h2>
            <div className="pt-5">
              {courseData.courseContent?.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white w-96 mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSection[index] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow_icon"
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                  </div>
                  <div className="mb-0.5 ml-0.5">
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent?.length || 0} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSection[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent?.map((lecture, i) => (
                        <li key={i} className="flex items-center gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="play_icon"
                            className="w-4 h-4"
                          />
                          <div className="flex items-center justify-between w-2xs text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: getYoutubeVideoId(lecture.lectureUrl),
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Preview
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Description */}
          <div className="py-2 ml-14 text-sm md:text-default">
            <h3 className="text-xl text-gray-800 font-semibold">
              Course Description
            </h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription || "",
              }}
            ></p>
          </div>
        </div>

        {/* Right column */}
        <div className="max-w-[380px] z-10 mt-10 mr-5 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-gray-100">
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img
              src={courseData.courseThumbnail}
              alt="course_thumbnail"
              className="w-full"
            />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time_left_clock_icon"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}{" "}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency} {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star_icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock_star_icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson_icon" />
                <p>{calculateNoOfLecture(courseData)} lessons</p>
              </div>
            </div>
            <button
              onClick={enrollCourse}
              className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
            >
              {isAlreadyEnrolled
                ? "Already Enrolled"
                : courseData &&
                  (courseData.coursePrice -
                    (courseData.discount * courseData.coursePrice) / 100) > 0
                ? "Pay"
                : "Enroll Now"}
            </button>
            <div className="pt-2 text-sm text-gray-600">
              {courseData &&
                (courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100) >
                  0 && (
                  <p>
                    Pay securely with Stripe card payment. Your purchase will be
                    saved and available when you log in again.
                  </p>
                )}
            </div>
            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">
                What's in the course
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance</li>
                <li>Downloadable resources and source code</li>
                <li>Quizzes to test your knowledge</li>
                <li>Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;
