import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const setUserFromVerification = useAuthStore((s) => s.setUserFromVerification);

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
        setMessage(res.data.message || "Email verified. Your account is ready.");

        if (res.data.user) {
          setUserFromVerification(res.data.user);
          toast.success("Welcome! Your account is ready.");
          navigate("/", { replace: true });
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Invalid or expired verification link. Please sign up again to get a new link."
        );
      }
    };

    verify();
  }, [token, setUserFromVerification, navigate]);

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
              <p className="text-sm text-base-content/60">Redirecting you to the app...</p>
              <Link to="/" className="btn btn-primary mt-2">
                Go to homepage
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
