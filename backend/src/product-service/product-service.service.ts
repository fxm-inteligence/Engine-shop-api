import { ListQuery } from "../list-query";
import { withHooks } from "../with-hooks";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";
import { ProductRepository } from "./product-repository.repository";
import { hooks } from "./product-service.hooks";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  listProducts(query: ListQuery) {
    return this.productRepository.findPage(query);
  }

  async getProduct(id: string) {
    const record = await this.productRepository.findById(id);
    if (!record) throw new NotFoundException();
    return record;
  }

  createProduct(dto: CreateProductRequestDto) {
    return this.productRepository.create({ ...dto, releasedAt: dto.releasedAt === undefined ? undefined : new Date(dto.releasedAt), createdAt: dto.createdAt === undefined ? undefined : new Date(dto.createdAt) });
  }

  async updateProduct(id: string, dto: UpdateProductRequestDto) {
    const record = await this.productRepository.findById(id);
    if (!record) throw new NotFoundException();
    return this.productRepository.update(id, { ...dto, releasedAt: dto.releasedAt === undefined ? undefined : new Date(dto.releasedAt), createdAt: dto.createdAt === undefined ? undefined : new Date(dto.createdAt) });
  }

  async deleteProduct(id: string) {
    const record = await this.productRepository.findById(id);
    if (!record) throw new NotFoundException();
    return this.productRepository.remove(id);
  }
}

withHooks(ProductService.prototype, hooks);
