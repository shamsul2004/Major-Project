import React, { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddCourse = () => {
  // Refs for editor
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const { backendUrl, getToken } = React.useContext(AppContext);

  // Form state
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [chapters, setChapters] = useState([]);

  // Lecture popup state
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // Initialize Quill editor
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered'}, { list: 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        },
        placeholder: 'Write course description here...',
      });
    }
  }, []);

  // Handle image upload preview
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview('');
    }
  }, [image]);

  // Chapter handlers
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter chapter name:');
      if (title) {
        const newChapter = {
          chapter: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length + 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      if (window.confirm('Are you sure you want to delete this chapter and all its lectures?')) {
        setChapters(chapters.filter((chapter) => chapter.chapter !== chapterId));
      }
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapter === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  // Lecture handlers
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setLectureDetails({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
      });
      setShowPopup(true);
    } else if (action === 'remove') {
      if (window.confirm('Are you sure you want to delete this lecture?')) {
        setChapters(
          chapters.map((chapter) => {
            if (chapter.chapter === chapterId) {
              const updatedContent = [...chapter.chapterContent];
              updatedContent.splice(lectureIndex, 1);
              return { ...chapter, chapterContent: updatedContent };
            }
            return chapter;
          })
        );
      }
    }
  };

  // Add lecture to chapter
  const addLectureToChapter = () => {
    if (!lectureDetails.lectureTitle) {
      alert('Lecture title is required');
      return;
    }

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapter === currentChapterId) {
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, lectureDetails],
          };
        }
        return chapter;
      })
    );
    setShowPopup(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle) {
      toast.error('Course title is required');
      return;
    }
    if (chapters.length === 0) {
      toast.error('Please add at least one chapter');
      return;
    }
    if (!image) {
      toast.error('Please select a course thumbnail');
      return;
    }

    try {
      const formattedChapters = chapters.map((chapter, chapterIndex) => ({
        chapterId: chapter.chapter,
        chapterOrder: chapter.chapterOrder || chapterIndex + 1,
        chapterTitle: chapter.chapterTitle,
        chapterContent: chapter.chapterContent.map((lecture, lectureIndex) => ({
          lectureId: lecture.lectureId || uniqid(),
          lectureDuration: Number(lecture.lectureDuration),
          lectureTitle: lecture.lectureTitle,
          lectureUrl: lecture.lectureUrl,
          isPreviewFree: Boolean(lecture.isPreviewFree),
          lectureOrder: lectureIndex + 1,
        })),
      }));

      const courseData = {
        courseTitle,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: formattedChapters,
        courseDescription: quillRef.current?.root.innerHTML || '',
        isPublished: true,
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);

      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/educator/add-course`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message || 'Course saved successfully!');
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        if (quillRef.current) quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message || 'Failed to add course');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="h-screen overflow-auto p-4 md:p-8 bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Course</h1>

        {/* Course Basic Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Course Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Course Title*</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Introduction to React"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Course Price (₹)</label>
              <input
                type="number"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                min="0"
                className="w-full p-3 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
                max="100"
                className="w-full p-3 border rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Course Thumbnail</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="p-3 bg-blue-500 rounded text-white">
                  <img src={assets.file_upload_icon} alt="Upload" className="w-5 h-5" />
                </div>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <span className="text-gray-500">Choose an image</span>
                )}
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Course Description*</label>
            <div ref={editorRef} className="h-64 border rounded"></div>
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Course Curriculum</h2>

          {chapters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No chapters added yet</p>
            </div>
          )}

          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapter} className="mb-6 border rounded-lg overflow-hidden">
              {/* Chapter Header */}
              <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChapter('toggle', chapter.chapter)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <img
                      src={assets.dropdown_icon}
                      alt={chapter.collapsed ? 'Expand' : 'Collapse'}
                      className={`w-4 h-4 transition-transform ${chapter.collapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                  <h3 className="font-medium">
                    Chapter {chapterIndex + 1}: {chapter.chapterTitle}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({chapter.chapterContent.length} lectures)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLecture('add', chapter.chapter)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Lecture
                  </button>
                  <button
                    onClick={() => handleChapter('remove', chapter.chapter)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <img src={assets.cross_icon} alt="Delete" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lectures List */}
              {!chapter.collapsed && (
                <div className="divide-y">
                  {chapter.chapterContent.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No lectures in this chapter yet
                    </div>
                  ) : (
                    chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div key={lectureIndex} className="flex justify-between items-center p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium">
                            {lectureIndex + 1}. {lecture.lectureTitle}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Duration: {lecture.lectureDuration} mins</span>
                            {lecture.lectureUrl && (
                              <>
                                <span className="mx-2">•</span>
                                <a
                                  href={lecture.lectureUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Content
                                </a>
                              </>
                            )}
                            {lecture.isPreviewFree && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600">Free Preview</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleLecture('remove', chapter.chapter, lectureIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <img src={assets.cross_icon} alt="Delete" className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleChapter('add')}
            className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            + Add New Chapter
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Course
          </button>
        </div>
      </form>

      {/* Add Lecture Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Lecture</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <img src={assets.cross_icon} alt="Close" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Lecture Title*</label>
                <input
                  type="text"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) => setLectureDetails({...lectureDetails, lectureDuration: e.target.value})}
                  min="1"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Content URL</label>
                <input
                  type="url"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})}
                  placeholder="https://example.com/video"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="freePreview"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) => setLectureDetails({...lectureDetails, isPreviewFree: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="freePreview" className="text-gray-700">
                  Available as free preview
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLectureToChapter}
                disabled={!lectureDetails.lectureTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                Add Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;