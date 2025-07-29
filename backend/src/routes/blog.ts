import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";
import { verify, sign } from "hono/jwt";
import { createBlog, updateBlog } from "@yashlalage0501/medium-common"


export const blogRouter = new Hono<{
    Bindings: {
        JWT_SECRET: string,
        DATABASE_URL: string
    },
    Variables: {
        id: string
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const header = await c.req.header("Authorization") || "";
    const token = header.split(" ")[1];
    try {
        const response = await verify(token, c.env.JWT_SECRET);
        if (response.id) {
            c.set("id", response.id);
            return await next();
        }
        return c.json({ err: "Invalid user" }, 403);
    } catch (err) {
        console.log(err)
    }
})

//post users blog
blogRouter.post("/", async (c) => {
    let verSignPayload = createBlog.safeParse(await c.req.json());
    if (!verSignPayload.success) {
        return c.json({ error: "Inputs are wrong" }, 403)
    }
    let id = c.get("id");
    let { title, content, published = false } = await c.req.json();
    //make client instance
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.post.create({
            data: {
                title,
                content,
                published,
                authorId: id
            },
        })
        return c.json({ msg: "Post created successfully", blogId: blog.id }, 200);
    } catch (err) {
        return c.json({ "msg": "Not posted" }, 403)
    }
})

//update existing blog
blogRouter.put("/", async (c) => {
    let verSignPayload = updateBlog.safeParse(await c.req.json());
    if (!verSignPayload.success) {
        return c.json({ error: "Inputs are wrong" }, 403)
    }
    const id = c.get("id");
    let { title, content, blogId, published = false } = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        await prisma.post.update({
            where: {
                authorId: id,
                id: blogId,
            },
            data: {
                title,
                content,
                published
            }
        })
        return c.json({ "msg": "blog updated" }, 202);
    } catch (err) {
        return c.json({ "msg": "Not updated" }, 403)
    }
})

//put this before /:id because otherwise it will hit first and bulk will not hit
blogRouter.get("/bulk", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());
        let blogs = await prisma.post.findMany();
        return c.json({ "blogs": blogs }, 202);
    } catch (err) {
        return c.json({ "msg": "Invalid" }, 403)
    }
})

blogRouter.get("/:id", async (c) => {
    let id = await c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        let blog = await prisma.post.findUnique({
            where: {
                id
            }
        })
        return c.json({ blog }, 200);
    } catch (err) {
        return c.json({ "msg": "Invalid" }, 403)
    }
})
