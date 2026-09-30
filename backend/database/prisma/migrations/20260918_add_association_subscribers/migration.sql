CREATE TABLE "association_subscribers" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "name" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "association_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "association_subscribers_association_id_idx" ON "association_subscribers"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "association_subscribers_association_id_email_key" ON "association_subscribers"("association_id", "email");

-- AddForeignKey
ALTER TABLE "association_subscribers" ADD CONSTRAINT "association_subscribers_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

