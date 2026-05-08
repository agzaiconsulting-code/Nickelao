import { prisma } from '@/lib/prisma'
import PortfolioClient from './PortfolioClient'

export default async function PortfolioPage() {
  try {
    const images = await prisma.portfolioImage.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        client: { select: { name: true, image: true } },
        review: { select: { rating: true, text: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { comments: true } },
      },
    })

    const serialized = images.map(img => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
      comments: img.comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    }))

    return <PortfolioClient initialImages={serialized} />
  } catch {
    return <PortfolioClient initialImages={[]} />
  }
}
