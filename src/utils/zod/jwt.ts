import { z } from "zod";

export const jwtPayload = z.object({
    session: z.string(),
    exp: z.number()
})

export type JwtPayloadType = z.infer<typeof jwtPayload>