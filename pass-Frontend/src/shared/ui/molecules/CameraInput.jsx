import {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

export const CameraInput = forwardRef(
  ({ onCapture, width = "300px", height = "200px" }, ref) => {
    const videoRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Expose logic to the main page
    useImperativeHandle(ref, () => ({
      takePhoto: () => {
        return new Promise((resolve) => {
          if (!videoRef.current || capturedImage) {
            // If already captured, resolve with null or logic to return existing blob
            resolve(null);
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            setCapturedImage(dataUrl);
            canvas.toBlob(
              (blob) => {
                onCapture(blob);
                resolve(blob);
              },
              "image/jpeg",
              0.95,
            );
          } else {
            resolve(null);
          }
        });
      },
      resetCamera: () => {
        setCapturedImage(null);
      },
    }));

    useEffect(() => {
      // Start stream only if no image is captured yet
      if (!capturedImage) {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
              if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch((err) => console.error("Camera access denied", err));
      }
      // Cleanup: stop tracks when component unmounts
      return () => {
        if (videoRef.current?.srcObject) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          const stream = videoRef.current.srcObject;
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }, [capturedImage]);

    return (
      <div
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#000",
        }}
      >
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay={true}
            playsInline={true}
            muted={true}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
    );
  },
);
