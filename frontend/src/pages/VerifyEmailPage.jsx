import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axiosInstance.get("/auth/verify-email", {
          params: { token },
        });
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully. You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Invalid or expired verification link. Please request a new one."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-200">
      <div className="w-full max-w-md rounded-2xl bg-base-100 shadow-lg p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Email Verification</h1>

          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-base-content/70">Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-14 h-14 text-success" />
              <p className="text-base-content/80">{message}</p>
              <Link to="/login" className="btn btn-primary mt-2">
                Sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-14 h-14 text-error" />
              <p className="text-base-content/80">{message}</p>
              <div className="flex gap-2 mt-2">
                <Link to="/login" className="btn btn-ghost">
                  Sign in
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Create account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
