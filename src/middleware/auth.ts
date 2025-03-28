import type { AppEnvVariables } from "@/utils/env"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { jwtPayload, type JwtPayloadType } from "@/utils/zod/jwt"
import jwt from "jsonwebtoken"
type Options = {
    session_name: string
}

export type Variables = {
    payload: JwtPayloadType,
} & AppEnvVariables

export function auth() {
    return createMiddleware<{ Variables: Variables }>(async (c, next) => {
        //validate session token
        const authorization = c.req.header("Authorization");

        if (!authorization) {
            return c.json({
                "message": "Token is not found"
            }, 422)
        }

        var token = authorization.split(" ");
        if (token.length != 2) {
            return c.json({
                "message": "Token is not invalid"
            }, 422)
        }

        var jwtToken = token[1]
        let payload: JwtPayloadType;

        try {
            payload = jwtPayload.parse(await jwt.verify(jwtToken, c.var.JWT_SECRET));
        } catch (error) {
            throw new HTTPException(401, {
                res: Response.json({
                    error: "Unauthorization",
                }, { status: 401 })
            })
        }

        if (payload.exp < (Date.now() / 1000)) {
            throw new HTTPException(401, {
                res: Response.json({
                    error: "Token Expired",
                }, { status: 401 })
            })
        }

        c.set("payload", payload);

        await next();
    })
}