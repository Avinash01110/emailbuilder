import React, { useState, useEffect } from "react";
import {
  Upload,
  Save,
  Download,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  GripVertical,
  Plus,
  X,
  Eye,
} from "lucide-react";
import { emailService } from "../services/api";
import { TailSpin } from "react-loader-spinner";
import { toast } from 'react-toastify';

const EmailBuilder = () => {
  const id = process.env.REACT_APP_EMAIL_BUILDER_ID;

  const [layout, setLayout] = useState("");
  const [sections, setSections] = useState([]);
  const [emailConfig, setEmailConfig] = useState({
    title: "",
    content: "",
    images: [],
  });
  const [selectedSection, setSelectedSection] = useState(null);
  const [styleConfig, setStyleConfig] = useState({
    fontSize: "16",
    color: "#000000",
    textAlign: "left",
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    lineHeight: "1.5",
  });
  const [loading, setLoading] = useState({loading: false, uploadingImage :false});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [savedTemplateId, setSavedTemplateId] = useState(null);

  // Fetch existing template data if ID is provided
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (id) {
        setLoading({loading:true});
        try {
          const response = await emailService.getEmailId(id);
          const templateData = response.data;

          // Set email config
          setEmailConfig({
            title: templateData.title,
            content: templateData.content,
            images: templateData.images || [],
          });

          // Set style config
          if (templateData.styles) {
            setStyleConfig(templateData.styles);
          }

          // Transform content into sections
          const contentSections = templateData.content.map((item, index) => ({
            id: Date.now() + index,
            type: item.type,
            content: item.content,
            styles: item.styles || styleConfig,
          }));

          setSections(contentSections);
          setSavedTemplateId(id);
        } catch (error) {
          console.error("Error loading template:", error);
        }
        setLoading({loading:false});
      }
    };

    fetchTemplateData();
  }, [id]);

  // Initialize with empty sections if no template is loaded
  useEffect(() => {
    if (!id && sections.length === 0) {
      setSections([
        { id: 1, type: "text", content: "", styles: { ...styleConfig } },
        { id: 2, type: "image", content: "", styles: { ...styleConfig } },
      ]);
    }
  }, [id]);

  useEffect(() => {
    fetchEmailLayout();
  }, []);

  const fetchEmailLayout = async () => {
    setLoading({loading:true});
    try {
      const response = await emailService.getEmailLayout();
      setLayout(response.layout);
    } catch (error) {
      console.error("Error fetching layout:", error);
    }
    setLoading({loading:false});
  };

  const handleImageUpload = async (sectionId, e) => {    
    setLoading({uploadingImage:true});
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const uploadResult = await emailService.uploadImage(file);
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? { ...section, content: uploadResult.url }
            : section
        )
      );
      setEmailConfig((prev) => ({
        ...prev,
        images: [...prev.images, uploadResult.url],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }finally{
      setLoading({uploadingImage:false});
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading({loading:true});
      const config = {
        title: emailConfig.title,
        content: sections.map((section) => ({
          type: section.type,
          content: section.content,
          styles: section.styles,
        })),
        images: sections
          .filter((section) => section.type === "image" && section.content)
          .map((section) => section.content),
        styles: styleConfig,
      };

      if (savedTemplateId) {
        // Update existing template
        await emailService.updateEmailId(savedTemplateId, config);
      } else {
        // Create new template
        const response = await emailService.saveEmailConfig(config);
        setSavedTemplateId(response.id);
      }

      toast.success("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setLoading({loading:false});
    }
  };

  const handleDownloadTemplate = async () => {
    if (!savedTemplateId) {
      alert("Please save the template first");
      return;
    }

    await handleSaveTemplate();

    try {
      setLoading({loading:true});
      await emailService.downloadTemplate(savedTemplateId);
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    } finally {
      setLoading({loading:false});
    }
  };

  const handleDragStart = (e, section) => {
    setDraggedSection(section);
    setIsDragging(true);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const newSections = [...sections];
    const draggedIndex = sections.findIndex((s) => s.id === draggedSection.id);
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    setSections(newSections);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedSection(null);
  };

  const addNewSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      content: "",
      styles: { ...styleConfig },
    };
    setSections([...sections, newSection]);
  };

  const updateSectionContent = (id, content) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
  };

  const updateSectionStyles = (id, styles) => {
    setSections(
      sections.map((section) =>
        section.id === id
          ? {
              ...section,
              styles: {
                ...section.styles,
                ...styles,
                // Ensure font size has 'px' unit
                fontSize: styles.fontSize
                  ? `${styles.fontSize}px`
                  : section.styles.fontSize,
              },
            }
          : section
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Email Builder</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Add Title Input */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter template title"
              value={emailConfig.title}
              onChange={(e) =>
                setEmailConfig((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Enhanced Editor */}
          <div
            className={`w-full ${
              showPreview ? "lg:w-1/2" : "lg:w-full"
            } space-y-6`}
          >
            {/* Section Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sections
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addNewSection("text")}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Text
                  </button>
                  <button
                    onClick={() => addNewSection("image")}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Add Image
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border rounded-lg p-4 ${
                      selectedSection === section.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {section.type === "text"
                            ? "Text Section"
                            : "Image Section"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSections(
                            sections.filter((s) => s.id !== section.id)
                          );
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {section.type === "text" ? (
                      <div className="space-y-3">
                        <textarea
                          value={section.content}
                          onChange={(e) =>
                            updateSectionContent(section.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                          style={{
                            fontSize: section.styles.fontSize || "16px",
                            color: section.styles.color || "#000000",
                            fontWeight: section.styles.fontWeight || "normal",
                            fontStyle: section.styles.fontStyle || "normal",
                            textDecoration:
                              section.styles.textDecoration || "none",
                            textAlign: section.styles.textAlign || "left",
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={(section.styles.fontSize || "16").replace(
                              "px",
                              ""
                            )}
                            onChange={(e) =>
                              updateSectionStyles(section.id, {
                                fontSize: e.target.value,
                              })
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm"
                          >
                            {[
                              "12",
                              "14",
                              "16",
                              "18",
                              "20",
                              "24",
                              "28",
                              "32",
                            ].map((size) => (
                              <option key={size} value={size}>
                                {size}px
                              </option>
                            ))}
                          </select>
                          <div className="flex border border-gray-200 rounded-lg">
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  fontWeight:
                                    section.styles.fontWeight === "bold"
                                      ? "normal"
                                      : "bold",
                                })
                              }
                              className={`p-1 ${
                                section.styles.fontWeight === "bold"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  fontStyle:
                                    section.styles.fontStyle === "italic"
                                      ? "normal"
                                      : "italic",
                                })
                              }
                              className={`p-1 ${
                                section.styles.fontStyle === "italic"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  textDecoration:
                                    section.styles.textDecoration ===
                                    "underline"
                                      ? "none"
                                      : "underline",
                                })
                              }
                              className={`p-1 ${
                                section.styles.textDecoration === "underline"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex border border-gray-200 rounded-lg">
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  textAlign: "left",
                                })
                              }
                              className={`p-1 ${
                                section.styles.textAlign === "left"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  textAlign: "center",
                                })
                              }
                              className={`p-1 ${
                                section.styles.textAlign === "center"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateSectionStyles(section.id, {
                                  textAlign: "right",
                                })
                              }
                              className={`p-1 ${
                                section.styles.textAlign === "right"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="color"
                            value={section.styles.color || styleConfig.color}
                            onChange={(e) =>
                              updateSectionStyles(section.id, {
                                color: e.target.value,
                              })
                            }
                            className="w-8 h-8 p-0 border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.content ? (
                          <div className="relative group">
                            <img
                              src={section.content}
                              alt="Uploaded content"
                              className="max-w-full h-auto rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                              <label className="cursor-pointer p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50">
                                <span className="text-sm text-gray-600">
                                  Replace Image
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(section.id, e)
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100">
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="mt-2 text-sm text-gray-500">
                                Drop image here or click to upload
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(section.id, e)
                                }
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Enhanced Preview */}
          {showPreview && (
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h2>
                <div className="border rounded-lg p-6 min-h-[600px] bg-white">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      style={{
                        ...section.styles,
                        marginBottom: "1rem",
                      }}
                    >
                      {section.type === "text" ? (
                        <div>
                          {section.content || "Add your content here..."}
                        </div>
                      ) : (
                        section.content && (
                          <img
                            src={section.content}
                            alt=""
                            className="max-w-full h-auto rounded-lg"
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 right-6 flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
            disabled={loading.loading || loading.uploadingImage}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSaveTemplate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium text-white"
            disabled={loading.loading || loading.uploadingImage}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-green-600 rounded-lg shadow-sm hover:bg-green-700 text-sm font-medium text-white"
            // disabled={loading || !savedTemplateId}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>

        {/* Loading Indicator */}
        {(loading.loading || loading.uploadingImage) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-row gap-2 items-center justify-center bg-white p-4 rounded-lg">
              <TailSpin
                visible={true}
                height="20"
                width="20"
                color="#2563eb"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
              <p>{loading.loading ? "Loading..." : "Image Uploading..."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailBuilder;
