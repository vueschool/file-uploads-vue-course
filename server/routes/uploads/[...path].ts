export default defineEventHandler(async (event) => {
  const storage = useStorage("uploads");
  const path = await getRouterParam(event, "path");

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path is required",
    });
  }

  const file = await storage.getItemRaw(path);

  return file;
});
