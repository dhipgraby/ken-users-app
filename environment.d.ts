declare global {
  namespace NodeJS {
    // Preserve NodeJS declaration merging; this is an augmentation, not an object type.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv {
    }
  }
}

export {};
