"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import style from "./page.module.css";
import common from "@/app/Components/common/common.module.css";
import TitleTextBlock from "@/app/Components/ui/TitleTextBlack/TitleTextBlock";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 로그인 처리
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // last_login 업데이트
                await supabase
                    .from("users")
                    .update({ last_login: new Date().toISOString() })
                    .eq("user_email", email);

                router.push("/OnboardingFirstPage");
            }
        } catch (error: any) {
            setError(error.message || "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 회원가입 처리
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Supabase Auth에 사용자 생성
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // users 테이블에 추가 정보 저장
                const { error: dbError } = await supabase.from("users").insert({
                    user_email: email,
                    user_password: password, // 실제로는 해시된 비밀번호를 저장해야 합니다
                    user_name: name,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                });

                if (dbError) throw dbError;

                router.push("/OnboardingFirstPage");
            }
        } catch (error: any) {
            setError(error.message || "회원가입에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={common.container}>
            <h3 className={style.headerText}>
                {isSignUp ? "회원가입" : "로그인"}
            </h3>

            <div className={style.formContainer}>
                <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                    {isSignUp && (
                        <div className={style.inputGroup}>
                            <label htmlFor="name">이름</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={style.inputStyle}
                            />
                        </div>
                    )}

                    <div className={style.inputGroup}>
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={style.inputStyle}
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={style.inputStyle}
                        />
                    </div>

                    {error && <p className={style.errorText}>{error}</p>}

                    <div className={style.buttonGroup}>
                        <TitleTextBlock>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: "black", border: "none" }}
                            >
                                <p style={{ color: "white" }}>
                                    {loading ? "처리중..." : isSignUp ? "회원가입" : "로그인"}
                                </p>
                            </button>
                        </TitleTextBlock>
                    </div>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className={style.toggleButton}
                >
                    {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                </button>
            </div>
        </div>
    );
}
