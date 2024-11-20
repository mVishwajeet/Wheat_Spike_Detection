import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [selectedModel, setSelectedModel] = useState("detr");
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 1, height: 1 });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setBoundingBoxes([]);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setOriginalImageDimensions({ width: img.width, height: img.height });
      setImagePreview(img.src);
    };
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("model", selectedModel);

    try {
      const response = await axios.post(
        "https://aea9-35-231-229-198.ngrok-free.app/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setBoundingBoxes(response.data.boxes);
    } catch (error) {
      console.error("Error predicting bounding boxes:", error);
      alert("Failed to get predictions. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      {/* Header */}
      <header className="bg-blue-600 w-full py-4 text-white text-center text-2xl font-bold shadow-md">
        Wheat Spike Detection
      </header>

      {/* Upload Section */}
      <div className="mt-6 flex flex-col items-center">
        <label className="text-lg font-medium text-gray-700">Upload an Image:</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Model Selection */}
      <div className="mt-4 flex flex-col items-center">
        <label className="text-lg font-medium text-gray-700">Select a Model:</label>
        <select
          onChange={(e) => setSelectedModel(e.target.value)}
          value={selectedModel}
          className="mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
        >
          <option value="detr">DETR</option>
          <option value="yolo">YOLOv5</option>
          <option value="faster_rcnn">Faster R-CNN</option>
        </select>
      </div>

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition duration-300"
      >
        Predict
      </button>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-6 relative flex justify-center">
          <img
            src={imagePreview}
            alt="Uploaded"
            className="rounded-lg shadow-lg max-w-xl"
            style={{width: "500px"}}
          />
          {boundingBoxes.map((box, index) => {
            const scaleX = 500 / originalImageDimensions.width;
            const scaleY = 500 / originalImageDimensions.height;

            const scaledBox = [
              box[0] * scaleX, // x_min
              box[1] * scaleY, // y_min
              (box[2] - box[0]) * scaleX, // width
              (box[3] - box[1]) * scaleY, // height
            ];

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: scaledBox[1],
                  left: scaledBox[0],
                  width: scaledBox[2],
                  height: scaledBox[3],
                  border: "2px solid red",
                }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
