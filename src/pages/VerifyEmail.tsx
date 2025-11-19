import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { authAPI } from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      const id = searchParams.get("id");

      if (!token || !id) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const result = await authAPI.verifyEmail(id, token);
        if (result.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Verification failed");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Verification failed. The link may have expired.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-2">
              <Button variant="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
              <Button variant="default" onClick={() => navigate("/resend-verification")}>
                Resend Verification Email
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

