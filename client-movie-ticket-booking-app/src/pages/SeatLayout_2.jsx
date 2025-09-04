import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRight, ClockIcon, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";

const SeatLayout_2 = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  // New states for zoom/pan functionality
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const seatContainerRef = useRef(null);
  const navigate = useNavigate();

  console.log("isMobile:", isMobile);
  console.log("scale:", scale);
  console.log("selectedSeats:", selectedSeats);
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
    console.log(show);
  };

  useEffect(() => {
    getShow();
  }, []);

  // Zoom functions
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.3, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.3, 0.7));
  };

  const handleResetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // Pan functions
  const handlePanStart = (clientX, clientY) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - translateX,
      y: clientY - translateY,
    });
  };

  const handlePanMove = (clientX, clientY) => {
    if (!isDragging) return;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    const maxTranslate = 150;
    setTranslateX(Math.max(-maxTranslate, Math.min(maxTranslate, newX)));
    setTranslateY(Math.max(-maxTranslate, Math.min(maxTranslate, newY)));
  };

  const handlePanEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handlePanStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handlePanMove(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handlePanStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      handlePanMove(touch.clientX, touch.clientY);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first!");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can only select 5 seats!");
    }
    setSelectedSeats((pre) => (pre.includes(seatId) ? pre.filter((seat) => seat !== seatId) : [...pre, seatId]));
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border
              border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-primary text-white"}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Add global mouse/touch event listeners
  useEffect(() => {
    if (isMobile && isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handlePanEnd();
      const handleGlobalTouchMove = (e) => handleTouchMove(e);
      const handleGlobalTouchEnd = () => handlePanEnd();

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      document.addEventListener("touchend", handleGlobalTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
      };
    }
  }, [isDragging, isMobile, dragStart]);

  return show ? (
    <div>
      <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30">
        {/* Available Timing */}
        <div
          className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max
        md:sticky md:top-20"
        >
          <p className="text-lg font-semibold px-6">Available Timings</p>
          <div className="mt-5 space-y-1">
            {show.dateTime[date].map((item) => (
              <div
                key={item.time}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
            ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">{isoTimeFormat(item.time)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seats Layout */}
        <div className="relative flex flex-1 flex-col items-center max-md:mt-16">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle top="0px" left="0px" />
          <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>

          {/* Mobile Zoom Controls */}
          {isMobile && (
            <div className="flex gap-2 mb-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-md border">
              <button onClick={handleZoomOut} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" disabled={scale <= 0.7}>
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={handleResetZoom} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handleZoomIn} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" disabled={scale >= 2.5}>
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {isMobile && <p className="text-sm text-gray-500 mb-4 text-center">Zoom và kéo để xem • Đã chọn: {selectedSeats.length}/5 ghế</p>}

          {/* Seat Container with Zoom/Pan for Mobile */}
          <div className={`${isMobile ? "overflow-hidden w-full max-w-sm h-96 bg-white/50 backdrop-blur-sm rounded-lg border p-4" : ""}`}>
            <div
              ref={seatContainerRef}
              className={`${isMobile ? "select-none" : ""}`}
              style={{
                transform: isMobile ? `scale(${scale}) translate(${translateX}px, ${translateY}px)` : "none",
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.2s ease-out",
                cursor: isMobile ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              onMouseDown={isMobile ? handleMouseDown : undefined}
              onTouchStart={isMobile ? handleTouchStart : undefined}
            >
              <div className="flex flex-col items-center">
                <img src={assets.screenImage} alt="screen" />
                <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

                <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">{groupRows[0].map((row) => renderSeats(row))}</div>
                  <div className="grid gap-11 grid-cols-2">
                    {groupRows.slice(1).map((group, index) => (
                      <div key={index}>{group.map((row) => renderSeats(row))}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              navigate("/my-bookings");
              scrollTo(0, 0);
            }}
            className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full 
          font-medium cursor-pointer active:scale-95"
          >
            Process to Checkout
            <ArrowRight strokeWidth={3} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout_2;
