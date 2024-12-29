import { currentUser } from "@clerk/nextjs/server"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { db } from "@/db"

// trpc => wellknown type safe next.js api
export const authRouter = router({
  // c -> ctx
  getDatabaseSyncStatus: privateProcedure.query(async ({ c, ctx }) => {
    const auth = await currentUser()

    if (!auth) {
      return c.json({ isSynced: false })
    }

    const user = await db.user.findFirst({
      where: {
        externalId: auth.id,
      },
    })

    if (!user) {
      await db.user.create({
        data: {
          quotaLimit: 100,
          email: auth.emailAddresses[0].emailAddress,
          externalId: auth.id,
        },
      })

      return c.json({ isSynced: true })
    }

    return c.json({ isSynced: true })
  }),
})

// // route.ts와 동일
// export const GET = (req: Request) => {
//   return new Response(JSON.stringify({ status: "success" }))
// }
