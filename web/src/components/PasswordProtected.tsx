import { TextField, Typography, Box, Button } from "@mui/material";
import { ChangeEvent, FormEvent, memo, ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import NetworkGraph from "./other/NetworkGraph";
import { Canvas } from "@react-three/fiber";
interface PasswordProtectedProps {
    children: ReactNode;
}
const isProduction = import.meta.env.MODE === "production";
const apiRootPath = isProduction ? "" : "/api";

/**
 * `PasswordProtected` is a React component that wraps its children with password protection.
 * It renders a form that asks the user for a password. When the form is submitted, it sends a POST request to the '/verify-password' endpoint with the entered password.
 * If the server responds with a status of OK, the component sets `isAuthenticated` to true and renders its children.
 * If the server responds with an error, the component displays the error message.
 *
 * @component
 * @param {ReactNode} children - The children to render when the user is authenticated.
 */
function PasswordProtected({ children }: PasswordProtectedProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useLocalStorage<string | null>("csrfToken", null);
    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    useEffect(() => {
        const silentVerify = async () => {
            try {
                if (!csrfToken) return;

                const response = await fetch(apiRootPath + "/verify-token", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "x-csrf-token": csrfToken,
                    },
                });

                setIsAuthenticated(response.ok);
                if (csrfToken) {
                    setError("Your session has expired. Please log in again.");
                } else {
                    setError("Uh Oh.");
                }
            } catch (err) {
                console.error("Silent auth failed:", err);
                setIsAuthenticated(false);
                setError("An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        silentVerify();

        const interval = setInterval(silentVerify, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(apiRootPath + "/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            if (response.ok && data?.crsf_token) {
                setCsrfToken(data.crsf_token);
                setIsAuthenticated(true);
            } else {
                const { message } = data;
                console.error(message);
                setError(message);
            }
        } catch (error) {
            console.error(error);
            setError(
                "An error occurred while verifying the password. Please try again later.",
            );
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return children;
    }

    return (
        <Box sx={{ position: "relative", width: "100vw", height: "100vh" }}>
            <Canvas
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
                camera={{ position: [0, 0, 5], fov: 60 }}
                gl={{ antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <NetworkGraph />
            </Canvas>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "100%",
                    maxWidth: 400,
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto",
                    textAlign: "center",
                    top: "35%",
                    background: "black",
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <TextField
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    label="Password"
                    variant="filled"
                    fullWidth
                    autoComplete="current-password"
                />
                <Button
                    color="success"
                    loading={loading}
                    type="submit"
                    variant="contained"
                    fullWidth
                >
                    Log In
                </Button>
                {error && <Typography color="error">{error}</Typography>}
            </Box>
        </Box>
    );
}

export default memo(PasswordProtected);
