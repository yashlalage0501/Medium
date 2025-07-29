import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'//for edge env's like cloudeflare workrs
// import { decode, sign, verify } from 'hono/jwt'
import { sign, verify } from 'hono/jwt'
import { defaultExtensionMap } from 'hono/ssg';
import { itxClientDenyList } from '@prisma/client/runtime/library';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
//app inatalization
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",blogRouter);

export default app
