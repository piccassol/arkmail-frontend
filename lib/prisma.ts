export const prisma: any = new Proxy({}, {
  get() {
    throw new Error('Prisma is disabled for this deployment')
  }
})
