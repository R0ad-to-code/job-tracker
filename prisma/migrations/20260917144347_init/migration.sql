-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "platformId" TEXT,
    "jobPostingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WISHLIST',
    "appliedDate" DATETIME,
    "location" TEXT,
    "salaryRange" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "cvVersionId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_cvVersionId_fkey" FOREIGN KEY ("cvVersionId") REFERENCES "CvVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "StatusChange_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CvProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "fullName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "summary" TEXT,
    "skills" JSONB NOT NULL DEFAULT [],
    "experience" JSONB NOT NULL DEFAULT [],
    "education" JSONB NOT NULL DEFAULT [],
    "languages" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CvVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "filePath" TEXT,
    "latexSource" TEXT,
    "compiledAt" DATETIME,
    "compileError" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "username" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "applicationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Todo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
