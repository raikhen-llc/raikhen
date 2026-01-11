import "./globals.css";

export const metadata = {
  title: "Raikhen | AI Consulting & Custom Software",
  description:
    "AI consulting services and custom software development. Transform your business with intelligent solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
