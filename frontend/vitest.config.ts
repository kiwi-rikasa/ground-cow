import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    exclude: [
      ...configDefaults.exclude,
      "**/node_modules/**",
      "**/fixtures/**",
      "**/templates/**",
      "**/components/ui/**",
      "**/app/(pages)/dashboard/components/**",
      "**/app/api/auth/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        ...(configDefaults.coverage?.exclude || []),
        "**/components/ui/**",
        "**/lib/auth.ts",
        "**/app/(pages)/dashboard/components/**",
        "**/app/api/auth/**",
      ],
      include: ["**/lib/**", "**/components/**", "**/app/api/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
