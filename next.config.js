module.exports = {
  allowedDevOrigins: ['192.168.29.29'],
  env: {
    NEXT_PUBLIC_GROQ_API_KEY:
      process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
    NEXT_PUBLIC_GROQ_MODEL:
      process.env.NEXT_PUBLIC_GROQ_MODEL || process.env.GROQ_MODEL,
  },
}
