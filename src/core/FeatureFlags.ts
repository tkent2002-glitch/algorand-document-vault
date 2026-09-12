export const FEATURE_FLAGS = Object.freeze({
  merkleBatchAnchoring:
    import.meta.env.VITE_ENABLE_MERKLE_BATCH_ANCHORING !== "false",
});
