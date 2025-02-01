import { Check } from "lucide-react";
import React from "react";

type variant = "success" | "error";
type variants = {
    success: {
        background: string;
        text: string;
        border: string;
        icon: any;
    };
    error: {
        background: string;
        text: string;
        border: string;
        icon: any;
    };
};

const Toast = ({ t, variant, message }: { t: any, variant: variant, message: string }) => {
    const variants: variants = {
        success: {
            background: "bg-green-200",
            text: "text-green-800",
            border: "border-green-300",
            icon: <Check className="w-5 h-5 text-green-800 mr-2 flex-shrink-0" />,
        },
        error: {
            background: "bg-red-200",
            text: "text-red-700",
            border: "border-red-300",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-red-700 mr-2 flex-shrink-0"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
    };

    const currentVariant = variants[variant];

    return (
        <div
            className={`flex items-center p-4 border-l-4 shadow-lg rounded-md relative ${currentVariant.background
                } ${currentVariant.border} ${t.visible ? "animate-enter" : "animate-leave"
                }`}
            style={{ minWidth: "250px", maxWidth: "300px" }}
        >
            {currentVariant.icon}
            <div className={`flex-grow ${currentVariant.text}`}>
                <p className="text-sm">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default Toast;
