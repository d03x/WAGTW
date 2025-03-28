import { z } from "zod";

export const createToken = z.object({
    session_name: z.string(),
    server_token: z.string()
})

export type CreateTokenType = z.infer<typeof createToken>