"use client";

import { useState } from "react";

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("sent");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <p className="text-[#888]">$ ./contact.sh --interactive</p>
      <p className="text-[#00aa00]">Initialize contact sequence...</p>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label className="block text-[#888] text-sm mb-1">
            {">"} Enter your name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[#888] text-sm mb-1">
            {">"} Enter your email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-[#888] text-sm mb-1">
            {">"} Enter your message:
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 rounded resize-none"
            placeholder="Tell us about your project..."
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="px-6 py-2 bg-[#00ffff] text-[#0a0a0a] font-bold rounded hover:bg-[#00cccc] disabled:opacity-50"
        >
          {status === "sending" ? "$ sending..." : "$ ./send.sh"}
        </button>

        {status === "sent" && (
          <p className="text-[#00ff00] mt-2">
            [SUCCESS] Message transmitted successfully!
          </p>
        )}

        {status === "error" && (
          <p className="text-[#ff4444] mt-2">
            [ERROR] Failed to send message. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
