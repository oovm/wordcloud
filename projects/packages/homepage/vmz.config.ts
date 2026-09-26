import { defineConfig } from "@vmz/vmz";

export default defineConfig({
    delivery: {
        default: "static",
        profiles: {
            static: { host: "browser", assembly: "web-static", name: "cdn" },
        },
    },
});
