import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'//for edge env's like cloudeflare workrs
// import { decode, sign, verify } from 'hono/jwt'
import { sign, verify } from 'hono/jwt'
import { signupInput } from '@yashlalage0501/medium-common'
//app inatalization

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();


userRouter.post('/signup', async (c) => {
    let verSignPayload = signupInput.safeParse(await c.req.json());
    if (!verSignPayload.success) {
        return c.json({ error: "Inputs are wrong" }, 403)
    }
    let { email, name, password } = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        let isAlreadyPresent = await prisma.user.findFirst({
            where: {
                email
            }
        })
        //if present then do not add user
        if (isAlreadyPresent) {
            return c.text("Email already taken");
        }
        //if not then add new user
        const user = await prisma.user.create({
            data: {
                email,
                password,
                name,
            }
        })
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (err) {
        return c.status(403)
    }
})

userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const user = await prisma.user.findUnique({
        where: {
            email: body.email,
            password: body.password
        }
    })
    if (!user) {
        return c.json({ error: "Uset not present" }, 403)
    }
    //if user presnt reutnrn jwt
    let jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
})
