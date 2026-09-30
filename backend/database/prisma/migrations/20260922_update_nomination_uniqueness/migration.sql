-- Step 1: Backfill any existing NULL categories with a fallback before enforcing NOT NULL (non-destructive guarantee)
UPDATE "sharad_samman_nominations"
SET "category" = 'General'
WHERE "category" IS NULL;

-- Step 2: Make category NOT NULL
ALTER TABLE "sharad_samman_nominations"
ALTER COLUMN "category" SET NOT NULL;

-- Step 3: Drop existing unique index on (contest_id, puja_committee_id)
DROP INDEX IF EXISTS "sharad_samman_nominations_contest_id_puja_committee_id_key";

-- Step 4: Create new unique index on (contest_id, puja_committee_id, category)
CREATE UNIQUE INDEX "sharad_samman_nominations_contest_id_puja_committee_id_category_key"
ON "sharad_samman_nominations"("contest_id", "puja_committee_id", "category");
