import { ProductRepository } from "./product-repository.repository";
import { ProductServiceController } from "./product-service.controller";
import { ProductService } from "./product-service.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [ProductServiceController],
  providers: [ProductService, ProductRepository],
})
export class ProductServiceModule {}
