import React, { useEffect, useState } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  // Fade-in animation on component mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleLearnMore = () => {
    // You can replace this with your actual "Learn More" functionality
    window.open("https://aws.amazon.com/cloudwatch/", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d1b2a",
        color: "#38bdf8",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        margin: "0",
        padding: "0",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          padding: "15px 0",
          backgroundColor: "rgba(10, 21, 34, 0.95)",
          textAlign: "center",
          fontSize: "clamp(18px, 4vw, 24px)", // Responsive font size
          fontWeight: "bold",
          color: "#38bdf8",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(5px)",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span role="img" aria-label="rocket">🚀</span> AWS CloudWatch Monitoring
      </header>

      {/* Content */}
      <div 
        style={{ 
          maxWidth: "800px", 
          width: "90%", 
          marginTop: "60px",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          padding: "20px"
        }}
      >
        <h1 
          style={{ 
            fontSize: "clamp(32px, 6vw, 42px)", 
            fontWeight: "bold", 
            color: "#38bdf8", 
            marginBottom: "10px",
            lineHeight: 1.2
          }}
        >
          AWS CloudWatch Dashboard
        </h1>
        <p 
          style={{ 
            fontSize: "clamp(16px, 3vw, 18px)", 
            color: "#d1d5db", 
            marginBottom: "30px",
            maxWidth: "600px",
            margin: "0 auto 30px"
          }}
        >
          Monitor & analyze your AWS EC2 instances in real-time with AI-driven insights.
        </p>

        {/* Feature Highlights */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "30px"
          }}
        >
          <div 
            style={{ 
              backgroundColor: "rgba(38, 99, 235, 0.1)", 
              padding: "15px", 
              borderRadius: "10px",
              flex: "1 1 150px",
              maxWidth: "200px"
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>📊</div>
            <h3 style={{ color: "#38bdf8", marginBottom: "5px" }}>Real-time Metrics</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Monitor your EC2 instances in real-time</p>
          </div>
          
          <div 
            style={{ 
              backgroundColor: "rgba(38, 99, 235, 0.1)", 
              padding: "15px", 
              borderRadius: "10px",
              flex: "1 1 150px",
              maxWidth: "200px"
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>🤖</div>
            <h3 style={{ color: "#38bdf8", marginBottom: "5px" }}>AI Predictions</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Forecast future resource usage</p>
          </div>
          
          <div 
            style={{ 
              backgroundColor: "rgba(38, 99, 235, 0.1)", 
              padding: "15px", 
              borderRadius: "10px",
              flex: "1 1 150px",
              maxWidth: "200px"
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚡</div>
            <h3 style={{ color: "#38bdf8", marginBottom: "5px" }}>Fast & Responsive</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Optimized for all devices</p>
          </div>
        </div>

        {/* Buttons */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "14px",
            flexWrap: "wrap"
          }}
        >
          <button
            style={{
              padding: "14px 24px",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: "clamp(16px, 3vw, 18px)",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "30px",
              boxShadow: "0px 4px 12px rgba(56, 189, 248, 0.4)",
              border: "none",
              outline: "none",
              minWidth: "160px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onClick={handleScroll}
            aria-label="Get Started"
          >
            Get Started
          </button>
          <button
            style={{
              padding: "14px 24px",
              backgroundColor: "transparent",
              color: "#38bdf8",
              fontSize: "clamp(16px, 3vw, 18px)",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "30px",
              border: "2px solid #38bdf8",
              outline: "none",
              minWidth: "160px",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#38bdf8";
              e.target.style.color = "#0d1b2a";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#38bdf8";
            }}
            onClick={handleLearnMore}
            aria-label="Learn More"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        style={{
          position: "absolute",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "pointer",
          animation: "bounce 2s infinite",
          opacity: 0.7,
        }}
        onClick={handleScroll}
        aria-label="Scroll down"
      >
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7 10L12 15L17 10" 
            stroke="#38bdf8" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>

      {/* Animated Waves */}
      <div 
        style={{ 
          position: "absolute", 
          bottom: "0", 
          width: "100%", 
          height: "100px", 
          overflow: "hidden", 
          lineHeight: "0",
          zIndex: 1
        }}
      >
        <svg 
          viewBox="0 0 1200 250" 
          preserveAspectRatio="none" 
          style={{ width: "100%", height: "100%" }}
          aria-hidden="true"
        >
          <path
            d="M0,224L40,218.7C80,213,160,203,240,202.7C320,203,400,213,480,202.7C560,192,640,160,720,144C800,128,880,128,960,149.3C1040,171,1120,213,1200,224L1200,250L0,250Z"
            fill="#173d6d"
            fillOpacity="1"
          ></path>
        </svg>
      </div>

      {/* Background Particles */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              borderRadius: "50%",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
            100% {
              transform: translateY(0) translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
