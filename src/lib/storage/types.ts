import type { Guest, SiteContent, Wish } from "../types";

export type UploadInput = {
  filename: string;
  contentType: string;
  data: Buffer;
};

export type StoredFile = { id: string; url: string };

/**
 * Everything the app needs from a backend. Pages and admin only talk to this
 * interface, so swapping Apps Script for Supabase/Vercel Blob means writing one
 * new implementation and changing STORAGE_DRIVER.
 */
export interface Storage {
  /** null until content has been saved once (the app then uses seed data). */
  getContent(): Promise<SiteContent | null>;
  saveContent(content: SiteContent): Promise<void>;

  listGuests(): Promise<Guest[]>;
  /** Insert or update by id, in one round trip. */
  saveGuests(guests: Guest[]): Promise<void>;
  deleteGuest(id: string): Promise<void>;

  listWishes(): Promise<Wish[]>;
  saveWish(wish: Wish): Promise<void>;
  deleteWish(id: string): Promise<void>;

  /** Images and background music. */
  uploadFile(input: UploadInput): Promise<StoredFile>;
  /** Deletes a file this driver uploaded; ignores any other URL. */
  deleteFile(url: string): Promise<void>;
}
