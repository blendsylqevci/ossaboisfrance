import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "app/(payload)/admin/importMap.d.ts",
      "sources/**",
      "scratch/**",
      "scripts/**"
    ]
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
