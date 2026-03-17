// src/lib/db/search.repository.ts
import { prisma } from './prisma';
import type { Source } from '@/types';

export const searchRepository = {
  async create(query: string, answer: string, sources: Source[]) {
    return prisma.search.create({
      data: {
        query,
        answer,
        sources: {
          create: sources.map((s) => ({
            url: s.url,
            title: s.title,
            snippet: s.snippet,
            favicon: s.favicon ?? null,
          })),
        },
      },
      include: { sources: true, followUps: true },
    });
  },

  async findById(id: string) {
    return prisma.search.findUnique({
      where: { id },
      include: { sources: true, followUps: true },
    });
  },

  async findHistory(limit = 20) {
    return prisma.search.findMany({
      select: { id: true, query: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async addFollowUp(searchId: string, question: string, answer: string) {
    return prisma.followUp.create({
      data: { searchId, question, answer },
    });
  },

  async delete(id: string) {
    return prisma.search.delete({ where: { id } });
  },
};
