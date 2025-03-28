import { envSchema, type AppEnvVariables } from "./env";
import { createFactory } from "hono/factory";
import * as dotenv from "dotenv"
dotenv.config()

export type Variables = Record<string, unknown> & AppEnvVariables;
export const EnvVariables = envSchema.parse(process.env);

export const factory = createFactory<{
    Variables: Variables
}>({
    initApp(app) {
        app.use(async (c, next) => {
            for (const [key, value] of Object.entries(EnvVariables)) {
                c.set(key as keyof AppEnvVariables, value)
            }
            await next()
        })
    },
});
