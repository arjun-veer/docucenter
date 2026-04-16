import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "JobExam - Platform for Youth";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            color: "white",
            padding: "20px 40px",
            borderRadius: "16px",
            marginBottom: "40px",
            fontSize: 80,
            fontWeight: "bold",
          }}
        >
          JobExam
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "black",
            textAlign: "center",
            padding: "0 80px",
            marginBottom: "20px",
          }}
        >
          Jobs, Exams & Placements in one place.
        </div>
        <div style={{ fontSize: 32, color: "#666" }}>
          Empowering the youth for a better future.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
