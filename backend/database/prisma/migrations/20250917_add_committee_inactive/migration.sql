-- Add INACTIVE status for puja committee applications (Laravel parity)
ALTER TYPE "CommitteeStatus" ADD VALUE IF NOT EXISTS 'INACTIVE';
