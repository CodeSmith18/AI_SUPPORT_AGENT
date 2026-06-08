export type AppEnv = {
  port: number;
  frontendOrigin: string;
  databasePath: string;
  frontendDistPath: string;
  groqApiKey?: string;
  groqModel: string;
};

export function getEnv(): AppEnv {
  return {
    port: Number(process.env.PORT ?? 4000),
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    databasePath: process.env.DATABASE_PATH ?? "./data/spur-support.db",
    frontendDistPath: process.env.FRONTEND_DIST_PATH ?? "../frontend/dist",
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"
  };
}
