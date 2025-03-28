import { z } from "zod";

const startSessionSchema = z.object({
    with_pairing_code: z.boolean(),
    phone: z.string()
})

export type StartSession = z.infer<typeof startSessionSchema>

export { startSessionSchema }