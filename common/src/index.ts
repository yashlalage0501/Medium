import z from "zod";

export const signupInput = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6)
});

export type SignupInput = z.infer<typeof signupInput>;


export const createBlog = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
})

export type CreateBlog = z.infer<typeof createBlog>


export const updateBlog = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
    blogId: z.string(),
})

export type UpdateBlog = z.infer<typeof updateBlog>

