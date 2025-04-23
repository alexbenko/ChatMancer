export default function apiPath() {
    const isProduction = import.meta.env.MODE === "production";
    const apiRootPath = isProduction ? "" : "/api";

    return { isProduction, apiRootPath };
}
