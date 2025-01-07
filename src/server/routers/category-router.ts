import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { startOfMonth } from "date-fns"

export const categoryRouter = router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
    // next({user})
    // const { user } = ctx

    const categories = await db.eventCategory.findMany({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        // new one first
        updatedAt: "desc",
      },
    })

    const categoriesWithCount = await Promise.all(
      // 다 끝나야 동작
      categories.map(async (category) => {
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)

        const [uniqueFieldCount, eventsCount, lastPing] = await Promise.all([
          db.event
            .findMany({
              where: {
                EventCategory: { id: category.id },
                createdAt: {
                  gte: firstDayOfMonth,
                },
              },
              select: {
                // Only Care about the count
                fields: true,
              },
              distinct: ["fields"],
              // email,
              // name
              // age
            })
            .then((events) => {
              const fieldNames = new Set<string>()
              events.forEach((event) => {
                Object.keys(event.fields as object).forEach((fieldName) => {
                  fieldNames.add(fieldName)
                })
              })
              // {name: "Matthew"}
              return fieldNames.size
            }),
          // how man event happen in this month
          db.event.count({
            where: {
              EventCategory: { id: category.id },
              createdAt: {
                gte: firstDayOfMonth,
              },
            },
          }),
          // last event happened (1days ago)
          db.event.findFirst({
            where: {
              EventCategory: { id: category.id },
            },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ])

        return {
          ...category,
          uniqueFieldCount,
          eventsCount,
          lastPing: lastPing?.createdAt || null,
        }
      })
    )

    return c.superjson({
      categories: categoriesWithCount,
    })
  }),
})

// JSON doesn't support date
// SuperJSON support date
// return new Response(JSON.stringify({ date: new Date() }))
