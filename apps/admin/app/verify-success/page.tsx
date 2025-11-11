import Link from "next/link";

export default function VerifySuccessPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        fontFamily: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl text-center space-y-4"
        style={{
          backgroundColor: "#fefefe",
          color: "#111827",
        }}
      >
        <h1 className="text-2xl font-semibold" style={{ color: "#de2429" }}>
          Email Verified Successfully
        </h1>
        <p className="text-sm" style={{ color: "#4b5563" }}>
          Your email address has been confirmed. You may now proceed to log in
          to your Sugo account.
        </p>
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          If you did not request this verification or believe this is a
          mistake, you can safely ignore this page.
        </p>
      </div>
    </main>
  );
}