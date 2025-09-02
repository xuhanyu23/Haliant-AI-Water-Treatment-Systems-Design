-- CreateTable
CREATE TABLE "DesignRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemType" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "outputJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "model" TEXT,
    "specKey" TEXT,
    "unitCost" REAL,
    "vendor" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
