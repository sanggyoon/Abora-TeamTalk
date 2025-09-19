// components/CustomCursor.jsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./CustomCursor.css";

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            gsap.to(cursorRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out",
            });
        };

        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, []);

    return <div ref={cursorRef} className="custom-cursor" />;
};

export default CustomCursor;
