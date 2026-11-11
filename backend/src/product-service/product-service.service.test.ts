import { strict as assert } from "node:assert";
import { test } from "node:test";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import type { ProductRepository } from "./product-repository.repository";
import { ProductService } from "./product-service.service";

type Row = Record<string, any>;

/** A Repository that keeps its rows in memory, so the Service is tested without a database. */
function setup() {
  const rows = new Map<any, Row>();
  let next = 1;
  const repository = {
    findPage: async () => ({ items: [...rows.values()], total: rows.size }),
    findById: async (id: any) => rows.get(id) ?? null,
    findByField: async (field: string, value: unknown) =>
      [...rows.values()].find((row) => row[field] === value) ?? null,
    create: async (data: Row) => {
      const row = { id: String(next++), ...data };
      rows.set(row.id, row);
      return row;
    },
    update: async (id: any, data: Row) => {
      const row = { ...rows.get(id), ...data };
      rows.set(id, row);
      return row;
    },
    remove: async (id: any) => {
      const row = rows.get(id);
      rows.delete(id);
      return row;
    },
  };
  const service = new ProductService(repository as unknown as ProductRepository);
  return { service: service as any, rows };
}

function sample(): Row {
  return { name: "sample", price: 1.5, stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" };
}

test("createProduct stores the record and answers with its id", async () => {
  const { service, rows } = setup();
  const created = await service.createProduct(sample() as never);
  assert.notEqual(created.id, undefined);
  assert.equal(rows.size, 1);
  assert.equal(created.name, sample().name);
});

test("listProducts answers with the stored records and their total", async () => {
  const { service } = setup();
  await service.createProduct(sample() as never);
  const page = await service.listProducts({ search: undefined, sort: undefined, offset: 0, limit: undefined });
  assert.equal(page.total, 1);
  assert.equal(page.items.length, 1);
});

test("getProduct answers with the stored record", async () => {
  const { service } = setup();
  const created = await service.createProduct(sample() as never);
  const found = await service.getProduct(created.id);
  assert.equal(found.id, created.id);
});

test("getProduct answers 404 for an id that does not exist", async () => {
  const { service } = setup();
  await assert.rejects(async () => service.getProduct("missing-id"), NotFoundException);
});

test("updateProduct changes the stored record", async () => {
  const { service, rows } = setup();
  const created = await service.createProduct(sample() as never);
  await service.updateProduct(created.id, { name: "updated", price: 1.5, stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" } as never);
  assert.equal(rows.get(created.id)?.name, "updated");
});

test("updateProduct answers 404 for an id that does not exist", async () => {
  const { service } = setup();
  await assert.rejects(async () => service.updateProduct("missing-id", { name: "updated", price: 1.5, stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" } as never), NotFoundException);
});

test("deleteProduct removes the record", async () => {
  const { service, rows } = setup();
  const created = await service.createProduct(sample() as never);
  await service.deleteProduct(created.id);
  assert.equal(rows.size, 0);
});

test("deleteProduct answers 404 for an id that does not exist", async () => {
  const { service } = setup();
  await assert.rejects(async () => service.deleteProduct("missing-id"), NotFoundException);
});

test("createProduct refuses a request that breaks the rule name required", async () => {
  const { service, rows } = setup();
  await assert.rejects(async () => service.createProduct({ price: 1.5, stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" } as never), UnprocessableEntityException);
  assert.equal(rows.size, 0);
});

test("createProduct refuses a request that breaks the rule name minLength 2", async () => {
  const { service, rows } = setup();
  await assert.rejects(async () => service.createProduct({ price: 1.5, stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z", name: "x" } as never), UnprocessableEntityException);
  assert.equal(rows.size, 0);
});

test("createProduct refuses a request that breaks the rule price min 0", async () => {
  const { service, rows } = setup();
  await assert.rejects(async () => service.createProduct({ name: "sample", stock: 1, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z", price: -1 } as never), UnprocessableEntityException);
  assert.equal(rows.size, 0);
});

test("createProduct refuses a request that breaks the rule stock min 0", async () => {
  const { service, rows } = setup();
  await assert.rejects(async () => service.createProduct({ name: "sample", price: 1.5, available: true, releasedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z", stock: -1 } as never), UnprocessableEntityException);
  assert.equal(rows.size, 0);
});
