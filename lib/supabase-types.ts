import type { MergeDeep } from 'type-fest';
import type { Database as __Database } from './supabase-types.gen';

export type Database = MergeDeep<
  __Database,
  {
    public: {
      Tables: {
        transfers: Table<{
          assets: TransferAsset[];
        }>;
      };
    };
  }
>;

type Table<T> = {
  Row: T;
  Insert: MakeNullableOptional<T>;
  Update: Partial<T>;
};

type MakeNullableOptional<T> = {
  // 1. Create an object with all the required (non-nullable) properties
  [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
  // 2. Create an object with all the optional (nullable) properties
  [K in keyof T as null extends T[K] ? K : never]?: T[K];
};

interface TransferAsset {
  id: number;
  name: string;
  size: number;
  mimeType?: string;
}
