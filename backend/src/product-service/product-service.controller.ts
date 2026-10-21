import { TOTAL_COUNT_HEADER, parseListQuery } from "../list-query";
import { AdminKeyGuard } from "./admin-key.guard";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";
import { ProductService } from "./product-service.service";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

@ApiTags("ProductService")
@Controller()
export class ProductServiceController {
  constructor(private readonly productService: ProductService) {}

  @Get("/products")
  async listProducts(@Query() query: Record<string, unknown>, @Res({ passthrough: true }) response: Response) {
    const page = await this.productService.listProducts(parseListQuery(query));
    response.setHeader(TOTAL_COUNT_HEADER, page.total);
    return page.items;
  }

  @Get("/products/:id")
  getProduct(@Param("id") id: string) {
    return this.productService.getProduct(id);
  }

  @Post("/products")
  createProduct(@Body() dto: CreateProductRequestDto) {
    return this.productService.createProduct(dto);
  }

  @UseGuards(AdminKeyGuard)
  @Put("/products/:id")
  updateProduct(@Param("id") id: string, @Body() dto: UpdateProductRequestDto) {
    return this.productService.updateProduct(id, dto);
  }

  @UseGuards(AdminKeyGuard)
  @Delete("/products/:id")
  deleteProduct(@Param("id") id: string) {
    return this.productService.deleteProduct(id);
  }
}
