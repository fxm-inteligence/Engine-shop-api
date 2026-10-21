import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import type { ListQuery, Page } from "../list-query";

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  stock: number;
  available?: boolean;
  releasedAt?: Date;
  createdAt?: Date;
}

function searchWhere(search: string | undefined) {
  if (search === undefined) return undefined;
  return {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
    ],
  };
}

function orderBy(sort: ListQuery["sort"]) {
  const direction = sort?.descending ? ("desc" as const) : ("asc" as const);
  switch (sort?.field) {
    case "id":
      return [{ id: direction }];
    case "name":
      return [{ name: direction }, { id: "asc" as const }];
    case "price":
      return [{ price: direction }, { id: "asc" as const }];
    case "stock":
      return [{ stock: direction }, { id: "asc" as const }];
    case "available":
      return [{ available: direction }, { id: "asc" as const }];
    case "releasedAt":
      return [{ releasedAt: direction }, { id: "asc" as const }];
    case "createdAt":
      return [{ createdAt: direction }, { id: "asc" as const }];
    default:
      return [{ id: "asc" as const }];
  }
}

@Injectable()
export class ProductRepository {
  private readonly prisma = new PrismaClient();

  findPage(query: ListQuery): Promise<Page<ProductRecord>> {
    return Promise.all([
      this.prisma.product.findMany({ where: searchWhere(query.search), orderBy: orderBy(query.sort), skip: query.offset, take: query.limit }),
      this.prisma.product.count({ where: searchWhere(query.search) }),
    ]).then(([rows, total]) => ({ items: rows, total }));
  }

  findById(id: ProductRecord["id"]): Promise<ProductRecord | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  findByField(field: keyof ProductRecord & string, value: unknown): Promise<ProductRecord | null> {
    return this.prisma.product.findFirst({ where: { [field]: value } });
  }

  create(data: Omit<ProductRecord, "id">): Promise<ProductRecord> {
    return this.prisma.product.create({ data });
  }

  update(id: ProductRecord["id"], data: Partial<Omit<ProductRecord, "id">>): Promise<ProductRecord> {
    return this.prisma.product.update({ where: { id }, data });
  }

  remove(id: ProductRecord["id"]): Promise<ProductRecord> {
    return this.prisma.product.delete({ where: { id } });
  }
}
