"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiData, useApiWrite } from "@/lib/use-api-data";
import { motion } from "framer-motion";
import { FormEvent } from "react";

export default function HomePage() {
  const products = useApiData<Record<string, unknown>[]>("/products?sort=-createdAt");
  const addProduct = useApiWrite("/products", "POST");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      "releasedAt": String(data.get("releasedAt") ?? ""),
      "available": data.get("available") === "on",
      "stock": Number(data.get("stock")),
      "price": Number(data.get("price")),
      "name": String(data.get("name") ?? ""),
    };
    try {
      await addProduct.run(values);
      await products.reload();
      form.reset();
    } catch {
      // Surfaced through the Write Block's `error`.
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <form onSubmit={onSubmit}><Table><TableHeader><TableRow><TableHead>name</TableHead><TableHead>price</TableHead><TableHead>stock</TableHead><TableHead>available</TableHead><TableHead>releasedAt</TableHead></TableRow></TableHeader><TableBody>{products.loading ? (<TableRow><TableCell>Loading…</TableCell></TableRow>) : products.error ? (<TableRow><TableCell>{products.error.message}</TableCell></TableRow>) : (products.data ?? []).length === 0 ? (<TableRow><TableCell>No records yet.</TableCell></TableRow>) : null}{(products.data ?? []).map((row, index) => (<TableRow key={index}>{["name", "price", "stock", "available", "releasedAt"].map((key) => (<TableCell key={key}>{String(row[key] ?? "")}</TableCell>))}</TableRow>))}</TableBody></Table><label className="flex flex-col gap-1 text-sm"><span>name</span><Input name="name" /></label><label className="flex flex-col gap-1 text-sm"><span>price</span><Input type="number" name="price" /></label><label className="flex flex-col gap-1 text-sm"><span>stock</span><Input type="number" name="stock" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded border" name="available" />available</label><label className="flex flex-col gap-1 text-sm"><span>releasedAt</span><Input type="datetime-local" name="releasedAt" /></label><Button type="submit">Add</Button>{addProduct.error && <p className="text-sm text-red-500">{addProduct.error.message}</p>}</form>
    </motion.div>
  );
}
