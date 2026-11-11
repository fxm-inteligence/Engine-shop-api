import { checkRules } from "../auth-crypto";
import { ListQuery } from "../list-query";
import { withHooks } from "../with-hooks";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { PatchProductRequestDto } from "./dto/patch-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";
import { ProductRepository } from "./product-repository.repository";
import { hooks } from "./product-service.hooks";
import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";

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
    const problems = checkRules(dto, [["name", "required", ""], ["name", "minLength", "2"], ["price", "min", "0"], ["stock", "min", "0"]], false);
    if (problems.length > 0) throw new UnprocessableEntityException(problems.join("; "));
    return this.productRepository.create({ ...dto, releasedAt: dto.releasedAt === undefined ? undefined : new Date(dto.releasedAt), createdAt: dto.createdAt === undefined ? undefined : new Date(dto.createdAt) });
  }

  async updateProduct(id: string, dto: UpdateProductRequestDto) {
    const problems = checkRules(dto, [["name", "required", ""], ["name", "minLength", "2"], ["price", "min", "0"], ["stock", "min", "0"]], false);
    if (problems.length > 0) throw new UnprocessableEntityException(problems.join("; "));
    const record = await this.productRepository.findById(id);
    if (!record) throw new NotFoundException();
    return this.productRepository.update(id, { ...dto, releasedAt: dto.releasedAt === undefined ? undefined : new Date(dto.releasedAt), createdAt: dto.createdAt === undefined ? undefined : new Date(dto.createdAt) });
  }

  async patchProduct(id: string, dto: PatchProductRequestDto) {
    const problems = checkRules(dto, [["name", "required", ""], ["name", "minLength", "2"], ["price", "min", "0"], ["stock", "min", "0"]], true);
    if (problems.length > 0) throw new UnprocessableEntityException(problems.join("; "));
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
