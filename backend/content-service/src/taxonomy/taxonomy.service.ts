import { Prisma, PrismaService, RecordStatus } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  slugify,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable } from '@nestjs/common';

interface ListQuery {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
}

/**
 * Categories and subcategories are shared reference data: the gallery, albums
 * and articles all point at them, so this service owns them and the other
 * domains read them through the gateway.
 */
@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories(query: ListQuery): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.CategoryWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { name: query.sortDir },
        include: {
          subcategories: {
            where: { status: RecordStatus.ACTIVE },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, status: true },
          },
          _count: { select: { subcategories: true } },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  async findOneCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { subcategories: { orderBy: { name: 'asc' } } },
    });

    if (!category) throw ServiceException.notFound(`No category exists with id ${id}.`);

    return category;
  }

  async createCategory(payload: { data: { name: string; description?: string } }) {
    try {
      return await this.prisma.category.create({
        data: {
          name: payload.data.name,
          slug: slugify(payload.data.name),
          description: payload.data.description ?? null,
          status: RecordStatus.ACTIVE,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'category');
    }
  }

  async updateCategory(payload: {
    id: number;
    data: { name?: string; description?: string; status?: RecordStatus };
  }) {
    const { id, data } = payload;

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.name ? slugify(data.name) : undefined,
          description: data.description,
          status: data.status,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'category');
    }
  }

  async removeCategory(payload: { id: number }) {
    const category = await this.prisma.category.findUnique({
      where: { id: payload.id },
      include: { _count: { select: { subcategories: true, albums: true, committeeMedia: true } } },
    });

    if (!category) throw ServiceException.notFound(`No category exists with id ${payload.id}.`);

    const inUse =
      category._count.subcategories + category._count.albums + category._count.committeeMedia;

    // Deleting would cascade into subcategories and orphan albums and media.
    if (inUse > 0) {
      throw ServiceException.conflict(
        `"${category.name}" is still in use by ${inUse} record(s). Deactivate it instead.`,
        { counts: category._count },
      );
    }

    await this.prisma.category.delete({ where: { id: payload.id } });

    return { id: payload.id, deleted: true as const };
  }

  async findAllSubcategories(payload: { categoryId?: number }) {
    return this.prisma.subcategory.findMany({
      where: payload.categoryId ? { categoryId: payload.categoryId } : {},
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async createSubcategory(payload: {
    data: { categoryId: number; name: string; description?: string };
  }) {
    const category = await this.prisma.category.findUnique({
      where: { id: payload.data.categoryId },
      select: { id: true },
    });

    if (!category) throw ServiceException.badRequest('The selected category does not exist.');

    try {
      return await this.prisma.subcategory.create({
        data: {
          categoryId: payload.data.categoryId,
          name: payload.data.name,
          slug: slugify(payload.data.name),
          description: payload.data.description ?? null,
          status: RecordStatus.ACTIVE,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'subcategory');
    }
  }

  async updateSubcategory(payload: {
    id: number;
    data: { name?: string; description?: string; status?: RecordStatus };
  }) {
    try {
      return await this.prisma.subcategory.update({
        where: { id: payload.id },
        data: {
          name: payload.data.name,
          slug: payload.data.name ? slugify(payload.data.name) : undefined,
          description: payload.data.description,
          status: payload.data.status,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'subcategory');
    }
  }

  async removeSubcategory(payload: { id: number }) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: payload.id },
      include: { _count: { select: { articles: true, albums: true, committeeMedia: true } } },
    });

    if (!subcategory) {
      throw ServiceException.notFound(`No subcategory exists with id ${payload.id}.`);
    }

    const inUse =
      subcategory._count.articles + subcategory._count.albums + subcategory._count.committeeMedia;

    if (inUse > 0) {
      throw ServiceException.conflict(
        `"${subcategory.name}" is still in use by ${inUse} record(s). Deactivate it instead.`,
        { counts: subcategory._count },
      );
    }

    await this.prisma.subcategory.delete({ where: { id: payload.id } });

    return { id: payload.id, deleted: true as const };
  }
}
