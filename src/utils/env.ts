import { z } from "zod";

export const envSchema = z.object({
    SERVER_SECRET_CODE: z.string(),
    JWT_SECRET: z.string()
})

export type AppEnvVariables = z.infer<typeof envSchema>