/*
  Warnings:

  - The primary key for the `_CartItemToIngredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_IngredientToProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_CartItemToIngredient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_IngredientToProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_AB_pkey";

-- AlterTable
ALTER TABLE "_IngredientToProduct" DROP CONSTRAINT "_IngredientToProduct_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToIngredient_AB_unique" ON "_CartItemToIngredient"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_IngredientToProduct_AB_unique" ON "_IngredientToProduct"("A", "B");
