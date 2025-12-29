/*
  Warnings:

  - You are about to drop the column `darkMode` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'SYSTEM', 'DARK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "themePreference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM';

-- DataMigration
UPDATE "User"
SET "themePreference" = CASE
  WHEN "darkMode" = true THEN 'DARK'::"ThemePreference"
  ELSE 'LIGHT'::"ThemePreference"
END;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "darkMode";
