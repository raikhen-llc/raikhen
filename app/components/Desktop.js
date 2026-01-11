import MatrixRain from "./MatrixRain";

export default function Desktop({ children }) {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] relative overflow-hidden pt-7"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(0, 255, 0, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      <MatrixRain />
      {children}
      <div className="fixed bottom-4 right-4 text-[#AAA] text-xs z-0">
        © {new Date().getFullYear()} Raikhen LLC
      </div>
    </div>
  );
}
