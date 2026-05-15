import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/StudentFooter';
import axios from 'axios';
import { toast } from 'react-toastify';

const Player = () => {
  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const getCourseData = async () => {
      // First try to find in enrolled courses
      const course = enrolledCourses.find((course) => course._id === courseId);
      if (course) {
        setCourseData(course);
        return;
      }

      // If not found in enrolled courses, fetch directly from backend
      try {
        const token = await getToken();
        const response = await fetch(`${backendUrl}/api/course/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setCourseData(data.courseData);
        } else {
          console.error('Failed to fetch course:', data.message);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    getCourseData();
  }, [courseId, enrolledCourses, backendUrl, getToken]);

  const fetchProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setProgressData(data.progress);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userData && courseId) {
      fetchProgress();
    }
  }, [userData, courseId]);

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/mark-complete`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Lecture marked as completed");
        setProgressData(data.progress);
      }
    } catch (error) {
      toast.error("Failed to mark lecture as completed");
    }
  };

  const isLectureCompleted = (lectureId) => {
    return progressData && progressData.completedLectures && progressData.completedLectures.includes(lectureId);
  };

  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRatingClick = async (value) => {
    setRating(value);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/rate`,
        { courseId, rating: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message || "Rating updated");
      } else {
        toast.error(data.message || "Failed to update rating");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while rating");
    }
  };

  // Safe YouTube ID extractor
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Check if URL is from Cloudinary
  const isCloudinaryUrl = (url) => {
    return url && url.includes('cloudinary.com');
  };

  // Get file type from Cloudinary URL
  const getCloudinaryFileType = (url) => {
    if (!url) return null;
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) return 'video';
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif')) return 'image';
    if (url.includes('.pdf')) return 'pdf';
    return 'unknown';
  };

  const getTotalLectures = () => {
    return courseData?.courseContent?.reduce(
      (sum, chapter) => sum + (chapter.chapterContent?.length || 0),
      0
    );
  };

  const getCompletedLecturesCount = () => {
    return progressData?.completedLectures?.length || 0;
  };

  const getCompletionPercentage = () => {
    const total = getTotalLectures();
    const completed = getCompletedLecturesCount();
    return total ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course structure</h2>
          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white w-96 mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${openSection[index] ? 'rotate-180' : ''
                          }`}
                        src={assets.down_arrow_icon}
                        alt="arrow_icon"
                      />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                  </div>
                  <div className="mb-0.5 ml-0.5">
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openSection[index] ? 'max-h-96' : 'max-h-0'
                      }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-center gap-2 py-1">
                          <img
                            src={isLectureCompleted(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                            alt="play_icon"
                            className="w-4 h-4"
                          />
                          <div className="flex items-center justify-between w-2xs text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Watch
                                </p>
                              )}
                              <p>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ['h', 'm'],
                                })}
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
          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this course :</h1>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl cursor-pointer ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              {getYoutubeVideoId(playerData.lectureUrl) ? (
                // YouTube Video
                <YouTube
                  videoId={getYoutubeVideoId(playerData.lectureUrl)}
                  iframeClassName="w-full aspect-video"
                />
              ) : isCloudinaryUrl(playerData.lectureUrl) ? (
                // Cloudinary Content
                (() => {
                  const fileType = getCloudinaryFileType(playerData.lectureUrl);
                  switch (fileType) {
                    case 'video':
                      return (
                        <video
                          controls
                          className="w-full aspect-video"
                          src={playerData.lectureUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      );
                    case 'image':
                      return (
                        <img
                          src={playerData.lectureUrl}
                          alt={playerData.lectureTitle}
                          className="w-full max-h-96 object-contain"
                        />
                      );
                    case 'pdf':
                      return (
                        <iframe
                          src={playerData.lectureUrl}
                          className="w-full aspect-video"
                          title={playerData.lectureTitle}
                        />
                      );
                    default:
                      return (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-gray-600 mb-2">Unsupported file type</p>
                            <a
                              href={playerData.lectureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Open in new tab
                            </a>
                          </div>
                        </div>
                      );
                  }
                })()
              ) : (
                // External Link (non-YouTube, non-Cloudinary)
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">External content</p>
                    <a
                      href={playerData.lectureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Open content
                    </a>
                  </div>
                </div>
              )}
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter} . {playerData.lecture} {playerData.lectureTitle}</p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  disabled={isLectureCompleted(playerData.lectureId)}
                  className={`font-medium ${isLectureCompleted(playerData.lectureId) ? 'text-green-500 cursor-not-allowed' : 'text-blue-500 hover:underline'}`}
                >
                  {isLectureCompleted(playerData.lectureId) ? 'Completed \u2714' : 'Mark Complete'}
                </button>
              </div>
              <div className='mt-3 text-sm text-gray-600'>
                Course completion: {getCompletedLecturesCount()} / {getTotalLectures()} lectures ({getCompletionPercentage()}%)
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
          )
          }
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;